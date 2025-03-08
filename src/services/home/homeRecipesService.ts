import { HomeRecipe } from "../../controllers/home/homeRecipesController";
import { generateRecipeKey } from "../recipes/utils";

import { getImgUrl } from "../../utils/img";
import { splitString } from "../../utils/normalize";
import { getRecentRecipes } from "../recipes/recipesSearchService";
import { RecipesSimple } from "../recipes/type";

export const homeRecipesService = async () => {
  const result = await getRecentRecipes(18);
  return formatHomeRecipes(result);
};

const formatHomeRecipes = (data: RecipesSimple[]): HomeRecipe[] =>
  data.map((recipe) => {
    const tagIds = splitString(recipe.tag_ids);
    const tagNames = splitString(recipe.tag_names);
    const tags = tagIds.map((id, index) => ({
      id: Number(id),
      name: tagNames[index],
    }));

    const key = generateRecipeKey(recipe.id, recipe.name);

    return {
      id: recipe.id,
      name: recipe.name,
      img: getImgUrl(recipe.img, true),
      tags,
      hours: recipe.hours,
      minutes: recipe.minutes,
      key,
      user: {
        username: recipe.user_username,
      },
    };
  });
