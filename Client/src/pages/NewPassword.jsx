import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NewPassword = () => {

  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const [password,setPassword] = useState("");
  const [confirm,setConfirm] = useState("");
  const [showPass,setShowPass] = useState(false);
  const [showConfirm,setShowConfirm] = useState(false);
  const [message,setMessage] = useState("");

  /* PASSWORD RULES */

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password)
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const handleReset = async () => {

    if(!isPasswordValid){
      setMessage("Password does not meet requirements");
      return;
    }

    if(password !== confirm){
      setMessage("Passwords do not match");
      return;
    }

    try{
      await axios.post("/auth/reset-password", {
        email,
        password
      });

      if(res.data.success){

        setMessage("Password reset successful");

        setTimeout(()=>{
          navigate("/auth");
        },1500);

      }

    }
    catch(err){

      setMessage(
        err.response?.data?.message || "Reset failed"
      );

    }

  };


  return(

  <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white relative overflow-hidden">

  {/* BACKGROUND */}

  <div className="absolute w-[500px] h-[500px] bg-blue-600/20 blur-[160px] rounded-full -top-40 -left-40"></div>
  <div className="absolute w-[400px] h-[400px] bg-indigo-600/20 blur-[150px] bottom-0 right-0"></div>


  <motion.div
  initial={{opacity:0,y:40,scale:0.95}}
  animate={{opacity:1,y:0,scale:1}}
  transition={{duration:0.4}}
  className="relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 p-10 rounded-3xl w-[420px] shadow-2xl"
  >

  <h2 className="text-3xl font-bold text-center mb-2">
  Set New Password
  </h2>

  <p className="text-center text-gray-400 text-sm mb-6">
  Create a strong password to secure your account
  </p>


  {/* PASSWORD INPUT */}

  <div className="relative mb-4">

  <FaLock className="absolute left-3 top-4 text-gray-400"/>

  <input
  type={showPass ? "text" : "password"}
  placeholder="New Password"
  value={password}
  onChange={(e)=>setPassword(e.target.value)}
  className="w-full pl-10 pr-10 p-3 rounded-lg bg-white/10 border border-white/20 outline-none focus:border-blue-500"
  />

  <div
  className="absolute right-3 top-4 cursor-pointer"
  onClick={()=>setShowPass(!showPass)}
  >
  {showPass ? <FaEyeSlash/> : <FaEye/>}
  </div>

  </div>


  {/* CONFIRM PASSWORD */}

  <div className="relative mb-6">

  <FaLock className="absolute left-3 top-4 text-gray-400"/>

  <input
  type={showConfirm ? "text" : "password"}
  placeholder="Confirm Password"
  value={confirm}
  onChange={(e)=>setConfirm(e.target.value)}
  className="w-full pl-10 pr-10 p-3 rounded-lg bg-white/10 border border-white/20 outline-none focus:border-blue-500"
  />

  <div
  className="absolute right-3 top-4 cursor-pointer"
  onClick={()=>setShowConfirm(!showConfirm)}
  >
  {showConfirm ? <FaEyeSlash/> : <FaEye/>}
  </div>

  </div>


  {/* PASSWORD RULES */}

  {password.length > 0 && (

  <div className="text-xs space-y-1 mb-6">

  <p className={passwordRules.length ? "text-green-400" : "text-gray-400"}>
  ✔ Minimum 8 characters
  </p>

  <p className={passwordRules.uppercase ? "text-green-400" : "text-gray-400"}>
  ✔ Uppercase letter
  </p>

  <p className={passwordRules.lowercase ? "text-green-400" : "text-gray-400"}>
  ✔ Lowercase letter
  </p>

  <p className={passwordRules.number ? "text-green-400" : "text-gray-400"}>
  ✔ Number
  </p>

  <p className={passwordRules.special ? "text-green-400" : "text-gray-400"}>
  ✔ Special character
  </p>

  </div>

  )}


  {/* BUTTON */}

  <motion.button
  whileHover={{scale:1.05}}
  whileTap={{scale:0.95}}
  onClick={handleReset}
  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg font-semibold shadow-lg"
  >

  Reset Password

  </motion.button>


  {/* MESSAGE */}

  {message && (

  <motion.p
  initial={{opacity:0}}
  animate={{opacity:1}}
  className="text-red-400 mt-4 text-center text-sm"
  >
  {message}
  </motion.p>

  )}

  </motion.div>

  </div>

  );

};

export default NewPassword;
