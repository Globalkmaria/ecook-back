import { NextFunction, Request, Response } from "express";

import { getUserDetail } from "../../services/users/userService";
import { ServiceError } from "../../services/helpers/ServiceError";

type GetUserParams = {
  username: string;
};

type GetUserResponse = {
  img: string | null;
  username: string;
  totalPosts: number;
};

export const getUser = async (
  req: Request<GetUserParams>,
  res: Response<GetUserResponse>,
  next: NextFunction
) => {
  try {
    const { username } = req.params;

    if (!username) throw new ServiceError(400, "Invalid username");

    const user = await getUserDetail(username);

    res.status(200).json(user);
  } catch (error) {
    if (error instanceof ServiceError) {
      next({ status: error.status, message: error.message, error });
      return;
    }
    next(error);
  }
};
