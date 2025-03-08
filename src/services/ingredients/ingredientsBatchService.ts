import { RowDataPacket } from "mysql2";

import mysqlDB from "../../db/mysql";

import { IngredientProduct, SimpleIngredient } from "./type";

export const getIngredients = async (ingredientIds: number[]) => {
  const [ingredients] = await mysqlDB.query<
    (Pick<SimpleIngredient, "ingredient_id" | "ingredient_name"> &
      RowDataPacket)[]
  >(
    `SELECT DISTINCT 
      i.id as ingredient_id, 
      i.name as ingredient_name
    FROM ingredients i
    WHERE i.id in (?) 
    ORDER BY i.id`,
    [ingredientIds]
  );

  return ingredients;
};

export const getProducts = async (productIds: number[]) => {
  const [products] = await mysqlDB.query<(IngredientProduct & RowDataPacket)[]>(
    `
  SELECT 
    i.id as ingredient_id, 
    i.name as ingredient_name, 
    p.id as product_id,
    p.name as product_name,
    p.brand as product_brand,
    p.purchased_from as product_purchased_from, 
    p_img.img as product_img 
  FROM ingredients i
  LEFT JOIN ingredient_products ip
    ON ip.ingredient_id = i.id
  LEFT JOIN products p
    ON p.id = ip.product_id
  LEFT JOIN product_img_view p_img
    ON p_img.product_id = p.id  
  WHERE p.id in (?)
  ORDER BY i.id
`,
    [productIds]
  );

  return products;
};
