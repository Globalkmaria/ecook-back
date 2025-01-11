import express from "express";
import { Readable } from "stream";
import { GetObjectCommand } from "@aws-sdk/client-s3";

import { s3Client } from "../../../db/aws.js";
import { config } from "../../../config/index.js";

const router = express.Router();

router.get("/:key", async (req, res) => {
  const { key } = req.params;

  try {
    const command = new GetObjectCommand({
      Bucket: config.s3.bucket,
      Key: `images/${key}`,
    });

    const response = await s3Client.send(command);

    // Set headers for the content type and length
    res.set("Content-Type", response.ContentType ?? "application/octet-stream");
    res.set("Content-Length", response.ContentLength?.toString() ?? "");
    res.set("Last-Modified", response.LastModified?.toUTCString() ?? "");
    res.set("ETag", response.ETag ?? "");
    res.set("Cache-Control", "public, max-age=31536000"); // cache for 1 year

    // Check if Body exists and is a readable stream
    if (response.Body) {
      const bodyStream = Readable.from(response.Body as any); // Convert response.Body to a Node.js readable stream
      bodyStream.pipe(res); // Stream the content to the response
    } else {
      res.status(404).json({ error: "File not found" });
    }
  } catch (error) {
    console.error("Error fetching image from S3:", error);
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

export default router;
