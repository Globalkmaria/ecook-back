import { NextFunction, Request, Response } from "express";

import { processAndUploadImage } from "../../db/aws";
import { signupUser, SignupUser } from "../../services/auth/authSignupService";
import { getImgUrl } from "../../utils/img";

interface SignupBody {
  username: string;
  password: string;
  email: string;
}

type SignupResponse =
  | {
      username: string;
      img: string;
    }
  | {
      message: string;
    };

export const signup = async (
  req: Request<unknown, unknown, SignupBody>,
  res: Response<SignupResponse>,
  next: NextFunction
) => {
  try {
    const file = req.file as Express.MulterS3.File;
    const key = file && (await processAndUploadImage(file));

    const user: SignupUser = {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      img: key ?? null,
    };

    const { error, newUser } = await signupUser(user);

    if (error || !newUser) {
      next({
        status: 400,
        message: error ?? "Something went wrong while signing up.",
      });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req.login(newUser, (error: any) => {
      if (error) return next(error);

      res.cookie("username", newUser.username, { httpOnly: true });
      res.cookie("img", getImgUrl(newUser.img), { httpOnly: true });

      res.status(201).json({
        username: user.username,
        img: getImgUrl(user?.img, true),
      });
    });
  } catch (error) {
    next({
      status: 400,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while signing up.",
      error,
    });
  }
};
