import { NextFunction, Request, Response } from "express";

export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout(function (error) {
    if (error)
      return next({
        status: 400,
        message: "Something went wrong while logging out.",
        error,
      });

    res.clearCookie("username");
    res.clearCookie("img");
    res.status(200).send();
  });
};
