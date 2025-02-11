import { getImgUrl } from "../../utils/img.js";
import { generateRecipeKey } from "../recipes/helper.js";
import { HomeRecommendRecipe, RecommendRecipeWithOption } from "./type.js";

const formatRecipeData = (recipe: RecommendRecipeWithOption) => {
  const key = generateRecipeKey(recipe.recipe_id, recipe.recipe_name);

  return {
    name: recipe.recipe_name,
    img: getImgUrl(recipe.recipe_img, true),
    user: {
      username: recipe.user_username,
      img: getImgUrl(recipe.user_img, true),
    },
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
