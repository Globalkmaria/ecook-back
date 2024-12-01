import { getRandomId } from "../utils/numbers.js";
import { config } from "../config/index.js";
import { S3Client } from "@aws-sdk/client-s3"; // Import AWS SDK v3 S3 client
import multer from "multer"; // Import Multer for file uploads
import multerS3 from "multer-s3"; // Import Multer S3 storage engine

// Create an S3 client instance
export const s3Client = new S3Client({
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
});

// Configure Multer for file uploads to S3
export const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: config.s3.bucket,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `images/${getRandomId()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 500 * 1024 },
});
