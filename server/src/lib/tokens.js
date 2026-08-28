import jwt from "jsonwebtoken";
import { config } from "../config.js";

export const AUTH_COOKIE = "voya_token";

export function signToken(user) {
  return jwt.sign(
    { sub: String(user.id), role: user.role, email: user.email },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN, issuer: "voya-store" },
  );
}

export function verifyToken(token) {
  return jwt.verify(token, config.JWT_SECRET, { issuer: "voya-store" });
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: config.COOKIE_SECURE,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
