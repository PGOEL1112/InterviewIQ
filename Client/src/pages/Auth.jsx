import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";

const Auth = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showForm, setShowForm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");

  const [message, setMessage] = useState("");
  const [type, setType] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ---------------- AUTO HIDE MESSAGE ---------------- */
  useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate("/dashboard");
    }
  }, []);
  
    
  useEffect(() => {

    if (message) {

      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }

  }, [message]);


  /* ---------------- PASSWORD RULES ---------------- */

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password)
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);


  /* ---------------- GOOGLE LOGIN ---------------- */

  const handleGoogleAuth = async () => {

    try {

      setLoading(true);

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/google`,
        {
          name: user.displayName,
          email: user.email,
          picture: user.photoURL
        },
        { withCredentials: true }
      );
      console.log("GOOGLE RES:", res.data); 
      dispatch(setUser(res.data.user));
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
   

    } catch (err) {
      console.log("Google error:",err);
      const errorMsg = err.response?.data?.message;
      setMessage(errorMsg || "Google login failed");
      setType("error");

    } finally {

      setLoading(false);

    }

  };


  /* ---------------- SIGNUP ---------------- */

  const handleSignup = async (e) => {

    e.preventDefault();

    if (!name.trim()) {
      setMessage("Enter your full name");
      setType("error");
      return;
    }

    if (!emailRegex.test(email)) {
      setMessage("Enter a valid email address");
      setType("error");
      return;
    }

    if (!isPasswordValid) {
      setMessage("Password must contain uppercase, lowercase, number and special character");
      setType("error");
      return;
    }

    try {

      setLoading(true);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          name,
          email,
          password
        },
        { withCredentials: true }
      );

      setMessage("OTP sent to your email");
      setType("success");

      localStorage.setItem("verifyEmail", email);

      setTimeout(() => {
        navigate("/verify-email");
      }, 800);

    } catch (err) {

      setMessage(err.response?.data?.message || "Signup failed");
      setType("error");

    } finally {

      setLoading(false);

    }

  };


  /* ---------------- LOGIN ---------------- */

  const handleLogin = async (e) => {

    e.preventDefault();

    if (!emailRegex.test(email)) {
      setMessage("Enter a valid email address");
      setType("error");
      return;
    }

    try {

      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          email,
          password
        },
        { withCredentials: true }
      );

      dispatch(setUser(res.data.user));
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");

    } catch (err) {

      const errorMsg = err.response?.data?.message;

      if (errorMsg === "Please verify your email first") {

        await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/resend-otp`,
          { email }
        );

        setMessage("Please verify your email first. OTP sent again.");
        setType("error");

        localStorage.setItem("verifyEmail", email);

        navigate("/verify-email");

        return;
      }

      setMessage(errorMsg || "Invalid email or password");
      setType("error");

    } finally {

      setLoading(false);

    }

  };


  /* ---------------- FORGOT PASSWORD ---------------- */

  const handleForgotPassword = async () => {

  if (!emailRegex.test(forgotEmail)) {
    setMessage("Enter a valid email address");
    setType("error");
    return;
  }

  try {

    setLoading(true);

    await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/send-reset-otp`,
      { email: forgotEmail }
    );

    setMessage("OTP sent to your email");
    setType("success");

    localStorage.setItem("resetEmail", forgotEmail);

    setShowForgot(false);
    setForgotEmail("");

    setTimeout(() => {
      navigate("/verify-reset-otp");
    }, 800);

  } 
  
    catch (err) {
        setMessage(
        err.response?.data?.message || "Failed to send OTP"
        );

        setType("error");
    } 
  
    finally {
        setLoading(false);
    }

};


  /* ---------------- UI ---------------- */

  return (

    <div className="relative min-h-screen flex items-center justify-center bg-[#020617] text-white overflow-hidden">

      {/* MESSAGE */}

      <AnimatePresence>

        {message && (

          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg text-sm z-50
            ${type === "success"
                ? "bg-green-500/90 backdrop-blur-lg"
                : "bg-red-500/90 backdrop-blur-lg"}`}
          >
            {message}
          </motion.div>

        )}

      </AnimatePresence>


      {/* BACKGROUND GLOW */}

      <div className="absolute w-[500px] h-[500px] bg-blue-600/20 blur-[160px] rounded-full -top-40 -left-40"></div>
      <div className="absolute w-[400px] h-[400px] bg-indigo-600/20 blur-[150px] bottom-0 right-0"></div>


      <AnimatePresence mode="wait">

        {/* LANDING PAGE */}

        {!showForm && (

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white text-black p-10 rounded-3xl w-[420px] shadow-2xl text-center"
          >

            <div className="flex justify-center gap-2 mb-4">

              <div className="bg-black text-white px-3 py-1 rounded-md">
                🤖
              </div>

              <span className="font-semibold">
                InterviewIQ.AI
              </span>

            </div>

            <h2 className="text-2xl font-bold mb-3">
              Continue with
            </h2>

            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full inline-block font-semibold mb-4">
              ✨ AI Smart Interview
            </div>

            <p className="text-gray-600 text-sm mb-6">
              Sign in to start AI-powered mock interviews
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="bg-gray-800 text-white py-3 rounded-full w-full"
            >
              🚀 Continue
            </motion.button>

          </motion.div>

        )}

        {/* AUTH FORM */}

        {showForm && (

          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-white/10 border border-white/20 p-10 rounded-3xl w-[380px]"
          >

            <h2 className="text-3xl font-bold text-center mb-6">
              {isLogin ? "Login" : "Create Account"}
            </h2>

            <form
              autoComplete="off"
              onSubmit={isLogin ? handleLogin : handleSignup}
              className="flex flex-col gap-4"
            >

              {!isLogin && (

                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="p-3 rounded-lg bg-white/20 outline-none"
                />

              )}

              <input
                type="email"
                autoComplete="off"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 rounded-lg bg-white/20 outline-none"
              />

              {/* PASSWORD */}

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-3 rounded-lg bg-white/20 outline-none w-full"
                />

                <div
                  className="absolute right-3 top-3 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>

              </div>


              {/* PASSWORD RULES */}

              {!isLogin && password.length > 0 && (

                <div className="text-xs space-y-1">

                  <p className={`${passwordRules.length ? "text-green-400" : "text-gray-400"}`}>
                    ✔ 8+ characters
                  </p>

                  <p className={`${passwordRules.uppercase ? "text-green-400" : "text-gray-400"}`}>
                    ✔ Uppercase letter
                  </p>

                  <p className={`${passwordRules.lowercase ? "text-green-400" : "text-gray-400"}`}>
                    ✔ Lowercase letter
                  </p>

                  <p className={`${passwordRules.number ? "text-green-400" : "text-gray-400"}`}>
                    ✔ Number
                  </p>

                  <p className={`${passwordRules.special ? "text-green-400" : "text-gray-400"}`}>
                    ✔ Special character
                  </p>

                </div>

              )}

              {isLogin && (

                <span
                  className="text-sm text-blue-400 cursor-pointer"
                  onClick={() => setShowForgot(true)}
                >
                  Forgot Password?
                </span>

              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 py-3 rounded-lg"
              >
                {loading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
              </motion.button>


              <div className="flex items-center gap-3 text-gray-400 text-sm">

                <div className="flex-1 h-[1px] bg-gray-600"></div>

                OR

                <div className="flex-1 h-[1px] bg-gray-600"></div>

              </div>


              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleGoogleAuth}
                className="flex items-center justify-center gap-3 border border-gray-500 py-3 rounded-lg"
              >

                <FaGoogle />

                Continue with Google

              </motion.button>

            </form>


            <p className="text-center mt-6 text-sm text-gray-300">

              {isLogin ? "Don't have an account?" : "Already have an account?"}

              <span
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-blue-400 cursor-pointer font-semibold"
              >

                {isLogin ? "Sign Up" : "Login"}

              </span>

            </p>

          </motion.div>

        )}


        {/* FORGOT PASSWORD MODAL */}

        {showForgot && (

          <div className="fixed inset-0 flex items-center justify-center bg-black/60">

            <div className="bg-white text-black p-8 rounded-xl w-[350px]">

              <h2 className="text-xl font-bold mb-4">
                Reset Password
              </h2>

              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="p-3 border w-full rounded-lg mb-4"
              />

              <button
                onClick={handleForgotPassword}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg w-full"
              >
                Send OTP
              </button>

              <button
                className="mt-3 text-sm text-gray-500"
                onClick={() => {
                  setShowForgot(false);
                  setForgotEmail("");
                }}
              >
                Cancel
              </button>

            </div>

          </div>

        )}

      </AnimatePresence>

    </div>

  );

};

export default Auth;
