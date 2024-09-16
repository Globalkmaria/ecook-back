import dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const required = (key, defaultValue = undefined) => {
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
  server: {
    url: required("SERVER_URL", "http://localhost:8080"),
  },
  port: parseInt(required("PORT", 8080)),
  cors: {
    allowedOrigin: required("CORS_ALLOW_ORIGIN"),
  },
  frontend: {
    url: required("FRONTEND_URL"),
  },
};

export const corsOption = {
  origin: config.cors.allowedOrigin,
  optionsSuccessStatus: 200,
  credentials: true,
};

const sessionOptions = {
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
};

export const getSessions = () => sessionOptions;
