import { User } from "@/services/recipes/recipe/type";
import { getImgUrl } from "@/utils/img";

const isDeletedAccountUser = (user: Pick<User, "deleted_at">) => {
  return user.deleted_at !== null;
};

export const getValidSimpleUser = (
  user: Pick<User, "deleted_at" | "username" | "img">
) => {
  const isDeleted = isDeletedAccountUser(user);
  return {
    isDeleted,
    username: isDeleted ? "anonymous_chef" : user.username,
    img: getImgUrl(user.img, true),
  };
};
