import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

import {
  INewRecipe,
  IngredientNewProduct,
} from "../../../router/v1/recipes/recipes.js";
import { getNewProductData, getNewRecipeData } from "../helper.js";
import { lightSlugify } from "../../../utils/normalize.js";

export const insertRecipe = async (
  info: INewRecipe,
  userId: number,
  connection: PoolConnection
): Promise<number> => {
  const [recipeResult] = await connection.execute<ResultSetHeader>(
    `INSERT INTO recipes (name, user_id, hours, minutes, description, steps) VALUES (?,?,?,?,?,?)`,
    getNewRecipeData(info, userId)
  );

  return recipeResult.insertId;
};

export const insertRecipeImage = async (
  recipeId: number,
  img: string,
  userId: number,
  connection: PoolConnection
) => {
  const [imgResult] = await connection.query<ResultSetHeader>(
    `INSERT INTO imgs (url, user_id) VALUES (?,?)`,
    [img, userId]
  );

  const imgId = imgResult.insertId;

  await connection.query<ResultSetHeader>(
    `INSERT INTO recipe_imgs (recipe_id, img_id) VALUES (?,?)`,
    [recipeId, imgId]
  );
};

export const insertTags = async (
  tags: string[],
  userId: number,
  recipeId: number,
  connection: PoolConnection
) => {
  await connection.execute<ResultSetHeader>(
    `INSERT IGNORE INTO tags (user_id, name) VALUES ${tags
      .map(() => "(?, ?)")
      .join(", ")}`,
    tags.flatMap((tag) => [userId, tag])
  );

  const [tagsIds] = await connection.query<RowDataPacket[]>(
    `SELECT id FROM tags WHERE name IN (?)`,
    [tags]
  );

  await connection.query<ResultSetHeader>(
    `INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ${tagsIds
      .map(() => `(${recipeId}, ?)`)
      .join(", ")}`,
    tagsIds.map((tag) => tag.id)
  );
};

export const insertIngredients = async (
  ingredients: INewRecipe["ingredients"],
  filesKeys: Map<string, string>,
  userId: number,
  recipeId: number,
  connection: PoolConnection
) => {
  const normalizedIngredients = ingredients.map((ingredient) => ({
    ...ingredient,
    name: lightSlugify(ingredient.name),
  }));

  const ingredientNames = normalizedIngredients.map(
    (ingredient) => ingredient.name
  );

  if (normalizedIngredients.length) {
    await insertNewIngredients(ingredientNames, userId, connection);

    const ingredientMap = await fetchIngredientIds(ingredientNames, connection);

    normalizedIngredients.forEach(async (ingredient) => {
      const ingredientId = ingredientMap.get(ingredient.name) ?? null;
      const productId = ingredientId
        ? await getProductId(
            ingredient,
            userId,
            connection,
            filesKeys,
            ingredientId
          )
        : null;

      await linkRecipeToIngredient(
        recipeId,
        ingredientId,
        productId,
        ingredient,
        connection
      );
    });
  }
};

const getProductId = async (
  ingredient: INewRecipe["ingredients"][0],
  userId: number,
  connection: PoolConnection,
  filesKeys: Map<string, string>,
  ingredientId: number
) => {
  let productId = ingredient.productId;

  if (hasNewProduct(ingredient.newProduct)) {
    const newProduct = ingredient.newProduct;

    productId = await insertNewProduct(newProduct, userId, connection);

    const img = filesKeys.get(`img_${newProduct.id}`);
    img && (await linkProductImage(productId, img, userId, connection));

    ingredientId &&
      (await linkProductToIngredient(ingredientId, productId, connection));
  }

  return productId;
};

const hasNewProduct = (
  newProduct: INewRecipe["ingredients"][0]["newProduct"]
): newProduct is IngredientNewProduct =>
  !!(newProduct && Object.keys(newProduct).length);

const insertNewIngredients = async (
  ingredientNames: string[],
  userId: number,
  connection: PoolConnection
) => {
  await connection.execute<ResultSetHeader>(
    `INSERT IGNORE INTO ingredients (name, user_id) VALUES ${ingredientNames
      .map(() => "(?, ?)")
      .join(", ")}`,
    ingredientNames.flatMap((name) => [name, userId])
  );
};

const fetchIngredientIds = async (
  ingredientNames: string[],
  connection: PoolConnection
): Promise<Map<string, number>> => {
  const placeholders = ingredientNames.map(() => "?").join(", ");

  const [ingredientIds] = await connection.query<RowDataPacket[]>(
    `SELECT id, name FROM ingredients WHERE name IN (${placeholders}) ORDER BY FIELD(name, ${placeholders})`,
    [...ingredientNames, ...ingredientNames]
  );

  return new Map<string, number>(
    ingredientIds.map((ing) => [ing.name, ing.id])
  );
};

const insertNewProduct = async (
  newProduct: IngredientNewProduct,
  userId: number,
  connection: PoolConnection
): Promise<number> => {
  const [result] = await connection.execute<ResultSetHeader>(
    `INSERT INTO products (user_id, name, brand, purchased_from, link) VALUES (?,?,?,?,?)`,
    [userId, ...getNewProductData(newProduct)]
  );
  return result.insertId;
};

const linkProductImage = async (
  productId: number,
  imgUrl: string,
  userId: number,
  connection: PoolConnection
) => {
  const [imgResult] = await connection.query<ResultSetHeader>(
    `INSERT INTO imgs (url, user_id) VALUES (?,?)`,
    [imgUrl, userId]
  );

  await connection.query<ResultSetHeader>(
    `INSERT INTO product_imgs (product_id, img_id) VALUES (?,?)`,
    [productId, imgResult.insertId]
  );
};

const linkProductToIngredient = async (
  ingredientId: number,
  productId: number,
  connection: PoolConnection
) => {
  if (ingredientId) {
    await connection.query<ResultSetHeader>(
      `INSERT INTO ingredient_products (ingredient_id, product_id) VALUES (?,?)`,
      [ingredientId, productId]
    );
  }
};

const linkRecipeToIngredient = async (
  recipeId: number,
  ingredientId: number | null,
  productId: number | null,
  ingredient: INewRecipe["ingredients"][0],
  connection: PoolConnection
) => {
  await connection.execute<ResultSetHeader>(
    `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, product_id, name, quantity) VALUES (?,?,?,?,?)`,
    [
      recipeId,
      ingredientId ?? null,
      productId ?? null,
      ingredient.name,
      ingredient.quantity,
    ]
  );
};
