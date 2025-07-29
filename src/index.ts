import cors from "cors";
import express from "express";
import session from "express-session";
import logger from "morgan";
import passport from "passport";

import { config, corsOption, getSessions } from "./config/index";
import { errorHandler, notFound } from "./middleware/errorHandlers";
import { errorLogger, logRequest } from "./middleware/log";
import imgRouter from "./router/img/index";
import v1 from "./router/v1/index";

import "./config/passport";

const app = express();

app.use(express.json());
app.use(logger("dev"));

app.use(cors(corsOption));

app.use(session(getSessions()));
app.use(logRequest);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1", v1);

app.use("/api/const", imgRouter);

app.use(notFound);
app.use(errorLogger);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
