import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VerifyResetOTP = () => {

  const navigate = useNavigate();

  const email = localStorage.getItem("resetEmail");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [message, setMessage] = useState("");

  const inputs = useRef([]);

  useEffect(() => {

    if (timer > 0) {

      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);

    }

  }, [timer]);


  const handleChange = (value, index) => {

    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];

    newOtp[index] = value;

    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }

  };


  const handleVerifyOTP = async () => {

    const finalOtp = otp.join("");

    if (finalOtp.length < 6) {
      setMessage("Enter complete OTP");
      return;
    }

    try {

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/verify-reset-otp`,
        {
          email,
          otp: finalOtp
        }
      );

      if (res.data.success) {

        navigate("/new-password");

      }

    } catch (err) {

      setMessage(
        err.response?.data?.message || "OTP verification failed"
      );

    }

  };


  const handleResend = async () => {

    try {

      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/send-reset-otp`,
        { email }
      );

      setTimer(60);

    } catch {

      setMessage("Failed to resend OTP");

    }

  };


  return (

    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white relative overflow-hidden">

      <div className="absolute w-[500px] h-[500px] bg-blue-600/20 blur-[160px] rounded-full -top-40 -left-40"></div>
      <div className="absolute w-[400px] h-[400px] bg-indigo-600/20 blur-[150px] bottom-0 right-0"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/10 border border-white/20 p-10 rounded-3xl w-[420px] text-center"
      >

        <h2 className="text-2xl font-bold mb-6">
          Verify OTP
        </h2>

        <div className="flex justify-center gap-3 mb-6">

          {otp.map((digit, index) => (

            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              className="w-12 h-14 text-center text-xl rounded-lg bg-white/10 border border-white/20 outline-none"
            />

          ))}

        </div>

        <button
          onClick={handleVerifyOTP}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg"
        >
          Verify OTP
        </button>

        {message && (
          <p className="text-red-400 mt-4">
            {message}
          </p>
        )}

        <div className="mt-6 text-sm">

          {timer > 0 ? (

            <p>
              Resend in {timer}s
            </p>

          ) : (

            <button
              onClick={handleResend}
              className="text-blue-400"
            >
              Resend OTP
            </button>

          )}

        </div>

      </motion.div>

    </div>

  );

};

export default VerifyResetOTP;
