import express from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";

import { s3Client } from "../../db/aws.js";
import { getS3Pragmas } from "../../utils/s3Utils.js";

const router = express.Router();

router.get("/:folder/:id", async (req, res, next) => {
  try {
    const { id, folder } = req.params;

    if (!id) return res.status(400).send();

    const command = new GetObjectCommand(getS3Pragmas(`${folder}/${id}`));
    const data = await s3Client.send(command);

    let contentType = "image/jpeg";
    if (id.endsWith(".webp")) contentType = "image/webp";

    res.writeHead(200, {
      "Content-Type": contentType,
      "cache-control": "max-age=604800, public",
    });
    data.Body.pipe(res);
  } catch (error) {
    next(error);
  }
});

export default router;
