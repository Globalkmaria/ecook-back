import express from "express";
import passport from "passport";
import crypto from "crypto";
import { ResultSetHeader } from "mysql2";

import mysqlDB from "../../db/mysql";
import { User } from "./recipe";

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
        res.status(200).json({ username: user.username, img: user.img });
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

router.post("/signup", async (req, res, next) => {
  const salt = crypto.randomBytes(16);

  const body = req.body;

  // TODO img
  const user = {
    username: body.username,
    password: body.password,
    email: body.email,
    img: body.img,
  };

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
          "INSERT INTO users (username, hashed_password, salt, email) VALUES (?, ?, ?, ?)",
          [user.username, hashedPassword, salt, user.email]
        );

        const newUser: Express.User = {
          id: result.insertId,
          username: user.username,
        };

        req.login(newUser, (error: any) => {
          if (error) return next(error);

          res.status(201).json({ username: user.username, img: user?.img });
        });
      } catch (error) {
        if (error) return next(error);
      }
    }
  );
});

export default router;
