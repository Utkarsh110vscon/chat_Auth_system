import { Router } from "express";
import { authenticateUser, getNewAccessToken, googleAuth, googleAuthRedirect, loginUser, logoutUser, resendOtp, sendHelp, signUpUser, verifyUser } from "../controllers/auth.controller";
import { routerType } from "../types/authType";
import { authMiddlewareCheck } from "../middlewares/authMiddlewareCheck";

export const authRouter:routerType = Router();

authRouter.post("/auth/signup", signUpUser)
authRouter.post("/auth/verifyOtp", verifyUser)
authRouter.post("/auth/login", loginUser)
authRouter.get("/auth/accessToken", getNewAccessToken)
authRouter.post("/auth/logout", logoutUser)
authRouter.get("/auth/check", authMiddlewareCheck, authenticateUser)
authRouter.get("/auth/google", googleAuth)
authRouter.get("/auth/google/redirect", googleAuthRedirect)
authRouter.get("/auth/resendOtp", resendOtp)
authRouter.get("/auth/needHelp", sendHelp)