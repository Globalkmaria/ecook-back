import mysqlDB from "../../db/mysql.js";
import { IngredientsBatchBody } from "../../controllers/ingredients/ingredientsBatchController.js";
import { extractIngredientAndProductIds } from "./utils.js";
import { RowDataPacket } from "mysql2";
import { IngredientProductQueryResult } from "./type.js";

export const fetchIngredientsWithProducts = async (
  items: IngredientsBatchBody["items"]
) => {
  const { ingredientIds, productIds } = extractIngredientAndProductIds(items);
  const queryParts: string[] = [];
  const queryValues: string[][] = [];

  if (ingredientIds.length > 0) {
    queryParts.push(`i.id IN (?)`);
    queryValues.push(ingredientIds);
  }

  if (productIds.length > 0) {
    queryParts.push(`p.id IN (?)`);
    queryValues.push(productIds);
  }

  const whereClause =
    queryParts.length > 0 ? `WHERE ${queryParts.join(" OR ")}` : "";

  const [result] = await mysqlDB.query<
    (IngredientProductQueryResult & RowDataPacket)[]
  >(
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
    ${whereClause}
    ORDER BY i.id
  `,
    queryValues
  );

  return result;
};
