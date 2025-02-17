import express from "express";
import { getCartItemsByUser } from "../../../controllers/carts/getCartItemsByUser.js";
import { addItemToCart } from "../../../controllers/carts/addItemToCart.js";
import { updateCartItem } from "../../../controllers/carts/updateCartItem.js";
import { removeCartItem } from "../../../controllers/carts/removeCartItem.js";
import { authGuard } from "../../../middleware/auth.js";

const router = express.Router();

router.get("/user/:username", authGuard, getCartItemsByUser);

router.post("/user/:username", authGuard, addItemToCart);

router.put("/user/:username", authGuard, updateCartItem);

router.delete("/user/:username/:id", authGuard, removeCartItem);

export default router;
