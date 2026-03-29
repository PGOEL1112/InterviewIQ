import User from "../models/userModel.js";
import genToken from "../config/token.js";
import crypto from "crypto";
import { sendOTP } from "../utils/sendEmail.js";
import { sendResetOTPEmail } from "../utils/sendResetOTPEmail.js";
import { sendPasswordResetSuccessEmail } from "../utils/sendPasswordResetSuccessEmail.js";


/* ---------------- GOOGLE AUTH ---------------- */
export const googleAuth = async (req,res)=>{
  try{
    const {name,email,picture} = req.body;

    if(!email){
      return res.status(400).json({
      success:false,
      message:"Email is required"
      });
    }

    let user = await User.findOne({email});

    if(!user){
        user = await User.create({
        name,
        email,
        image:picture,
        isVerified:true,
        credits:100
        });
    }

    const token = await genToken(user._id);
      res.cookie("token",token,{
      httpOnly:true,
      secure:true,
      sameSite:"none",
      maxAge:7*24*60*60*1000
      });

      res.json({
      success:true,
      message:"Login successful",
      user
      });
  }

    catch(err){
      res.status(500).json({
      success:false,
      message:"Google auth failed"
      });
    }
};

/* ---------------- REGISTER USER ---------------- */
export const registerUser = async (req,res)=>{

try{
    const {name,email,password} = req.body;
    if(!name || !email || !password){
      return res.status(400).json({
        success:false,
        message:"All fields are required"
      });
    }

  const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

  if(!passwordRegex.test(password)){
    return res.status(400).json({
    success:false,
    message:"Password must contain uppercase, lowercase, number and special character"
    });
  }

  let user = await User.findOne({email});
  if(user){
    if(user.isVerified){
      return res.status(400).json({
        success:false,
        message:"Email already registered"
      });
    } 

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOTP = crypto
      .createHash("sha256")
      .update(String(otp))
      .digest("hex");

        user.otp = hashedOTP;
        user.otpExpire = Date.now() + 10*60*1000;

        await user.save();
        await sendOTP(email,otp);

        return res.json({
        success:true,
        message:"OTP resent to email"
        });

  }
     const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOTP = crypto
      .createHash("sha256")
      .update(String(otp))
      .digest("hex");

      user = await User.create({
      name,
      email,
      password,
      otp:hashedOTP,
      otpExpire: Date.now() + 10*60*1000
      });

      await sendOTP(email,otp);

      res.json({
      success:true,
      message:"OTP sent to email"
      });
}

catch(err){
  console.log("REGISTER ERROR:",err);

  res.status(500).json({
  success:false,
  message:"Registration failed"
  });
}
};

/* ---------------- Verify Email ---------------- */
export const verifyEmail = async (req,res)=>{
try{
    const {email,otp} = req.body;
    const user = await User.findOne({email});
    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found"
      });
    }

    const hashedOTP = crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");

    if(user.otp !== hashedOTP){
      return res.status(400).json({
          success:false,
          message:"Invalid OTP"
        });
    }

    if(user.otpExpire < Date.now()){
          return res.status(400).json({
            success:false,
            message:"OTP expired"
          });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;

    await user.save();

    res.json({
    success:true,
    message:"Email verified successfully"
    });
}
    catch(err){
      res.status(500).json({
        success:false,
        message:"Verification failed"
      });
    }
};


/* ---------------- LOGIN USER ---------------- */

export const loginUser = async (req,res)=>{

try{
  const {email,password} = req.body;
  const user = await User.findOne({email});

  if(!user){
    return res.status(400).json({
    success:false,
    message:"Invalid email or password"
    });
  }

  if(!user.isVerified){
    return res.status(401).json({
      success:false,
      message:"Please verify your email first"
    });
  }

  const isMatch = await user.comparePassword(password);
    if(!isMatch){
      return res.status(400).json({
        success:false,
        message:"Invalid email or password"
      });

    }

    const token = await genToken(user._id);
    res.cookie("token",token,{
    httpOnly:true,
    secure:true,
    sameSite:"none",
    maxAge:7*24*60*60*1000
    });

    res.json({
    success:true,
    message:"Login successful",
    user
    });

}
  catch(err){
    res.status(500).json({
    success:false,
    message:"Login failed"
    });
  }
};

/* ---------------- GET PROFILE ---------------- */

export const getProfile = async (req,res)=>{

  try{
    res.json({
    success:true,
    user:req.user
    });
  }
  catch{
    res.status(500).json({
    success:false,
    message:"Failed to fetch profile"
    });

  }
};



/* ---------------- LOGOUT ---------------- */

export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None"
  });

  res.json({
    success: true,
    message: "Logged out successfully"
  });
};



/* ---------------- FORGOT PASSWORD (resetOTP) ---------------- */

export const sendResetOTP = async (req,res)=>{
  try{
    const {email} = req.body;
    const user = await User.findOne({email});

    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found"
      });
    }

    const otp = Math.floor(100000 + Math.random()*900000).toString();
      const hashedOTP = crypto
      .createHash("sha256")
      .update(String(otp))
      .digest("hex");

      user.resetOtp = hashedOTP;
      user.resetOtpExpire = Date.now() + 10*60*1000;

      await user.save();
      await sendResetOTPEmail(email,otp);

    res.json({
      success:true,
      message:"Reset OTP generated",
    });
  }
  catch{
    res.status(500).json({
    success:false,
    message:"Failed To sent Reset OTP"
    });

  }
};


/*-------------- VerifyRESETOTP----------*/
export const verifyResetOTP = async (req,res)=>{

    try{
        const {email,otp} = req.body;
        const user = await User.findOne({email});

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            });
        }

        const hashedOTP = crypto
        .createHash("sha256")
        .update(String(otp))
        .digest("hex");

        if(user.resetOtp !== hashedOTP){
            return res.status(400).json({
                success:false,
                message:"Invalid OTP"
            });
        }

        if(user.resetOtpExpire < Date.now()){
            return res.status(400).json({
                success:false,
                message:"OTP expired"
            });
        }

        user.resetOtp = null;
        user.resetOtpExpire = null;
        await user.save();

        res.json({
            success:true,
            message:"OTP verified"
        });

    }
    catch{

        res.status(500).json({
            success:false,
            message:"Verification failed"
        });

    }

};


/* ---------------- RESET PASSWORD ---------------- */

export const resetPassword = async (req,res)=>{
  try{
     const {email,password} = req.body;
     const user = await User.findOne({email});

    if(!user){
      return res.status(400).json({
        success:false,
        message:"User Not Found"
      });
    }

    user.password = password;
    user.resetOtp = null;
    user.resetOtpExpire = null;
    await user.save();
    await sendPasswordResetSuccessEmail(user.email, user.name);
    res.json({
         success:true,
         message:"Password reset successful"
    });

  }
  catch{
    res.status(500).json({
    success:false,
    message:"Reset Failed"
    });
  }
};

/* ---------------- RESEND OTP ---------------- */
export const resendOTP = async(req,res)=>{
  try{
    const {email} = req.body;
    const user = await User.findOne({email});

    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");

    user.otp = hashedOTP;
    user.otpExpire = Date.now() + 10*60*1000;

    await user.save();
    await sendOTP(email,otp);

    res.json({
    success:true,
    message:"OTP resent"
    });
  }
  catch{
    res.status(500).json({
    success:false,
    message:"Failed to resend OTP"
    });
  }
};
