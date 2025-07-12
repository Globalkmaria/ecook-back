import { Request, Response, NextFunction } from "express";

import { ErrorLogger } from "./log";

export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next({
    status: 404,
    message: "Route not found",
  });
};

export const errorHandler = (
  error: ErrorLogger,
  req: Request,
  res: Response
): void => {
  res.status(error.status || 500).send({
    message: error.message,
  });
};
