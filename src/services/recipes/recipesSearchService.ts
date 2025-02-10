import { lightSlugify, lightTrim, splitString } from "../../utils/normalize.js";
import mysqlDB from "../../db/mysql.js";
import { generateRecipeKey } from "../../router/v1/recipes/helper.js";
import { getImgUrl } from "../../utils/img.js";
import {
  SEARCH_TYPES,
  SearchRecipesQueryParams,
} from "../../controllers/recipes/recipesSearchController.js";
import { RecipesSimple } from "../../router/v1/recipes/recipes.js";

export const searchRecipesService = async ({
  q,
  type,
}: SearchRecipesQueryParams) => {
  let data: RecipesSimple[] = [];
  const trimmedQ = lightTrim(q ?? "");

  if (!trimmedQ) {
    data = await getRecentRecipes(10);
  } else if (type === SEARCH_TYPES.NAME) {
    data = await searchByName(trimmedQ);
  } else if (type === SEARCH_TYPES.TAG) {
    data = await searchByTag(trimmedQ);
  } else if (type === SEARCH_TYPES.INGREDIENT) {
    data = await searchByIngredient(trimmedQ);
  } else if (type === SEARCH_TYPES.PRODUCT) {
    data = await searchByProduct(trimmedQ);
  } else if (type === SEARCH_TYPES.USERNAME) {
    data = await searchByUsername(trimmedQ);
  }

  return formatSearchResult(data);
};

export const recommendRecipes = async () => {
  const result = await getRecentRecipes(10);
  return formatSearchResult(result);
};

export const getRecentRecipes = async (limit: number) => {
  const result = await mysqlDB.query<RecipesSimple[]>(
    `SELECT * FROM recipes_simple_view ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );
  return result[0];
};

const searchByName = async (query: string) => {
  const result = await mysqlDB.query<RecipesSimple[]>(
    `SELECT 
              r.id AS id,
              r.name AS name,
              r.created_at AS created_at,
              r.updated_at AS updated_at,
              r.hours AS hours,
              r.minutes AS minutes,
              ri.recipe_img AS img,
              u.img AS user_img,
              u.username AS user_username,
              u.id AS user_id,
              GROUP_CONCAT(tag_id SEPARATOR ',') AS tag_ids,
              GROUP_CONCAT(tag_name SEPARATOR ',') AS tag_names
          FROM
              (SELECT * FROM recipes WHERE REPLACE(LOWER(name), ' ','-' ) LIKE LOWER(?)) AS r
          JOIN 
              users_simple_view u ON u.id = r.user_id
          JOIN 
              recipe_img_view ri ON ri.recipe_id = r.id
          LEFT JOIN 
              recipe_tags_view rt ON rt.recipe_id = r.id
          GROUP BY r.id , ri.recipe_img 
          ORDER BY r.created_at DESC;
          `,
    [`%${query}%`]
  );
  return result[0];
};

const searchByTag = async (query: string) => {
  const result = await mysqlDB.query<RecipesSimple[]>(
    `SELECT 
              r.id AS id,
              r.name AS name,
              r.created_at AS created_at,
              r.updated_at AS updated_at,
              r.hours AS hours,
              r.minutes AS minutes,
              ri.recipe_img AS img,
              u.img AS user_img,
              u.username AS user_username,
              u.id AS user_id,
              GROUP_CONCAT(tag_id SEPARATOR ',') AS tag_ids,
              GROUP_CONCAT(tag_name SEPARATOR ',') AS tag_names
            FROM
              recipes r
            JOIN 
              (SELECT DISTINCT recipe_id FROM recipe_tags_view WHERE LOWER(tag_name) = LOWER(?)) filtered_recipes
              ON filtered_recipes.recipe_id = r.id
            JOIN 
              recipe_img_view ri ON ri.recipe_id = r.id
            LEFT JOIN 
              recipe_tags_view rt ON rt.recipe_id = r.id
            JOIN 
              users_simple_view u ON u.id = r.user_id
            GROUP BY r.id , ri.recipe_img 
            ORDER BY r.created_at DESC;
            `,
    [`${query}`]
  );

  return result[0];
};

const searchByIngredient = async (query: string) => {
  const result = await mysqlDB.query<RecipesSimple[]>(
    `SELECT 
              r.id AS id,
              r.name AS name,
              r.created_at AS created_at,
              r.updated_at AS updated_at,
              r.hours AS hours,
              r.minutes AS minutes,
              ri.recipe_img AS img,
              u.img AS user_img,
              u.username AS user_username,
              u.id AS user_id,
              GROUP_CONCAT(rt.tag_id SEPARATOR ',') AS tag_ids,
              GROUP_CONCAT(rt.tag_name SEPARATOR ',') AS tag_names
          FROM
              recipes r
          JOIN 
              (SELECT DISTINCT recipe_id FROM recipe_ingredients WHERE LOWER(name) LIKE LOWER(?)) filtered_recipes
              ON filtered_recipes.recipe_id = r.id
          JOIN 
              recipe_img_view ri ON ri.recipe_id = r.id
          LEFT JOIN 
              recipe_tags_view rt ON rt.recipe_id = r.id
          JOIN 
              users_simple_view u ON u.id = r.user_id
          GROUP BY 
              r.id, ri.recipe_img
              ORDER BY 
              r.created_at DESC;
          `,
    [`%${lightSlugify(query)}%`]
  );
  return result[0];
};

const searchByProduct = async (query: string) => {
  const result = await mysqlDB.query<RecipesSimple[]>(
    `
            SELECT 
                r.id AS id,
                r.name AS name,
                r.created_at AS created_at,
                r.updated_at AS updated_at,
                r.hours AS hours,
                r.minutes AS minutes,
                ri.recipe_img AS img,
                u.img AS user_img,
                u.username AS user_username,
                u.id AS user_id,
                GROUP_CONCAT(tag_id SEPARATOR ',') AS tag_ids,
                GROUP_CONCAT(tag_name SEPARATOR ',') AS tag_names
            FROM
              recipes r
            JOIN 
              (
                SELECT recipe_id
                  FROM 
                    (SELECT * FROM products WHERE REPLACE(LOWER(name), ' ', '-') LIKE REPLACE(LOWER(?), ' ', '-')) AS filtered_products
                  JOIN 
                recipe_ingredients rig ON rig.product_id = filtered_products.id
              ) 
              AS filtered_recipes	ON filtered_recipes.recipe_id = r.id
            JOIN 
                recipe_img_view ri ON ri.recipe_id = r.id
            LEFT JOIN 
                recipe_tags_view rt ON rt.recipe_id = r.id
            JOIN 
                users_simple_view u ON u.id = r.user_id
            GROUP BY r.id, r.name, r.created_at, r.updated_at, r.hours, r.minutes, ri.recipe_img, u.img, u.username, u.id
            ORDER BY r.created_at DESC;
            `,
    [`%${query}%`]
  );
  return result[0];
};

const searchByUsername = async (query: string) => {
  const result = await mysqlDB.execute<RecipesSimple[]>(
    `SELECT * FROM recipes_simple_view WHERE user_username = ? ORDER BY created_at DESC`,
    [query]
  );
  return result[0];
};

const formatSearchResult = (data: RecipesSimple[]) =>
  data.map((recipe) => {
    const tagIds = splitString(recipe.tag_ids);
    const tagNames = splitString(recipe.tag_names);
    const tags = tagIds.map((id, index) => ({
      id: parseInt(id, 10),
      name: tagNames[index],
    }));

    const key = generateRecipeKey(recipe.id, recipe.name);

    return {
      id: recipe.id,
      name: recipe.name,
      img: getImgUrl(recipe.img, true),
      tags,
      hours: recipe.hours,
      minutes: recipe.minutes,
      key,
      user: {
        username: recipe.user_username,
        img: getImgUrl(recipe.user_img),
      },
    };
  });
