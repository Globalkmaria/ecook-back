import { config } from "../../config/index.js";
import { decrypt, encrypt } from "../../utils/encrypt.js";
import { ServiceError } from "../helpers/ServiceError.js";

export const generatePantryItemKey = (pantryItemId: number) => {
  return `${encrypt(
    pantryItemId.toString(),
    config.key.pantryItem.key,
    config.key.pantryItem.iv
  )}`;
};

const decryptPantryItemKey = (pantryItemKey: string) => {
  if (pantryItemKey.length !== 32) {
    return null;
  }
  const pantryItemId = decrypt(
    pantryItemKey,
    config.key.pantryItem.key,
    config.key.pantryItem.iv
  );
  return Number(pantryItemId);
};

export const decryptPantryItemKeyWithThrowError = (pantryItemKey: string) => {
  const pantryItemId = decryptPantryItemKey(pantryItemKey);

  if (!pantryItemId) throw new ServiceError(400, "Invalid pantry item key");

  return pantryItemId;
};

export const generatePantryBoxKey = (pantryBoxId: number) => {
  return `${encrypt(
    pantryBoxId.toString(),
    config.key.pantryBox.key,
    config.key.pantryBox.iv
  )}`;
};

const decryptPantryBoxKey = (pantryBoxKey: string) => {
  if (pantryBoxKey.length !== 32) {
    return null;
  }
  const pantryBoxId = decrypt(
    pantryBoxKey,
    config.key.pantryBox.key,
    config.key.pantryBox.iv
  );
  return Number(pantryBoxId);
};

export const decryptPantryBoxKeyWithThrowError = (pantryBoxItemKey: string) => {
  const pantryBoxId = decryptPantryBoxKey(pantryBoxItemKey);

  if (!pantryBoxId) throw new ServiceError(400, "Invalid pantry box key");

  return pantryBoxId;
};
