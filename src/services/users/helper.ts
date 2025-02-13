import { generateRecipeKey } from "../recipes/helper.js";

import { getImgUrl } from "../../utils/img.js";
import { splitString } from "../../utils/normalize.js";
import { ClientRecipeSimple, RecipesSimple } from "../recipes/type.js";

export const formatClientRecipeSimple = (
  data: RecipesSimple[]
): ClientRecipeSimple[] =>
  data.map((recipe) => {
    const tagIds = splitString(recipe.tag_ids);
    const tagNames = splitString(recipe.tag_names);
    const tags = tagIds.map((id, index) => ({
      id: parseInt(id, 10),
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
        img: getImgUrl(recipe.user_img),
      },
    };
  });
