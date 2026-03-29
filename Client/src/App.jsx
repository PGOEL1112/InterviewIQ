import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "./redux/userSlice";

axios.defaults.baseURL = "https://interviewiq-0iq8.onrender.com/api";
axios.defaults.withCredentials = true;

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Coins from "./pages/Coins";
import VerifyOTP from "./pages/VerifyOTP";

import ForgotPassword from "./pages/ForgotPassword";
import VerifyResetOTP from "./pages/VerifyResetOTP";
import NewPassword from "./pages/NewPassword";
import Step1Setup from "./pages/Step1Setup";
import InterviewRoom from "./pages/InterviewRoom";
import ReportPage from "./pages/ReportPage";
/* -------- COMPONENTS -------- */

import ProtectedRoute from "./components/ProtectedRoute";


function App() {
   const dispatch = useDispatch(); 

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await axios.get("/auth/me");
        dispatch(setUser(res.data.user));
      } catch {
        console.log("Not logged in");
      }
    };

    loadUser();
  }, [dispatch]); 

  return (

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/verify-email" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />
      <Route path="/new-password" element={<NewPassword />} />

    
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
       <Route path="/interview" element={<Step1Setup />} />
        <Route
        path="/interview/:interviewId"
        element={
          <ProtectedRoute>
            <InterviewRoom />
          </ProtectedRoute>
        }
      />
      <Route path="/report/:id" element={<ReportPage />} />
        <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      }
    />
      <Route path="/coins" element={<Coins />} />
    </Routes>

  );

}

export default App;
