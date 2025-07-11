// Reserved usernames that users cannot register
const RESERVED_USERNAMES = [
  // Anonymous chef variations
  "anonymous_chef",
  "anonymous-chef",
  "anonymouschef",
  "anon_chef",
  "anon-chef",
  "anonchef",

  // Common system terms
  "admin",
  "administrator",
  "moderator",
  "mod",
  "support",
  "help",
  "api",
  "system",
  "bot",
  "service",

  // Deleted user variations
  "deleted_user",
  "deleted-user",
  "deleteduser",
  "former_user",
  "former-user",
  "formeruser",
  "ghost",
  "unknown",
  "anonymous",

  // Generic reserved
  "user",
  "guest",
  "test",
  "demo",
  "example",
  "sample",
  "null",
  "undefined",
  "root",
  "www",
  "mail",
  "email",
  "no-reply",
  "noreply",
];

// Prevent usernames that start with reserved terms
const RESERVED_PREFIXES = [
  "admin",
  "mod",
  "anonymous",
  "deleted",
  "former",
  "system",
  "api",
  "support",
];

export const validateUsername = (username: string) => {
  // Check basic format
  const regex = /^[a-zA-Z][a-zA-Z0-9_-]{4,100}$/;
  if (!regex.test(username)) {
    return false;
  }

  // Check against reserved usernames (case-insensitive)
  const lowercaseUsername = username.toLowerCase();
  if (RESERVED_USERNAMES.includes(lowercaseUsername)) {
    return false;
  }

  // Check for variations with numbers (like anonymous_chef123)
  const basePattern = lowercaseUsername.replace(/[0-9]+$/, ""); // Remove trailing numbers
  if (RESERVED_USERNAMES.includes(basePattern)) {
    return false;
  }

  for (const prefix of RESERVED_PREFIXES) {
    if (lowercaseUsername.startsWith(prefix)) {
      return false;
    }
  }

  return true;
};

export const validatePassword = (password: string) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

export const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
