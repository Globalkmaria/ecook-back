import { User } from "@/services/recipes/recipe/type";
import { RecipesSimple } from "@/services/recipes/type";
import { getImgUrl } from "@/utils/img";

const DELETED_ACCOUNT_USERNAME = "anonymous_chef";

const isDeletedAccountUser = (user: Pick<User, "deleted_at">) => {
  return user.deleted_at !== null;
};

export const getValidSimpleUser = (
  user: Pick<User, "deleted_at" | "username" | "img">
) => {
  const isDeleted = isDeletedAccountUser(user);
  return {
    isDeleted,
    username: isDeleted ? DELETED_ACCOUNT_USERNAME : user.username,
    img: getImgUrl(user.img, true),
  };
};

export const getValidUser = (
  data: Pick<RecipesSimple, "user_username" | "user_deleted_at">
) => {
  const isDeleted = data.user_deleted_at !== null;
  return {
    username: isDeleted ? DELETED_ACCOUNT_USERNAME : data.user_username,
    isDeleted,
  };
};
