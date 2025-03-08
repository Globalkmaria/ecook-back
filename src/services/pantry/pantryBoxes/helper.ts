import { getImgUrl } from "../../../utils/img.js";
import {
  GetPantryItemsByUserIdRes,
  PantryItemServerData,
} from "../pantryItems/type.js";
import { generatePantryBoxKey, generatePantryItemKey } from "../utils.js";
import { PantryBoxInfoServerData } from "./type.js";

type PantryBoxResponse = {
  key: string;
  img: string | null;
  ingredientName: string;
  productName: string | null;

  items: {
    key: string;
    buyDate: Date;
    expireDate: Date;
    quantity: number;
  }[];
};

export const mapPantryBoxToResponse = (
  pantryBox: PantryBoxInfoServerData,
  pantryItems: PantryItemServerData[]
): PantryBoxResponse => {
  const key = generatePantryBoxKey(pantryBox.id);

  const items = pantryItems.map((item) => ({
    key: generatePantryItemKey(item.id),
    buyDate: item.buy_date,
    expireDate: item.expire_date,
    quantity: item.quantity,
  }));

  return {
    key,
    img: getImgUrl(pantryBox.img ?? null),
    ingredientName: pantryBox.ingredient_name,
    productName: pantryBox.product_name ?? null,

    items,
  };
};

type PantryBoxesResponse = {
  key: string;
  ingredientName: string;
  productName: string | null;
  img: string | null;

  buyDate: Date;
  expireDate: Date;
  quantity: number;
}[];

type PantryItems = Record<
  number,
  { buyDate: Date; expireDate: Date; quantity: number }
>;

export const mapPantryBoxesToResponse = (
  pantryBoxes: PantryBoxInfoServerData[],
  pantryItems: GetPantryItemsByUserIdRes[]
): PantryBoxesResponse => {
  const items = pantryItems.reduce<PantryItems>((acc, item) => {
    if (!acc[item.pantry_box_id]) {
      acc[item.pantry_box_id] = {
        buyDate: item.buy_date,
        expireDate: item.expire_date,
        quantity: item.quantity,
      };
      return acc;
    }
    const pantryBox = acc[item.pantry_box_id];
    pantryBox.quantity += item.quantity;
    if (pantryBox.expireDate < item.expire_date) {
      pantryBox.expireDate = item.expire_date;
      pantryBox.buyDate = item.buy_date;
    }
    return acc;
  }, {});

  return pantryBoxes.map((pantryBox) => ({
    key: generatePantryBoxKey(pantryBox.id),
    ingredientName: pantryBox.ingredient_name,
    productName: pantryBox.product_name ?? null,
    img: getImgUrl(pantryBox.img ?? null),

    buyDate: items[pantryBox.id].buyDate,
    expireDate: items[pantryBox.id].expireDate,
    quantity: items[pantryBox.id].quantity,
  }));
};
