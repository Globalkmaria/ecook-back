import express from "express";

import { validateId } from "../../../../utils/numbers.js";
import { getImgUrl } from "../../../../utils/img.js";
import mysqlDB from "../../../../db/mysql.js";
import {
  decryptRecipeURLAndGetProductId,
  generateProductKey,
} from "../helper.js";
import { Product } from "../../../../services/products/type.js";
import { ClientProduct } from "../../../../controllers/products/type.js";

const router = express.Router();

router.get("/:key", async (req, res, next) => {
  const productId = decryptRecipeURLAndGetProductId(req.params.key);

  if (!productId || !validateId(productId)) {
    return res.status(400).json({ message: "Invalid key" });
  }

  try {
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

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const formattedProduct: ClientProduct = {
      id: product.id,
      ingredient: {
        id: product.ingredient_id,
        name: product.ingredient_name,
      },
      userId: product.user_id,
      name: product.name,
      brand: product.brand,
      purchasedFrom: product.purchased_from,
      link: product.link,
      img: getImgUrl(product.img, true),
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      key: generateProductKey(product.id, product.name),
    };

    res.status(200).json(formattedProduct);
  } catch (error) {
    next(error);
  }
});

export default router;
