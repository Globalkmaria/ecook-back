import express from "express";
import { getCartItemsByUser } from "../../../controllers/carts/getCartItemsByUser.js";
import { addItemToCart } from "../../../controllers/carts/addItemToCart.js";
import { updateCartItem } from "../../../controllers/carts/updateCartItem.js";
import { authGuard } from "../../../middleware/auth.js";

const router = express.Router();

router.get("/user/:username", authGuard, getCartItemsByUser);

router.post("/user/:username", authGuard, addItemToCart);

router.patch("/user/:username", authGuard, updateCartItem);

export default router;
