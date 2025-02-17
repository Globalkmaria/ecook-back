import { RowDataPacket } from "mysql2";

import mysqlDB from "../../db/mysql.js";
import { CartItemData } from "./type.js";

export const getCartItemsByUserIdService = async (userId: number) => {
  const [cartItems] = await mysqlDB.execute<(CartItemData & RowDataPacket)[]>(
    `SELECT 
        i.id ingredient_id,
        i.name ingredient_name, 
        c.quantity ingredient_quantity,
        p.id product_id,
        p.name product_name,
        p.brand product_brand,
        p.purchased_from product_purchased_from,
        p,img product_img,
        c.quantity product_quantity
    FROM cooking.carts c
    LEFT JOIN ingredients i 
        ON c.ingredient_id = i.id 
    LEFT JOIN product_detail_view p
        ON c.product_id = p.id
    WHERE c.user_id = ''
;`,
    [userId]
  );

  return cartItems;
};
