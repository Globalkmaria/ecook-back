import { BookmarkRecipe } from "../../router/v1/bookmarks/index.js";
import { generateRecipeKey } from "../../router/v1/recipes/helper.js";

export const generateRecipeKeysForBookmarks = (bookmarks: BookmarkRecipe[]) =>
  bookmarks.map((bookmark) =>
    generateRecipeKey(bookmark.recipe_id, bookmark.recipe_name)
  );
