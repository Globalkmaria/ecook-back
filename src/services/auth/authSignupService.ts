import crypto from "crypto";
import { ResultSetHeader, RowDataPacket } from "mysql2";

import mysqlDB from "../../db/mysql";
import { getImgUrl } from "../../utils/img";
import { validateEmail, validatePassword, validateUsername } from "./helper";

export interface SignupUser {
  username: string;
  password: string;
  email: string;
  img: string | null;
}

type SignupUserResponse =
  | {
      newUser: NewUser;
      error?: null;
    }
  | {
      error: string;
      newUser?: null;
    };

interface NewUser extends Express.User {
  id: number;
  username: string;
  img: string;
}

export const signupUser = async (
  user: SignupUser
): Promise<SignupUserResponse> => {
  if (!validateUsername(user.username)) return { error: "Invalid username" };
  if (!validatePassword(user.password)) return { error: "Invalid password" };
  if (!validateEmail(user.email)) return { error: "Email is required" };

  const [existingUser] = await mysqlDB.execute<RowDataPacket[]>(
    "SELECT 1 FROM users WHERE username = ?",
    [user.username]
  );

  if (existingUser.length > 0) return { error: "Username already exists" };

  const salt = crypto.randomBytes(16);
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      user.password,
      salt,
      310000,
      32,
      "sha256",
      async (err, hashedPassword) => {
        if (err) {
          return reject(err);
        }

        try {
          const [result] = await mysqlDB.execute<ResultSetHeader>(
            "INSERT INTO users (username, hashed_password, salt, email, img) VALUES (?, ?, ?, ?, ?)",
            [user.username, hashedPassword, salt, user.email, user.img]
          );

          const newUser = {
            id: result.insertId,
            username: user.username,
            img: getImgUrl(user.img, true),
          };

          resolve({ newUser });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};
