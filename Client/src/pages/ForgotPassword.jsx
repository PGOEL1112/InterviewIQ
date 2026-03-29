import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {

    const navigate = useNavigate();

    const [email,setEmail] = useState("");
    const [loading,setLoading] = useState(false);
    const [message,setMessage] = useState("");

    const handleSendOTP = async () => {

        if(!email){
            setMessage("Enter your email");
            return;
        }

        try{

            setLoading(true);
             await axios.post("/auth/send-reset-otp", { email });
            localStorage.setItem("resetEmail",email);
            navigate("/verify-reset-otp");

        }

        catch(err){
            setMessage(
                err.response?.data?.message || "Failed to send OTP"
            );
        }

        finally{
            setLoading(false);
        }

    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden text-white">

            <div className="absolute w-[500px] h-[500px] bg-blue-600/20 blur-[160px] rounded-full -top-40 -left-40"></div>
            <div className="absolute w-[400px] h-[400px] bg-indigo-600/20 blur-[150px] bottom-0 right-0"></div>

            <motion.div
            initial={{opacity:0,y:40}}
            animate={{opacity:1,y:0}}
            className="backdrop-blur-xl bg-white/10 border border-white/20 p-10 rounded-3xl w-[420px] shadow-xl text-center"
            >

                <h2 className="text-3xl font-bold mb-2">
                    Forgot Password
                </h2>

                <p className="text-gray-400 mb-6">
                    Enter your email to receive OTP
                </p>

                <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/20 outline-none mb-4"
                />

                <motion.button
                whileHover={{scale:1.05}}
                whileTap={{scale:0.9}}
                onClick={handleSendOTP}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg"
                >

                {loading ? "Sending..." : "Send OTP"}

                </motion.button>

                {message && (
                    <p className="text-sm mt-4 text-red-400">
                        {message}
                    </p>
                )}

            </motion.div>

        </div>

    );

};

export default ForgotPassword;
