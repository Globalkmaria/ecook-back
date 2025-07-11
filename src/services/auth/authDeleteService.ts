import crypto from "crypto";

import { RowDataPacket } from "mysql2";

import mysqlDB from "../../db/mysql";

interface DeleteAccountParams {
  userId: number;
  username: string;
  password: string;
  reason?: string;
}

interface DeleteAccountResult {
  success: boolean;
  error?: string;
  deletedAt?: Date;
}

interface UserAuthData extends RowDataPacket {
  id: number;
  username: string;
  hashed_password: string;
  salt: string;
}

export const deleteUserAccount = async (
  params: DeleteAccountParams
): Promise<DeleteAccountResult> => {
  const { userId, username, password, reason } = params;

  try {
    // 1. Verify user identity by checking password
    const [userRows] = await mysqlDB.execute<UserAuthData[]>(
      "SELECT id, username, hashed_password, salt FROM users WHERE id = ? AND username = ?",
      [userId, username]
    );

    if (userRows.length === 0) {
      return { success: false, error: "User not found" };
    }

    const user = userRows[0];

    // 2. Verify password
    const isPasswordValid = await verifyPassword(
      password,
      user.hashed_password,
      user.salt
    );

    if (!isPasswordValid) {
      return { success: false, error: "Invalid password" };
    }

    // 3. Begin transaction for account deletion
    const connection = await mysqlDB.getConnection();

    try {
      await connection.beginTransaction();

      const deletedAt = new Date();

      // 4. Log the deletion for audit purposes (optional)
      await connection.execute(
        `INSERT INTO account_deletions (user_id, username, reason, deleted_at) 
         VALUES (?, ?, ?, ?)`,
        [userId, username, reason || null, deletedAt]
      );

      // 5. Soft delete: Mark user as deleted instead of hard delete
      // This approach follows industry best practices for data retention
      await connection.execute(
        `UPDATE users 
         SET 
           deleted_at = ?,
           email = CONCAT('deleted_', id, '@deleted.local'),
           username = CONCAT('deleted_user_', id),
           hashed_password = NULL,
           salt = NULL
         WHERE id = ?`,
        [deletedAt, userId]
      );

      await connection.commit();

      return {
        success: true,
        deletedAt,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting user account:", error);
    return {
      success: false,
      error: "An error occurred while deleting the account",
    };
  }
};

const verifyPassword = (
  password: string,
  hashedPassword: string,
  salt: string
): Promise<boolean> => {
  return new Promise((resolve) => {
    crypto.pbkdf2(password, salt, 310000, 32, "sha256", (err, derivedKey) => {
      if (err) {
        resolve(false);
        return;
      }

      const storedPasswordBuffer = Buffer.from(hashedPassword, "hex");
      const isValid = crypto.timingSafeEqual(storedPasswordBuffer, derivedKey);
      resolve(isValid);
    });
  });
};
