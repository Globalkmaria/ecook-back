import express from "express";
import passport from "passport";
import crypto from "crypto";
import { ResultSetHeader, RowDataPacket } from "mysql2";

import { upload } from "../../../db/aws.js";
import mysqlDB from "../../../db/mysql.js";

import { validateEmail, validatePassword, validateUsername } from "./helper.js";
import { User } from "../recipe/index.js";
import { getImgUrl } from "../../../utils/img.js";

const router = express.Router();

router.post("/login", (req, res, next) => {
  const loginInfo = {
    username: req.body.username,
    password: req.body.password,
  };

  req.login(loginInfo, function (err) {
    if (err) {
      return next(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        const user = req.user as User;
        res.status(200).json({
          username: user.username,
          img: getImgUrl(user.img),
        });
      });
    }
  });
});

router.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.status(200).send();
  });
});

router.post("/signup", upload.single("img"), async (req, res, next) => {
  const body = req.body;
  const file = req.file as Express.MulterS3.File;

  if (!file) {
    res.status(400).json({ message: "Image is required" });
    return;
  }

  const user = {
    username: body.username,
    password: body.password,
    email: body.email,
    img: file.key,
  };

  if (!validateUsername(user.username)) {
    res.status(400).json({ message: "Invalid username" });
    return;
  }

  if (!validatePassword(user.password)) {
    res.status(400).json({ message: "Invalid password" });
    return;
  }

  if (!validateEmail(user.email)) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  const [result] = await mysqlDB.execute<RowDataPacket[]>(
    "SELECT * FROM users WHERE username = ?",
    [user.username]
  );

  if (result.length > 0) {
    res.status(400).json({ message: "Username already exists" });
    return;
  }

  const salt = crypto.randomBytes(16);
  crypto.pbkdf2(
    user.password,
    salt,
    310000,
    32,
    "sha256",
    async (err, hashedPassword) => {
      if (err) {
        return next(err);
      }

      try {
        const [result] = await mysqlDB.execute<ResultSetHeader>(
          "INSERT INTO users (username, hashed_password, salt, email, img) VALUES (?, ?, ?, ?, ?)",
          [user.username, hashedPassword, salt, user.email, user.img]
        );

        const newUser: Express.User = {
          id: result.insertId,
          username: user.username,
        };

        req.login(newUser, (error: any) => {
          if (error) return next(error);

          res.status(201).json({
            username: user.username,
            img: getImgUrl(user?.img, true),
          });
        });
      } catch (error) {
        if (error) return next(error);
      }
    }
  );
});

router.get("/validate-username/:username", async (req, res, next) => {
  const username = req.params.username;

  try {
    const [result] = await mysqlDB.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (result.length > 0) {
      res
        .status(200)
        .json({ message: "Username already exists", isAvailable: false });
      return;
    }

    res
      .status(200)
      .json({ message: "Username is available", isAvailable: true });
  } catch (error) {
    if (error) return next(error);
  }
});

export default router;
