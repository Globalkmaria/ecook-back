import { NextFunction, Request, Response } from "express";
import passport from "passport";

import { User } from "../../services/recipes/recipe/type.js";
import { getImgUrl } from "../../utils/img.js";

interface LoginBody {
  username: string;
  password: string;
}

interface LoginResponse {
  username: string;
  img: string | null;
}

export const login = (
  req: Request<{}, {}, LoginBody>,
  res: Response<LoginResponse>,
  next: NextFunction
) => {
  const loginInfo = {
    username: req.body.username,
    password: req.body.password,
  };

  req.login(loginInfo, function (error) {
    if (error) {
      return next({
        status: 400,
        message: "Something went wrong while logging in.",
        error,
      });
    } else {
      passport.authenticate("local")(req, res, function () {
        const user = req.user as User;
        res.cookie("username", user.username, { httpOnly: true });
        res.cookie("img", getImgUrl(user.img), { httpOnly: true });

        res.status(200).json({
          username: user.username,
          img: getImgUrl(user.img),
        });
      });
    }
  });
};
