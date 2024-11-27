import express from "express";
import session from "express-session";
import cors from "cors";
import passport from "passport";
import logger from "morgan";
import cookieParser from "cookie-parser";

import v1 from "./router/v1/index";
import { config, corsOption, getSessions } from "./config/index";
import { errorHandler, notFound } from "./middleware/errorHandlers";

import "./config/passport";

const app = express();

app.use(express.json());
app.use(logger("dev"));

app.use(express.json());
app.use(cors(corsOption));
app.use(cookieParser());

app.use(session(getSessions()));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1", v1);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
