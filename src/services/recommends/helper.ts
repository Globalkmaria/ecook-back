import { getValidSimpleUser } from "../../helpers/checkUser";
import { getImgUrl } from "../../utils/img";
import { generateRecipeKey } from "../recipes/utils";

import { HomeRecommendRecipe, RecommendRecipeWithOption } from "./type";

const formatRecipeData = (recipe: RecommendRecipeWithOption) => {
  const key = generateRecipeKey(recipe.recipe_id, recipe.recipe_name);

  return {
    name: recipe.recipe_name,
    img: getImgUrl(recipe.recipe_img, true),
    user: getValidSimpleUser({
      username: recipe.user_username,
      deleted_at: recipe.user_deleted_at,
      img: recipe.user_img,
    }),
    key,
    option: recipe.option_name,
  };
};

export const groupRecommendRecipesByOptionName = (
  recipes: RecommendRecipeWithOption[]
) =>
  recipes.reduce<{
    [option: string]: HomeRecommendRecipe[];
  }>((acc, cur) => {
    const optionName = cur.option_name;
    const formattedRecipe = formatRecipeData(cur);

    acc[optionName]
      ? acc[optionName].push(formattedRecipe)
      : (acc[optionName] = [formattedRecipe]);

    return acc;
  }, {});
