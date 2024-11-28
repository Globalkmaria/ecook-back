import { v4 as uuidv4 } from "uuid";

export const getRandomId = () => uuidv4();

export const validateId = (value: string) => /^\d+$/.test(value);
