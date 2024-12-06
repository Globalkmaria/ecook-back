import express from "express";
import session from "express-session";
import cors from "cors";
import passport from "passport";
import logger from "morgan";

import v1 from "./router/v1/index.js";
import { errorHandler, notFound } from "./middleware/errorHandlers.js";

import "./config/passport.js";
import { config, corsOption, getSessions } from "./config/index.js";
import { errorLogger, logRequest } from "./middleware/log.js";

const app = express();

app.use(express.json());
app.use(logger("dev"));

app.use(cors(corsOption));

app.use(session(getSessions()));
app.use(logRequest);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1", v1);

app.use(errorLogger);
app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
