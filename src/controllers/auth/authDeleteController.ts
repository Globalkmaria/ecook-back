import { NextFunction, Request, Response } from "express";

import { SerializedUser } from "../../config/passport";
import { deleteUserAccount } from "../../services/auth/authDeleteService";

interface DeleteAccountBody {
  password: string;
  reason?: string;
}

interface DeleteAccountResponse {
  message: string;
}

export const deleteAccount = async (
  req: Request<unknown, unknown, DeleteAccountBody>,
  res: Response<DeleteAccountResponse>,
  next: NextFunction
) => {
  try {
    const user = req.user as SerializedUser;
    const { password, reason } = req.body;

    if (!user) {
      return next({
        status: 401,
        message: "Unauthorized. Please log in to delete your account.",
      });
    }

    if (!password) {
      return next({
        status: 400,
        message: "Password is required to delete your account.",
      });
    }

    const result = await deleteUserAccount({
      userId: user.id,
      username: user.username,
      password,
      reason,
    });

    if (!result.success) {
      return next({
        status: 400,
        message: result.error || "Failed to delete account.",
      });
    }

    // Clear session and cookies
    req.logout((error) => {
      if (error) {
        console.error("Error during logout:", error);
      }
    });

    res.clearCookie("username");
    res.clearCookie("img");

    res.status(200).json({
      message: "Account successfully deleted. We're sorry to see you go!",
    });
  } catch (error) {
    next({
      status: 500,
      message: "An error occurred while deleting your account.",
      error,
    });
  }
};
