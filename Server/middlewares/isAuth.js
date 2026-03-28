import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const isAuth = async (req, res, next) => {
  try {

    // token cookie se lo
    const token = req.cookies.token;
    if (!token && req.query.token) {
      token = req.query.token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login."
      });
    }

    // token verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // user find karo
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // request me user attach
    req.user = user;

    next();

  } catch (error) {

    console.error("Auth Middleware Error:", error);

    res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

export default isAuth;