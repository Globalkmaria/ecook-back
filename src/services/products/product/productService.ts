import mysqlDB from "../../../db/mysql.js";
import { ServiceError } from "../../helpers/ServiceError.js";
import { formatClientProduct } from "../helper.js";
import { Product } from "../type.js";

export const getProductDetail = async (productId: number) => {
  const [data] = await mysqlDB.query<Product[]>(
    `SELECT p.*, i.id ingredient_id, i.name ingredient_name
      FROM product_detail_view p
      JOIN ingredient_products ip ON p.id = ip.product_id
      JOIN ingredients i ON i.id = ip.ingredient_id
      WHERE p.id = ?;
    `,
    [productId]
  );

  const product = data[0];

  if (!product) throw new ServiceError(404, "Product not found");

  return formatClientProduct(product);
};
