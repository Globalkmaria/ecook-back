import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

import mysqlDB from "../../../db/mysql";
import { lightSlugify } from "../../../utils/normalize";
import { arrayToPlaceholders } from "../../../utils/query";
import { ServiceError } from "../../helpers/ServiceError";
import { getNewProductData } from "../helper";
import { IngredientNewProduct } from "../type";

import { getTagsToInsertAndDelete, getUpdatedRecipeData } from "./helper";
import { EditRecipe , RecipeInfo , UpdateRecipeServiceParams } from "./type";


export const updateRecipeService = async ({
  recipeId,
  userId,
  info,
  filesKeys,
}: UpdateRecipeServiceParams) => {
  const connection = await mysqlDB.getConnection();
  try {
    await connection.beginTransaction();
    const oldRecipe = await getRecipe({ recipeId, userId });

    if (!oldRecipe)
      throw new ServiceError(404, "Recipe not found or unauthorized");

    if (oldRecipe.user_id !== userId) throw new ServiceError(403, "Forbidden");

    await updateRecipeInfo({ oldRecipe, newRecipe: info, connection });

    await updateImg({
      recipeId,
      userId,
      filesKeys,
      connection,
    });

    await updateTags({
      recipeId,
      userId,
      tags: info.tags,
      connection,
    });

    await updateIngredients({
      ingredients: info.ingredients,
      connection,
      recipeId,
      userId,
      filesKeys,
    });

    await connection.commit();
  } catch (error) {
    await connection.rollback();

    throw new ServiceError(
      error instanceof ServiceError ? error.status : 400,
      error instanceof ServiceError ? error.message : "Error updating recipe"
    );
  } finally {
    connection.release();
  }
};

const getRecipe = async ({
  recipeId,
  userId,
}: {
  recipeId: string;
  userId: number;
}) => {
  const [recipe] = await mysqlDB.execute<RecipeInfo[]>(
    `SELECT * FROM recipes WHERE id = ? AND user_id = ?`,
    [recipeId, userId]
  );

  return recipe[0];
};

const updateRecipeInfo = async ({
  oldRecipe,
  newRecipe,
  connection,
}: {
  oldRecipe: RecipeInfo;
  newRecipe: EditRecipe;
  connection: PoolConnection;
}) => {
  const updates = getUpdatedRecipeData({ newRecipe, oldRecipe });

  if (!updates.size) return;

  const updateFieldsPlaceholder = [...updates.keys()]
    .map((field) => `${field} = ?`)
    .join(", ");

  const updateValues = updates.values();

  await connection.execute(
    `UPDATE recipes SET ${updateFieldsPlaceholder} WHERE id = ?`,
    [...updateValues, oldRecipe.id]
  );
};

const updateImg = async ({
  recipeId,
  userId,
  filesKeys,
  connection,
}: {
  recipeId: string;
  userId: number;
  filesKeys: Map<string, string>;
  connection: PoolConnection;
}) => {
  const imgUrl = filesKeys.get("img");
  if (!imgUrl) return;

  const [existingImgs] = await connection.execute<
    ({
      img_id: number;
    } & RowDataPacket)[]
  >(`SELECT img_id FROM recipe_imgs WHERE recipe_id = ?`, [recipeId]);

  if (existingImgs.length) {
    updateRecipeImg({ imgUrl, imgId: existingImgs[0].img_id, connection });
  } else {
    createRecipeImg({ imgUrl, userId, recipeId, connection });
  }
};

const updateRecipeImg = async ({
  imgUrl,
  imgId,
  connection,
}: {
  imgUrl: string;
  imgId: number;
  connection: PoolConnection;
}) => {
  await connection.execute(`UPDATE imgs SET url = ? WHERE id = ?`, [
    imgUrl,
    imgId,
  ]);
};

const createRecipeImg = async ({
  imgUrl,
  userId,
  recipeId,
  connection,
}: {
  imgUrl: string;
  userId: number;
  recipeId: string;
  connection: PoolConnection;
}) => {
  const [imgResult] = await connection.execute<ResultSetHeader>(
    `INSERT INTO imgs (url, user_id) VALUES (?, ?)`,
    [imgUrl, userId]
  );

  await connection.execute<ResultSetHeader>(
    `INSERT INTO recipe_imgs (recipe_id, img_id) VALUES (?,?)`,
    [recipeId, imgResult.insertId]
  );
};

const deleteAllRecipeTags = async (
  recipeId: string,
  connection: PoolConnection
) => {
  await connection.execute(`DELETE FROM recipe_tags WHERE recipe_id = ?`, [
    recipeId,
  ]);
};

const getRecipeTagsToInsertAndDelete = async ({
  recipeId,
  currentTags,
  connection,
}: {
  recipeId: string;
  currentTags: string[];
  connection: PoolConnection;
}) => {
  const [existingTags] = await connection.query<
    (RowDataPacket & { name: string })[]
  >(
    `SELECT name FROM tags 
    WHERE id 
      IN (SELECT tag_id FROM recipe_tags WHERE recipe_id = ?)`,
    [recipeId]
  );

  const oldTags = existingTags.map((tag) => tag.name);
  return getTagsToInsertAndDelete(oldTags, currentTags);
};

const deleteRecipeTags = async ({
  recipeId,
  tagsToDelete,
  connection,
}: {
  recipeId: string;
  tagsToDelete: string[];
  connection: PoolConnection;
}) => {
  const placeholders = arrayToPlaceholders(tagsToDelete);
  await connection.execute(
    `DELETE rt
      FROM recipe_tags rt
      JOIN tags t ON rt.tag_id = t.id
      WHERE rt.recipe_id = ? 
        AND t.name IN (${placeholders});`,
    [recipeId, ...tagsToDelete]
  );
};

const insetRecipeTags = async ({
  recipeId,
  userId,
  tagsToInsert,
  connection,
}: {
  recipeId: string;
  userId: number;
  tagsToInsert: string[];
  connection: PoolConnection;
}) => {
  const placeholders = tagsToInsert.map(() => "(?, ?)").join(", ");
  const values = tagsToInsert.flatMap((tag) => [userId, tag]);
  await connection.execute(
    `INSERT IGNORE INTO tags (user_id, name) VALUES ${placeholders}`,
    values
  );

  const [tagsIds] = await connection.query<RowDataPacket[]>(
    `SELECT id FROM tags WHERE name IN (?)`,
    [tagsToInsert]
  );

  const placeholders2 = tagsToInsert.map(() => `(${recipeId}, ?)`).join(", ");
  const values2 = tagsIds.map((tag) => tag.id);

  await connection.execute(
    `INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ${placeholders2}`,
    values2
  );
};

const updateTags = async ({
  recipeId,
  userId,
  tags,
  connection,
}: {
  recipeId: string;
  userId: number;
  tags: EditRecipe["tags"];
  connection: PoolConnection;
}) => {
  if (!tags.length) {
    deleteAllRecipeTags(recipeId, connection);
  } else if (tags.length) {
    const { tagsToInsert, tagsToDelete } = await getRecipeTagsToInsertAndDelete(
      { recipeId, currentTags: tags, connection }
    );

    if (tagsToDelete.length)
      deleteRecipeTags({ recipeId, tagsToDelete, connection });

    if (tagsToInsert.length)
      insetRecipeTags({ recipeId, userId, tagsToInsert, connection });
  }
};

const updateIngredients = async ({
  ingredients,
  connection,
  recipeId,
  userId,
  filesKeys,
}: {
  ingredients: EditRecipe["ingredients"];
  connection: PoolConnection;
  recipeId: string;
  userId: number;
  filesKeys: Map<string, string>;
}) => {
  if (!ingredients.length) return;

  const ingredientNames = ingredients.map((ingredient) =>
    lightSlugify(ingredient.name)
  );

  await insertIngredients({ ingredientNames, userId, connection });

  const nameIdMap = await getIngredientNameAndIdMap(
    ingredientNames,
    connection
  );

  await deleteRecipeIngredients(recipeId, connection);

  for (const ingredient of ingredients) {
    const ingredientId = nameIdMap.get(ingredient.name);
    if (!ingredientId) continue;

    let productId = ingredient.productId;

    const newProduct = ingredient.newProduct;
    if (isThereNewProduct(newProduct)) {
      productId = await addNewProduct({
        userId,
        newProduct,
        filesKeys,
        nameIdMap,
        ingredient,
        connection,
      });
    }

    await linkRecipeWithIngredient({
      recipeId,
      ingredientId,
      productId,
      ingredient,
      connection,
    });
  }
};

const addNewProduct = async ({
  userId,
  newProduct,
  filesKeys,
  nameIdMap,
  ingredient,
  connection,
}: {
  userId: number;
  newProduct: IngredientNewProduct;
  filesKeys: Map<string, string>;
  nameIdMap: Map<string, number>;
  ingredient: EditRecipe["ingredients"][0];
  connection: PoolConnection;
}) => {
  const productId = await createNewProduct({
    userId,
    newProduct,
    connection,
  });

  await linkProductWithImg({
    userId,
    productId,
    filesKeys,
    newProduct,
    connection,
  });

  await linkIngredientWithProduct({
    ingredientNameAndIdMap: nameIdMap,
    productId,
    ingredient,
    connection,
  });

  return productId;
};

const insertIngredients = async ({
  ingredientNames,
  userId,
  connection,
}: {
  ingredientNames: string[];
  userId: number;
  connection: PoolConnection;
}) => {
  const placeholder = ingredientNames.map(() => `(?, ${userId})`).join(", ");
  await connection.execute(
    `INSERT IGNORE INTO ingredients (name, user_id) VALUES ${placeholder}`,
    ingredientNames
  );
};

const getIngredientNameAndIdMap = async (
  ingredientNames: string[],
  connection: PoolConnection
) => {
  const [ingredientsIds] = await connection.query<RowDataPacket[]>(
    `SELECT id, name FROM ingredients WHERE name IN (?) ORDER BY FIELD(name, ?)`,
    [ingredientNames, ingredientNames]
  );

  return new Map<string, number>(
    ingredientsIds.map((ingredient) => [ingredient.name, ingredient.id])
  );
};

const deleteRecipeIngredients = async (
  recipeId: string,
  connection: PoolConnection
) => {
  await connection.execute(
    `DELETE FROM recipe_ingredients WHERE recipe_id = ?`,
    [recipeId]
  );
};

const isThereNewProduct = (
  newProduct: EditRecipe["ingredients"][0]["newProduct"]
): newProduct is IngredientNewProduct =>
  !!newProduct && !!Object.keys(newProduct).length;

const createNewProduct = async ({
  userId,
  newProduct,
  connection,
}: {
  userId: number;
  newProduct: IngredientNewProduct;
  connection: PoolConnection;
}) => {
  const values = [userId, ...getNewProductData(newProduct)];
  const placeholder = arrayToPlaceholders(values);
  const [newProductId] = await connection.execute<ResultSetHeader>(
    `INSERT INTO products (user_id, name, brand, purchased_from, link) VALUES (${placeholder})`,
    values
  );

  return newProductId.insertId;
};

const linkProductWithImg = async ({
  userId,
  productId,
  filesKeys,
  connection,
  newProduct,
}: {
  userId: number;
  productId: number;
  filesKeys: Map<string, string>;
  newProduct: IngredientNewProduct;
  connection: PoolConnection;
}) => {
  const img = filesKeys.get(`img_${newProduct.id}`);
  if (!img) return;

  const [imgId] = await connection.execute<ResultSetHeader>(
    `INSERT INTO imgs (url, user_id) VALUES (?,?)`,
    [img, userId]
  );

  await connection.execute<ResultSetHeader>(
    `INSERT INTO product_imgs (product_id, img_id) VALUES (?,?)`,
    [productId, imgId.insertId]
  );
};

const linkIngredientWithProduct = async ({
  ingredientNameAndIdMap,
  productId,
  ingredient,
  connection,
}: {
  ingredientNameAndIdMap: Map<string, number>;
  productId: number;
  ingredient: EditRecipe["ingredients"][0];
  connection: PoolConnection;
}) => {
  await connection.execute<ResultSetHeader>(
    `INSERT INTO ingredient_products (ingredient_id, product_id) VALUES (?,?)`,
    [ingredientNameAndIdMap.get(ingredient.name), productId]
  );
};

const linkRecipeWithIngredient = async ({
  recipeId,
  ingredientId,
  productId,
  ingredient,
  connection,
}: {
  recipeId: string;
  ingredientId: number | null;
  productId: number | null;
  ingredient: EditRecipe["ingredients"][0];
  connection: PoolConnection;
}) => {
  const values = [
    recipeId,
    ingredientId ?? null,
    productId ?? null,
    ingredient.name,
    ingredient.quantity,
  ];
  const placeholder = arrayToPlaceholders(values);
  await connection.execute<ResultSetHeader>(
    `INSERT INTO recipe_ingredients 
      (recipe_id, ingredient_id, product_id, name, quantity) 
      VALUES (${placeholder})`,
    values
  );
};
