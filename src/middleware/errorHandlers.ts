import { Request, Response, NextFunction } from "express";

export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).send("Route not found");
};

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(error);
  res.status(500).json({ message: "Internal Server Error" });
};
