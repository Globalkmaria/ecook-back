import { NextFunction, Request, Response } from "express";

import { checkUsernameExists } from "../../services/auth/authUsernameService";

interface Params {
  username: string;
}

export const checkUsernameAvailability = async (
  req: Request<Params>,
  res: Response,
  next: NextFunction
) => {
  const username = req.params.username;

  try {
    const isAvailable = await checkUsernameExists(username);

    const message = isAvailable
      ? "Username is available"
      : "Username already exists";
    res.status(200).json({ message, isAvailable });
  } catch (error) {
    next(error);
  }
};
