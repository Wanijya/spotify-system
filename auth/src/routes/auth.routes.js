import express from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth.controller.js";
import * as validationRules from "../middlewares/validation.middleware.js";
import { authUserMiddleware } from "../middlewares/auth.middleware.js";
import passport from "passport";
import _config from "../config/config.js";
import { rateLimitConfig, createLimiter } from "../config/rateLimit.config.js";

const router = express.Router();

// Route-specific rate limits (override global limit)
const loginLimiter = rateLimit(createLimiter(rateLimitConfig.login));
const registerLimiter = rateLimit(createLimiter(rateLimitConfig.register));
const googleOAuthLimiter = rateLimit(createLimiter(rateLimitConfig.googleOAuth));
const profileLimiter = rateLimit(createLimiter(rateLimitConfig.profile));
const logoutLimiter = rateLimit(createLimiter(rateLimitConfig.logout));

router.post(
  "/register",
  registerLimiter,
  validationRules.registerUserValidationRules,
  authController.register,
);

router.post(
  "/login",
  loginLimiter,
  validationRules.loginUserValidationRules,
  authController.login
);

router.get(
  "/google",
  googleOAuthLimiter,
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  googleOAuthLimiter,
  passport.authenticate("google", { session: false }),
  authController.googleAuthCallback,
);

router.get("/me", profileLimiter, authUserMiddleware, authController.getProfile);

router.post("/logout", logoutLimiter, authUserMiddleware, authController.logout);

export default router;
