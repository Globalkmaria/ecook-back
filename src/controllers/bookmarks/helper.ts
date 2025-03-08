import { BookmarkRecipe } from "../../router/v1/bookmarks/index";
import { generateRecipeKey } from "../../services/recipes/utils";

export const generateRecipeKeysForBookmarks = (bookmarks: BookmarkRecipe[]) =>
  bookmarks.map((bookmark) =>
    generateRecipeKey(bookmark.recipe_id, bookmark.recipe_name)
  );
