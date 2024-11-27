import { Request, Response, NextFunction } from "express";
import createError from "http-errors";

export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next(createError(404, "Route not found"));
};

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(error);
  res.status(error.status || 500).send({
    message: error.message,
  });
};
