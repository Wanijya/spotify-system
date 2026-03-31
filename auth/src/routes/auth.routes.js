import express from "express";
import * as authController from "../controllers/auth.controller.js";
import * as validationRules from "../middlewares/validation.middleware.js";
import { authUserMiddleware } from "../middlewares/auth.middleware.js";
import passport from "passport";
import _config from "../config/config.js";

const router = express.Router();

router.post(
  "/register",
  validationRules.registerUserValidationRules,
  authController.register,
);

router.post("/login", validationRules.loginUserValidationRules, authController.login);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authController.googleAuthCallback,
);

router.get("/me", authUserMiddleware, authController.getProfile);

router.post("/logout", authUserMiddleware, authController.logout);

export default router;
