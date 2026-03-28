import express from "express";
import isAuth from "../middlewares/isAuth.js";

import {
  getUserProfile,
  updateUserProfile,
  getUserCredits
} from "../controllers/UserController.js";

import upload from "../middlewares/upload.js";

const router = express.Router();

/* =============================
   IMAGE UPLOAD (CLOUDINARY)
============================= */

router.post("/upload", isAuth, upload.single("image"), (req, res) => {
  try {
    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    res.json({
      success: true,
      imageUrl: req.file.path
    });

  } catch (err) {
   console.error("🔥 ERROR OBJECT:");
    console.dir(err, { depth: null }); // 🔥 THIS IS KEY

    console.error("🔥 MESSAGE:", err.message);
      res.status(500).json({
        success: false,
        message: err.message
      });
  }
});

/* =============================
   PROFILE
============================= */

router.get("/profile", isAuth, getUserProfile);
router.put("/profile", isAuth, updateUserProfile);

/* =============================
   CREDITS
============================= */

router.get("/credits", isAuth, getUserCredits);

export default router;