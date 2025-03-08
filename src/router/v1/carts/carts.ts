import express from "express";
import { getCartItemsByUser } from "../../../controllers/carts/getCartItemsByUser";
import { addItemToCart } from "../../../controllers/carts/addItemToCart";
import { updateCartItem } from "../../../controllers/carts/updateCartItem";
import { authGuard } from "../../../middleware/auth";

const router = express.Router();

router.get("/user/:username", authGuard, getCartItemsByUser);

router.post("/user/:username", authGuard, addItemToCart);

router.patch("/user/:username", authGuard, updateCartItem);

export default router;
