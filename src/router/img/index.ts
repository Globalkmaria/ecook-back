import path from "path";

import express from "express";

import { config } from "../../config/index";

const router = express.Router();

router.use(
  "/img",
  express.static(path.join(config.paths.root, "/src", "const/imgs"), {
    maxAge: "1y",
  })
);

export default router;
