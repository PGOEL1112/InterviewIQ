import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FaMicrophone,
  FaChartLine,
  FaBrain,
  FaCoins,
  FaUserCircle,
  FaSignOutAlt,
  FaHistory,
  FaHome,
  FaRobot,
  FaChevronDown,
  FaUser,
} from "react-icons/fa";

import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/userSlice";
import PremiumAnalytics from "../components/PremiumAnalytics";
import AIFeedbackTable from "../components/AIFeedbackTable";
import Coins from "../pages/Coins";

const Dashboard = () => {

  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [view, setView] = useState("dashboard");

  const [openProfile, setOpenProfile] = useState(false);
  const [openCredits, setOpenCredits] = useState(false);

  const [interviews, setInterviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const profileRef = useRef();
  /* =============================
     FETCH INTERVIEW HISTORY
  ============================= */

  useEffect(() => {

    const fetchHistory = async () => {

      try {
      const res = await axios.get(
          "/interview/history",
        );

        const data = res.data.interviews || [];

        setInterviews(data);

        /* =============================
           ANALYTICS CALCULATION
        ============================= */

        if (data.length) {

          let totalScore = 0;
          let totalConfidence = 0;
          let totalCommunication = 0;
          let totalCorrectness = 0;

          data.forEach(i => {

            totalScore += i.overallScore || 0;

            i.questions?.forEach(q => {
              totalConfidence += q.confidence || 0;
              totalCommunication += q.communication || 0;
              totalCorrectness += q.correctness || 0;
            });

          });

          const totalQuestions =
            data.reduce((sum, i) => sum + (i.questions?.length || 0), 0);

          setAnalytics({

            avgScore: (totalScore / data.length).toFixed(1),

            confidence: totalQuestions
              ? (totalConfidence / totalQuestions).toFixed(1)
              : 0,

            communication: totalQuestions
              ? (totalCommunication / totalQuestions).toFixed(1)
              : 0,

            correctness: totalQuestions
              ? (totalCorrectness / totalQuestions).toFixed(1)
              : 0

          });

        }

      } catch (err) {
        console.log(err);
      }

    };

    fetchHistory();

  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/interview/${id}`);
      setInterviews(prev => prev.filter(i => i._id !== id));

    } catch (err) {
      console.log(err);
    }
  };

  /* =============================
     CLOSE DROPDOWNS
  ============================= */

  useEffect(() => {

    const handler = (e) => {

      if (profileRef.current && !profileRef.current.contains(e.target))
        setOpenProfile(false);
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);

  }, []);

  /* =============================
     LOW CREDIT POPUP
  ============================= */

useEffect(() => {
  if (user?.credits <= 5) {
    const alreadyShown = localStorage.getItem("lowCreditShown");

    if (!alreadyShown) {
      setOpenCredits(true);
      localStorage.setItem("lowCreditShown", "true");
    }
  }
}, [user]);


  const remainingInterviews =
    user?.credits === -1
      ? "Unlimited"
      : Math.floor((user?.credits || 0) / 10);

  const startInterview = () => {
    navigate("/interview");
  };


  return (

    <div className="flex min-h-screen bg-[#020617] text-white">

      {/* =============================
   SIDEBAR
============================= */}

      <div className="w-64 bg-[#0f172a] p-6 flex flex-col gap-8 border-r border-white/10">

        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaRobot /> InterviewIQ
        </h1>

        {/* FREE INTERVIEW COUNTER */}

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">

          <p className="text-sm text-gray-400 mb-1">
            Free Interviews Left
          </p>

          <p className="text-xl font-semibold">
            {remainingInterviews}
          </p>

          {user?.credits !== -1 && (

            <button
              onClick={() => navigate("/coins")}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-lg text-sm"
            >
              Upgrade Plan
            </button>

          )}


        </div>

        <nav className="flex flex-col gap-6 text-gray-300">

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setView("dashboard")}
          >
            <FaHome /> Dashboard
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={startInterview}
          >
            <FaMicrophone /> Start Interview
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setView("analytics")}
          >
            <FaChartLine /> Analytics
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setView("history")}
          >
            <FaHistory /> History
          </motion.div>

        </nav>

      </div>

      {/* =============================
   MAIN AREA
============================= */}

      <div className="flex-1 relative">

        {/* NAVBAR */}
        <div className="absolute w-[500px] h-[500px] bg-indigo-600/20 blur-[150px] rounded-full -top-40 -left-40"></div>
        <div className="absolute w-[400px] h-[400px] bg-blue-600/20 blur-[150px] bottom-0 right-0 rounded-full"></div>
        <div className="flex justify-between items-center p-6 relative z-[100]">

          <h2 className="text-xl font-semibold">
            Welcome back, {user?.name || "User"} 👋
          </h2>

          <div className="flex items-center gap-6 relative z-[200]">

            {/* COINS */}

            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => setOpenCredits(true)}
              className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer"
            >
              <FaCoins className="text-yellow-400" />
              {user?.credits || 100}
            </motion.div>


            {/* PROFILE */}

            <div ref={profileRef} className="relative">

              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setOpenProfile(!openProfile);
                }}
                className="flex items-center gap-3 bg-white/10 px-3 py-2 rounded-full cursor-pointer"
              >

                <FaUserCircle size={30} />

                <div>

                  <p className="text-sm font-semibold">
                    {user?.name}
                  </p>

                  <p className="text-xs text-gray-400">
                    {user?.email}
                  </p>

                </div>

                <FaChevronDown />

              </motion.div>

              <AnimatePresence>

                {openProfile && (

                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-12 w-56 bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-[9999]"
                  >

                    <div
                      onClick={() => navigate("/profile")}
                      className="px-4 py-3 hover:bg-white/10 cursor-pointer flex items-center gap-2"
                    >
                      <FaUser /> View Profile
                    </div>

                    <div
                      onClick={() => {
                        await axios.get("/auth/logout");
                        dispatch(logoutUser());
                        navigate("/");
                      }}
                      className="px-4 py-3 hover:bg-white/10 cursor-pointer flex items-center gap-2"
                    >
                      <FaSignOutAlt /> Logout
                    </div>

                  </motion.div>


                )}

              </AnimatePresence>

            </div>

          </div>

        </div>

        {/* =============================
   DASHBOARD VIEW
============================= */}

        {view === "dashboard" && (

          <>

            <div className="p-10 grid md:grid-cols-3 gap-6">

              <Card
                icon={<FaMicrophone className="text-blue-400" />}
                title="Start Mock Interview"
                desc="Practice AI-powered interview questions"
                onClick={startInterview}
              />

              <Card
                icon={<FaChartLine className="text-green-400" />}
                title="Performance Analytics"
                desc="Track interview progress"
                onClick={() => setView("analytics")}
              />

              <Card
                icon={<FaBrain className="text-purple-400" />}
                title="AI Feedback Analysis"
                desc="See detailed AI performance insights"
                onClick={() => setView("analysis")}
              />


            </div>

            {/* RECENT INTERVIEWS */}

            <div className="p-10">

              <h2 className="text-2xl mb-4 flex items-center gap-2">
                <FaHistory /> Recent Interviews
              </h2>

              <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl">

                {interviews.length === 0 ? (

                  <p>No interviews yet. Start your first AI mock interview!</p>

                ) : (interviews.slice(0, 5).map(i => (

                  <div
                    key={i._id}
                    onClick={() => setView("history")}
                    className="p-3 border-b border-white/10 hover:bg-white/10 cursor-pointer"
                  >

                    {i.role} • Score {i.overallScore || 0}

                  </div>

                )))}

              </div>

            </div>

          </>

        )}

        {view === "analytics" && (
          <div className="p-10">
            <PremiumAnalytics interviews={interviews} />
          </div>
        )}


        {view === "history" && (
          <div className="p-8 grid md:grid-cols-2 gap-6">

            {interviews.map(i => {

              const score = i.overallScore || 0;
              const percentage = score * 10;

              return (
                <motion.div
                  key={i._id}
                  whileHover={{ scale: 1.03 }}
                  className="relative bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/10 p-6 rounded-2xl shadow-xl overflow-hidden"
                >

                  {/* GLOW EFFECT */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-2xl opacity-20"></div>

                  <div className="relative z-10">

                    {/* HEADER */}
                    <div className="flex justify-between items-start mb-4">

                      <div>
                        <h2 className="text-lg font-semibold text-white">
                          {i.role}
                        </h2>

                        <p className="text-xs text-gray-400">
                          {new Date(i.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <span className="px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                        {i.status || "completed"}
                      </span>

                    </div>

                    {/* SCORE + CIRCLE */}
                    <div className="flex items-center justify-between">

                      {/* LEFT TEXT */}
                      <div>
                        <p className="text-gray-400 text-sm">
                          Performance Score
                        </p>

                        <p className="text-2xl font-bold text-blue-400 mt-1">
                          {score}/10
                        </p>
                      </div>

                      {/* CIRCLE */}
                      <div className="relative w-20 h-20">

                        <svg className="w-full h-full rotate-[-90deg]">
                          <circle
                            cx="40"
                            cy="40"
                            r="32"
                            stroke="#1f2937"
                            strokeWidth="6"
                            fill="transparent"
                          />

                          <circle
                            cx="40"
                            cy="40"
                            r="32"
                            stroke="url(#grad)"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={200}
                            strokeDashoffset={200 - (200 * percentage) / 100}
                            strokeLinecap="round"
                          />

                          <defs>
                            <linearGradient id="grad">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#22c55e" />
                            </linearGradient>
                          </defs>
                        </svg>

                        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                          {score}
                        </div>

                      </div>

                    </div>

                    {/* PERFORMANCE BAR */}
                    <div className="mt-5">
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400"
                        />
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-between items-center mt-6">

                      <p className="text-xs text-gray-400">
                        {score >= 8
                          ? "Excellent 🚀"
                          : score >= 5
                            ? "Needs improvement ⚡"
                            : "Work harder 📉"}
                      </p>

                      <div className="flex gap-3">

                        <button
                         onClick={() => 
                            window.open(
                              `https://interviewiq-0iq8.onrender.com/api/interview/report/${i._id}`,
                              "_blank"
                            )
                          }
                          className="px-4 py-1 text-sm rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition"
                        >
                          View
                        </button>

                        <button
                          onClick={() => handleDelete(i._id)}
                          className="px-4 py-1 text-sm rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>

                </motion.div>
              );
            })}

          </div>
        )}

        {view === "analysis" && (
          <div className="p-10">
            <AIFeedbackTable
              interviews={interviews}
              onDelete={handleDelete}
            />
          </div>
        )}


      </div>

      {/* CREDIT POPUP */} <AnimatePresence> {openCredits && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]" > <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-[#0f172a] border border-white/10 rounded-2xl p-8 w-[420px]" > <div className="flex justify-center mb-4"> <div className="bg-yellow-500/20 p-4 rounded-full"> <FaCoins className="text-yellow-400 text-3xl" /> </div> </div> <h2 className="text-xl font-semibold text-center mb-2"> You're running low on interview credits </h2> <p className="text-gray-400 text-center text-sm mb-6"> Each AI mock interview consumes credits. Upgrade your balance to continue practicing and improving your interview skills. </p> <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center mb-6"> <p className="text-gray-400 text-sm"> Current Balance </p> <p className="text-2xl font-bold flex items-center justify-center gap-2 mt-1"> <FaCoins className="text-yellow-400" /> {user?.credits || 100} </p> </div> <button onClick={() => navigate("/coins")} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-semibold mb-3" > Buy More Credits </button> <button onClick={() => setOpenCredits(false)} className="w-full border border-white/10 py-3 rounded-xl hover:bg-white/10" > Maybe Later </button> </motion.div> </motion.div>)} </AnimatePresence> </div>);
};

/* CARD */

const Card = ({ icon, title, desc, onClick }) => (

  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-xl"
  >

    <div className="mb-4 text-2xl">
      {icon}
    </div>

    <h2 className="text-xl font-semibold">
      {title}
    </h2>

    <p className="text-gray-400 mt-2">
      {desc}
    </p>

    <button
      onClick={onClick}
      className="mt-4 bg-blue-600 px-4 py-2 rounded-lg flex items-center gap-2"
    >
      {icon} Start
    </button>

  </motion.div>

);

/* STAT CARD */

const StatCard = ({ title, value, icon }) => (

  <div className="bg-white/10 p-6 rounded-2xl">

    <div className="flex items-center gap-3 mb-2">

      <div className="text-xl">
        {icon}
      </div>

      <h3 className="text-lg">
        {title}
      </h3>

    </div>

    <p className="text-3xl font-bold">
      {value}
    </p>

  </div>

);

export default Dashboard;
