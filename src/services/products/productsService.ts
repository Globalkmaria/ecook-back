import { GetProductsResponse } from "../../controllers/products/productsController";
import mysqlDB from "../../db/mysql";
import { lightSlugify, lightTrim } from "../../utils/normalize";
import { Ingredient } from "../ingredients/type";

import { formatClientProducts } from "./helper";
import { Product, SearchProductsData, SearchProductsParams } from "./type";
import { decryptProductKeyWithThrowError } from "./utils";


export const searchProducts = async ({
  type,
  query,
}: SearchProductsParams): Promise<GetProductsResponse> => {
  let data: SearchProductsData = { products: [], ingredientId: null };

  if (type === "ingredientName") {
    data = await searchByIngredientName(query);
  } else if (type === "username") {
    data = await searchByUsername(query);
  } else if (type === "productKey") {
    data = await searchByProductKey(query);
  }

  return {
    products: formatClientProducts(data.products),
    ingredientId: data.ingredientId,
  };
};

const searchByProductKey = async (
  query: string
): Promise<SearchProductsData> => {
  const productId = decryptProductKeyWithThrowError(query);

  const [products] = await mysqlDB.query<Product[]>(
    `SELECT DISTINCT 
        p.*, 
        i.id AS ingredient_id, 
        i.name AS ingredient_name
    FROM ingredient_products ip
    JOIN product_detail_view p 
        ON p.id = ip.product_id
    JOIN ingredients i 
        ON i.id = ip.ingredient_id
    JOIN ingredient_products ip_ref 
        ON ip_ref.ingredient_id = i.id
    WHERE p.id != ?
        AND ip_ref.product_id = ?
    ORDER BY p.created_at DESC;
    `,
    [productId, productId]
  );

  if (!products.length) return { ingredientId: null, products: [] };

  return {
    ingredientId: products[0].ingredient_id,
    products,
  };
};

const searchByUsername = async (query: string): Promise<SearchProductsData> => {
  const username = lightTrim(query);

  const [products] = await mysqlDB.query<Product[]>(
    `SELECT DISTINCT p.*, ri.ingredient_id, ri.name as ingredient_name
        FROM product_detail_view p
        JOIN recipe_ingredients ri ON p.id = ri.product_id
        JOIN recipes r ON ri.recipe_id = r.id
        WHERE r.user_id = (SELECT id FROM users WHERE username = ?) 
          AND ri.product_id IS NOT NULL
        ORDER BY p.created_at DESC;
    `,
    [username]
  );

  return {
    ingredientId: products[0]?.ingredient_id,
    products,
  };
};
const searchByIngredientName = async (
  query: string
): Promise<SearchProductsData> => {
  const formattedQuery = lightSlugify(query);

  const [exactIngredientData] = await mysqlDB.query<Ingredient[]>(
    `SELECT * FROM ingredients WHERE name = ?`,
    [query]
  );
  const ingredientId = exactIngredientData[0]?.id ?? null;

  const searchQuery = `%${formattedQuery}%`;
  const [data] = await mysqlDB.query<Product[]>(
    `SELECT DISTINCT p.*, i.id ingredient_id, i.name ingredient_name
        FROM ingredient_products ip
        JOIN product_detail_view p ON p.id = ip.product_id
        JOIN ingredients i ON i.id = ip.ingredient_id
        WHERE i.id 
            IN (SELECT id FROM ingredients WHERE name LIKE ?) 
        ORDER BY p.created_at DESC;
    `,
    [searchQuery]
  );

  return {
    ingredientId,
    products: data,
  };
};
