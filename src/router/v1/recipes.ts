import mysqlDB from "../../db/mysql";
import express from "express";
import { RowDataPacket } from "mysql2";

const router = express.Router();

interface RecipesSimple extends RowDataPacket {
  id: number; // Non-nullable, int, default 0
  name: string; // Non-nullable, varchar(50)
  simple_description?: string | null; // Nullable, varchar(100)
  created_at: Date; // Timestamp for when the record was created
  updated_at: Date; // Timestamp for when the record was updated
  img: string; // Non-nullable, varchar(255)
  user_img?: string | null; // Nullable, varchar(255)
  user_username?: string | null; // Nullable, varchar(100)
  user_id: number; // Non-nullable, int, default 0
  tag_ids?: string | null; // Nullable, text (could store a list of tag IDs as a string)
  tag_names?: string | null; // Nullable, text (could store a list of tag names as a string)
}

interface ClientRecipeSimple {
  id: number;
  name: string;
  simpleDescription: string;
  img: string;
  tags: { id: number; name: string }[];
}

router.get("/", async (req, res, next) => {
  try {
    const [data] = await mysqlDB.query<RecipesSimple[]>(
      `SELECT * FROM recipes_simple_view`
    );

    const result: ClientRecipeSimple[] = data.map((recipe) => {
      const tagIds = recipe.tag_ids ? recipe.tag_ids.split(",") : [];
      const tagNames = recipe.tag_names ? recipe.tag_names.split(",") : [];
      const tags = tagIds.map((id, index) => ({
        id: parseInt(id, 10),
        name: tagNames[index],
      }));

      return {
        id: recipe.id,
        name: recipe.name,
        simpleDescription: recipe.simple_description ?? "",
        img: recipe.img,
        tags,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
