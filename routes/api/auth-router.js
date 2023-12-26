import express from "express";

import authController from "../../controllers/auth-controller.js";

import { validateBody, isEmptyBody } from "../../middlewares/validateBody.js";
import authenticate from "../../middlewares/authenticate.js";
import upload from "../../middlewares/upload.js";

import {
  userSignupSchema,
  userSigninSchema,
  userEmailSchema,
} from "../../models/users.js";

const authRouter = express.Router();

authRouter.post(
  "/register",
  isEmptyBody,
  validateBody(userSignupSchema),
  authController.signup
);

authRouter.get("/verify/:verificationCode", authController.verifyEmail);

authRouter.post(
  "/verify",
  validateBody(userEmailSchema),
  authController.resendVerifyEmail
);

authRouter.post(
  "/login",
  isEmptyBody,
  validateBody(userSigninSchema),
  authController.signin
);

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.post("/logout", authenticate, authController.signout);

authRouter.patch(
  "/avatars",
  upload.single("avatar"),
  authenticate,
  authController.updateUserAvatars
);
export default authRouter;
