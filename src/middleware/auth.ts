import { Request, Response, NextFunction } from "express";

export const authGuard = (
  req: Request & { user?: Express.User },
  res: Response,
  next: NextFunction
) => {
  if (req.user) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};
