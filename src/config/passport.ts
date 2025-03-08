import crypto from "crypto";

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import mysqlDB from "../db/mysql";
import { User } from "../services/recipes/recipe/type";

interface UserRow {
  id: number;
  username: string;
  hashed_password: string;
  salt: string;
}

export interface SerializedUser {
  id: number;
  username: string;
}

passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    try {
      const [rows] = await mysqlDB.execute(
        "SELECT * FROM users WHERE username =?",
        [username]
      );

      const users = rows as UserRow[];

      if (users.length === 0)
        return cb(null, false, { message: "Incorrect username or password." });

      const user = users[0];

      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        "sha256",
        function (err, hashedPassword) {
          if (err) return cb(err);

          const storedPasswordBuffer = Buffer.from(user.hashed_password, "hex");

          if (!crypto.timingSafeEqual(storedPasswordBuffer, hashedPassword)) {
            return cb(null, false, {
              message: "Incorrect username or password.",
            });
          }
          return cb(null, user);
        }
      );
    } catch (error) {
      return cb(error);
    }
  })
);

passport.serializeUser(
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  (user: Express.User, done: (err: any, id?: SerializedUser) => void) => {
    const currentUser = user as User;
    process.nextTick(() => {
      done(null, { id: currentUser.id, username: currentUser.username });
    });
  }
);

passport.deserializeUser(
  (
    serializedUser: SerializedUser,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    done: (err: any, user?: Express.User) => void
  ) => {
    process.nextTick(() => {
      done(null, serializedUser);
    });
  }
);
