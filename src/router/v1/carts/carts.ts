import express from "express";
import { getCartItemsByUser } from "../../../controllers/carts/getCartItemsByUser";
import { addItemToCart } from "../../../controllers/carts/addItemToCart";
import { updateCartItem } from "../../../controllers/carts/updateCartItem";
import { removeCartItem } from "../../../controllers/carts/removeCartItem";

const router = express.Router();

router.get("/user/:userId", getCartItemsByUser);

router.post("/user/:userId", addItemToCart);

router.put("/user/:userId", updateCartItem);

router.delete("/:id", removeCartItem);

export default router;
