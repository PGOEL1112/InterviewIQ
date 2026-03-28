import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  FaUserTie,
  FaBriefcase,
  FaUpload,
  FaRocket,
  FaMicrophone,
  FaChartLine
} from "react-icons/fa";

const Step1Setup = () => {
  const navigate = useNavigate();
  const [credits, setCredits] = useState(0);
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("technical");
  const [resume, setResume] = useState(null);

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);

  const [fileError, setFileError] = useState("");
 
  const handleFile = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFileError("");

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(file.type)) {
      setFileError("❌ Only PDF and DOCX files are allowed");
      setResume(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError("❌ File size must be less than 5MB");
      setResume(null);
      return;
    }

    setResume(file);
  };

  
  const analyzeResume = async () => {

    if (!resume) return;

    try {

      setLoading(true);

      const formData = new FormData();
      formData.append("resume", resume);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/api/interview/resume",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = res.data;

      setAnalysis(data);
      setRole(data.role);
      setExperience(data.experience);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  /* =============================
     START INTERVIEW
  ============================== */

  useEffect(() => {
    const fetchUser = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await axios.get("/api/user/profile",{
          headers:{
            Authorization:`Bearer ${token}`
          }
        });

        setCredits(res.data.user.credits);

      } catch(err){
        console.log(err);
      }

    };

      fetchUser();

    },[]);

    const handleStart = async () => {
      if(!role){
        alert("Please enter role");
        return;
      }
      try {
        setStarting(true);
        const token = localStorage.getItem("token");

        const res = await axios.post(
          "/api/interview/start",
          {
            role,
            experienceLevel: experience,
            interviewType:
                mode === "hr" ? "HR" :
                mode === "mixed" ? "Mixed" :
                "Technical",
                
             skills: analysis?.skills || []
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const interviewId = res.data.interview._id;
        localStorage.setItem("interviewType", mode);
        navigate(`/interview/${interviewId}`);

      } catch (err) {

        console.error(err);

      }

    };


  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] to-[#0f172a] text-white">

      {/* MAIN WRAPPER */}

      <div className="grid grid-cols-2 w-[1050px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl">

        {/* LEFT PANEL */}

        <motion.div
          initial={{ x: -120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-blue-600/20 to-blue-400/10 p-10 flex flex-col justify-center gap-6"
        >

          <h1 className="text-4xl font-bold">
            Start Your AI Interview
          </h1>

          <p className="text-gray-400 leading-relaxed">
            Practice real interview scenarios powered by AI.
            Improve communication, confidence and technical skills.
          </p>

          {/* FEATURE CARDS */}

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-xl"
          >
            <FaUserTie className="text-blue-400" />
            Choose Role & Experience
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-xl"
          >
            <FaMicrophone className="text-blue-400" />
            Smart Voice Interview
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-xl"
          >
            <FaChartLine className="text-blue-400" />
            Performance Analytics
          </motion.div>

        </motion.div>


        {/* RIGHT PANEL */}

        <motion.div
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="p-10 flex flex-col gap-6 max-h-[650px] overflow-y-auto"
        >

          <h2 className="text-2xl font-semibold">
            Interview Setup
          </h2>


          {/* ROLE */}

          <div className="relative">

            <FaUserTie className="absolute left-4 top-4 text-gray-400" />

            <input
              type="text"
              placeholder="Enter Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl p-3 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>


          {/* EXPERIENCE */}

          <div className="relative">

            <FaBriefcase className="absolute left-4 top-4 text-gray-400" />

           <select
            value={experience}
            onChange={(e)=>setExperience(e.target.value)}
            className="appearance-none bg-white/5 border border-white/10 rounded-xl p-3 pl-10 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >

            <option value="Fresher" className="bg-[#0f172a]">Fresher</option>
            <option value="Junior" className="bg-[#0f172a]">Junior</option>
            <option value="Mid" className="bg-[#0f172a]">Mid</option>
            <option value="Senior" className="bg-[#0f172a]">Senior</option>

            </select>


          </div>

          {/* INTERVIEW MODE */}
          <div className="relative">

            <FaChartLine className="absolute left-4 top-4 text-gray-400" />

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 rounded-xl p-3 pl-10 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >

              <option value="technical" className="bg-[#0f172a]">
                Technical Interview
              </option>

              <option value="hr" className="bg-[#0f172a]">
                HR Interview
              </option>

              <option value="mixed" className="bg-[#0f172a]">
                Mixed Interview
              </option>

            </select>

          </div>

          {/* UPLOAD RESUME */}

          <motion.label
            whileHover={{ scale: 1.03 }}
            className={`border-2 border-dashed ${
                fileError ? "border-red-500" : "border-white/20"
              } p-8 rounded-xl text-center cursor-pointer hover:bg-white/5 transition`}
          >

            <FaUpload className="mx-auto text-2xl mb-3 text-blue-400" />

            <div className="flex flex-col items-center gap-2">
              <span>
                {resume ? resume.name : "Upload Resume"}
              </span>

              <span className="text-xs text-gray-400">
                Supported formats: PDF, DOCX (Max size: 5MB)
              </span>
            </div>

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              hidden
              onChange={handleFile}
            />

          </motion.label>
            
          {fileError && (
            <p className="text-red-400 text-sm text-center mt-2">
              {fileError}
            </p>
          )}
          
          {/* ANALYZE BUTTON (HIDE AFTER RESULT) */}

          {resume && !analysis && (

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={analyzeResume}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 py-3 rounded-xl font-semibold shadow-lg"
            >

              {loading ? "Analyzing Resume..." : "Analyze Resume"}

            </motion.button>

          )}


          {/* ANALYSIS RESULT */}

          {analysis && (

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
             className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 p-6 rounded-2xl shadow-xl hover:shadow-blue-500/10 transition"
            >

              <h3 className="text-lg font-semibold mb-4">
                Resume Analysis
              </h3>


              {/* ROLE + EXPERIENCE */}

              <div className="flex gap-3 mb-4">

                <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-lg text-xs">
                  Role: {analysis.role}
                </span>

                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-lg text-xs">
                  Experience: {analysis.experience}
                </span>

              </div>


              {/* PROJECTS */}

              <p className="text-sm text-gray-400 mb-2">
                Projects
              </p>

              <div className="flex flex-wrap gap-2 mb-4">

                {analysis.projects?.map((p, i) => (
                  <span
                    key={i}
                    className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-lg text-xs"
                  >
                    {p}
                  </span>
                ))}

              </div>


              {/* SKILLS */}

              <p className="text-sm text-gray-400 mb-2">
                Skills
              </p>

              <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-2">

                {analysis.skills?.map((s, i) => (
                  <span
                    key={i}
                    className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-xs"
                  >
                    {s}
                  </span>
                ))}

              </div>

            </motion.div>

          )}


          {/* START INTERVIEW */}

         <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
           disabled={starting || !analysis || (credits !== -1 && credits < 10)}
           className={`py-4 rounded-xl font-semibold flex items-center justify-center gap-2
          ${
            credits === -1 || credits >= 10
            ? "bg-gradient-to-r from-blue-500 to-indigo-500"
            : "bg-gray-700 cursor-not-allowed"
          }`}
          >

          <FaRocket/>
          {starting
          ? "Starting Interview..."
           : credits === -1
            ? "Start Interview"
            : credits >= 10
            ? `Start Interview (${Math.floor(credits/10)} left)`
            : "Not enough credits"}

                    </motion.button>
            {credits !== -1 && credits < 10 && (

          <div className="text-center text-sm text-red-400 mt-2">

            ⚠ Not enough credits.  

            <span
            onClick={()=>navigate("/coins")}
            className="underline cursor-pointer text-blue-400 ml-1"
            >
            Upgrade plan
            </span>

          </div>

)}


        </motion.div>

      </div>

    </div>

  );

};

export default Step1Setup;
