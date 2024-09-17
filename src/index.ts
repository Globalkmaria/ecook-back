import express from "express";
import session from "express-session";
import cors from "cors";

import { config, corsOption, getSessions } from "./config/index.js";
import v1 from "./router/v1/index.js";
import { errorHandler, notFound } from "./middleware/errorHandlers.js";

const app = express();

app.use(express.json());
app.use(cors(corsOption));

app.use(session(getSessions()));

app.use("/api/v1", v1);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
