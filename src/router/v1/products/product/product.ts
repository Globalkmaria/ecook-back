import express from "express";
import { RowDataPacket } from "mysql2";
import mysqlDB from "../../../../db/mysql";
import { decryptRecipeURLAndGetProductId } from "../helper";
import { validateId } from "../../../../utils/numbers";

const router = express.Router();

router.get("/:key", async (req, res) => {
  const productId = decryptRecipeURLAndGetProductId(req.params.key);

  if (!productId || !validateId(productId)) {
    return res.status(400).json({ message: "Invalid key" });
  }

  res.status(200).json(productId);
});

export default router;
