import multer from "multer";
import sharp from "sharp";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"; // Import AWS SDK v3 S3 client

import { getRandomId } from "../utils/numbers";
import { config } from "../config/index";
import { sanitizeURL } from "../utils/normalize";

export const s3Client = new S3Client({
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
});

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 },
});

interface FileType {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

const maxImageSize = 600;

export async function processAndUploadImage(file: FileType) {
  const isHeic = file.mimetype === "image/heic";
  let image = sharp(file.buffer);

  // Convert HEIC → PNG if necessary
  if (isHeic) {
    image = image.toFormat("png");
  }

  const metadata = await image.metadata();
  if (metadata.width && metadata.width > maxImageSize) {
    image = image.resize({ width: maxImageSize });
  }

  const processedBuffer = await image.toBuffer();

  const fileName = sanitizeURL(file.originalname);

  const key = `images/${getRandomId()}-${fileName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      Body: processedBuffer,
      ContentType: isHeic ? "image/png" : file.mimetype,
    })
  );

  return key;
}
