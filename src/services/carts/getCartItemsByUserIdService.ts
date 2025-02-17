import { RowDataPacket } from "mysql2";

import mysqlDB from "../../db/mysql.js";
import { CartItemData } from "./type.js";

export const getCartItemsByUserIdService = async (userId: number) => {
  const [cartItems] = await mysqlDB.execute<(CartItemData & RowDataPacket)[]>(
    `SELECT 
      i.id AS ingredient_id,
      i.name AS ingredient_name, 
      c.quantity AS ingredient_quantity,
      p.id AS product_id,
      p.name AS product_name,
      p.brand AS product_brand,
      p.purchased_from AS product_purchased_from,
      p.img AS product_img,
      c.quantity AS product_quantity
    FROM carts c
    LEFT JOIN ingredients i 
      ON c.ingredient_id = i.id 
    LEFT JOIN product_detail_view p
      ON c.product_id = p.id
    WHERE c.user_id = ?
;`,
    [userId]
  );

  return cartItems;
};
