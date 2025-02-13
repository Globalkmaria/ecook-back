import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { INewRecipe, IngredientNewProduct } from "../type.js";
import { getNewProductData, getNewRecipeData } from "../helper.js";
import { lightSlugify } from "../../../utils/normalize.js";
import { arrayToPlaceholders } from "../../../utils/query.js";

export const insertRecipe = async (
  info: INewRecipe,
  userId: number,
  connection: PoolConnection
): Promise<number> => {
  const values = getNewRecipeData(info, userId);
  const placeholder = arrayToPlaceholders(values);

  const [recipeResult] = await connection.execute<ResultSetHeader>(
    `INSERT INTO recipes (name, user_id, hours, minutes, description, steps) VALUES (${placeholder})`,
    values
  );

  return recipeResult.insertId;
};

export const insertRecipeImage = async (
  recipeId: number,
  img: string,
  userId: number,
  connection: PoolConnection
) => {
  const values = [img, userId];
  const placeholder = arrayToPlaceholders(values);

  const [imgResult] = await connection.query<ResultSetHeader>(
    `INSERT INTO imgs (url, user_id) VALUES (${placeholder})`,
    values
  );

  const imgId = imgResult.insertId;

  const values2 = [recipeId, imgId];
  const placeholder2 = arrayToPlaceholders(values2);
  await connection.query<ResultSetHeader>(
    `INSERT INTO recipe_imgs (recipe_id, img_id) VALUES (${placeholder2})`,
    values2
  );
};

export const insertTags = async (
  tags: string[],
  userId: number,
  recipeId: number,
  connection: PoolConnection
) => {
  const placeholder = tags.map(() => "(?, ?)").join(", ");
  const values = tags.flatMap((tag) => [userId, tag]);
  await connection.execute<ResultSetHeader>(
    `INSERT IGNORE INTO tags (user_id, name) VALUES ${placeholder}`,
    values
  );

  const [tagsIds] = await connection.query<RowDataPacket[]>(
    `SELECT id FROM tags WHERE name IN (?)`,
    [tags]
  );

  const placeholder2 = tagsIds.map(() => `(${recipeId}, ?)`).join(", ");
  const values2 = tagsIds.map((tag) => tag.id);
  await connection.query<ResultSetHeader>(
    `INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ${placeholder2}`,
    values2
  );
};

export const insertIngredients = async (
  ingredients: INewRecipe["ingredients"],
  filesKeys: Map<string, string>,
  userId: number,
  recipeId: number,
  connection: PoolConnection
) => {
  if (!ingredients.length) return;

  const normalizedIngredients = ingredients.map((ingredient) => ({
    ...ingredient,
    name: lightSlugify(ingredient.name),
  }));

  const ingredientNames = normalizedIngredients.map(
    (ingredient) => ingredient.name
  );

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
};

const getProductId = async (
  ingredient: INewRecipe["ingredients"][0],
  userId: number,
  connection: PoolConnection,
  filesKeys: Map<string, string>,
  ingredientId: number
) => {
  if (!hasNewProduct(ingredient.newProduct)) {
    return ingredient.productId;
  }

  const newProduct = ingredient.newProduct;

  const productId = await insertNewProduct(newProduct, userId, connection);

  const img = filesKeys.get(`img_${newProduct.id}`);
  img && (await linkProductImage(productId, img, userId, connection));

  ingredientId &&
    (await linkProductToIngredient(ingredientId, productId, connection));

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
  const placeholder = ingredientNames.map(() => "(?, ?)").join(", ");
  const values = ingredientNames.flatMap((name) => [name, userId]);

  await connection.execute<ResultSetHeader>(
    `INSERT IGNORE INTO ingredients (name, user_id) VALUES ${placeholder}`,
    values
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
  const values = [userId, ...getNewProductData(newProduct)];
  const placeholder = arrayToPlaceholders(values);

  const [result] = await connection.execute<ResultSetHeader>(
    `INSERT INTO products (user_id, name, brand, purchased_from, link) VALUES (${placeholder})`,
    values
  );
  return result.insertId;
};

const linkProductImage = async (
  productId: number,
  imgUrl: string,
  userId: number,
  connection: PoolConnection
) => {
  const values = [imgUrl, userId];
  const placeholder = arrayToPlaceholders(values);

  const [imgResult] = await connection.query<ResultSetHeader>(
    `INSERT INTO imgs (url, user_id) VALUES (${placeholder})`,
    values
  );

  const values2 = [productId, imgResult.insertId];
  const placeholder2 = arrayToPlaceholders(values2);
  await connection.query<ResultSetHeader>(
    `INSERT INTO product_imgs (product_id, img_id) VALUES (${placeholder2})`,
    values2
  );
};

const linkProductToIngredient = async (
  ingredientId: number,
  productId: number,
  connection: PoolConnection
) => {
  if (!ingredientId) return;

  const values = [ingredientId, productId];
  const placeholder = arrayToPlaceholders(values);

  await connection.query<ResultSetHeader>(
    `INSERT INTO ingredient_products (ingredient_id, product_id) VALUES (${placeholder})`,
    values
  );
};

const linkRecipeToIngredient = async (
  recipeId: number,
  ingredientId: number | null,
  productId: number | null,
  ingredient: INewRecipe["ingredients"][0],
  connection: PoolConnection
) => {
  const values = [
    recipeId,
    ingredientId ?? null,
    productId ?? null,
    ingredient.name,
    ingredient.quantity,
  ];
  const placeholder = arrayToPlaceholders(values);

  await connection.execute<ResultSetHeader>(
    `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, product_id, name, quantity) VALUES (${placeholder})`,
    values
  );
};

export const isRequiredFieldsPresent = (info: INewRecipe) =>
  info.name && info.steps;
