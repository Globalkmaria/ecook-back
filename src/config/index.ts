import dotenv from "dotenv";
import { SessionOptions } from "express-session";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const required = (key: string, defaultValue = undefined) => {
  const value = process.env[key] || defaultValue;
  if (value == null) {
    throw new Error(`Key ${key} is undefined`);
  }
  return value;
};

export const config = {
  session: {
    secret: required("SESSION_SECRET"),
  },
  port: parseInt(required("PORT")),
  cors: {
    allowedOrigin: required("CORS_ALLOW_ORIGIN"),
  },
  mysql: {
    host: required("MYSQL_HOST"),
    user: required("MYSQL_USER"),
    password: required("MYSQL_PASSWORD"),
    database: required("MYSQL_NAME"),
    database2: required("MYSQL_NAME2"),
    port: required("MYSQL_PORT"),
  },
  s3: {
    accessKeyId: required("AWS_ACCESS_KEY"),
    secretAccessKey: required("AWS_SECRET_KEY"),
    region: required("AWS_REGION"),
    bucket: required("AWS_BUCKET"),
    s3ForcePathStyle: true,
  },
  img: {
    dbUrl: required("IMG_DB_URL"),
  },
  key: {
    recipe: {
      key: required("RECIPE_ENCRYPTION_KEY"),
      iv: required("RECIPE_ENCRYPTION_IV"),
    },
    ingredient: {
      key: required("INGREDIENT_ENCRYPTION_KEY"),
      iv: required("INGREDIENT_ENCRYPTION_IV"),
    },
    product: {
      key: required("PRODUCT_ENCRYPTION_KEY"),
      iv: required("PRODUCT_ENCRYPTION_IV"),
    },
  },
};

export const corsOption = {
  origin: config.cors.allowedOrigin,
  optionsSuccessStatus: 200,
  credentials: true,
};

const sessionOptions: SessionOptions = {
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
};

export const getSessions = () => sessionOptions;
