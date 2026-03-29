import express from "express";

import {
    googleAuth,
    logoutUser,
    getProfile,
    sendResetOTP,
    verifyResetOTP,
    resetPassword,
    registerUser,
    loginUser,
    verifyEmail,
    resendOTP
} from "../controllers/authController.js";

import isAuth from "../middlewares/isAuth.js";

const router = express.Router();


/* ---------- AUTH ---------- */

router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.get("/me", isAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});


/* ---------- PASSWORD RESET ---------- */

router.post("/send-reset-otp", sendResetOTP);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);


/* ---------- USER ---------- */
router.get("/logout", logoutUser);


export default router;
