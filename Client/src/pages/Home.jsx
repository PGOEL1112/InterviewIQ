import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";


import {
  FaRobot,
  FaMicrophone,
  FaChartLine,
  FaBrain,
  FaRocket,
  FaBolt,
  FaStar,
  FaSignInAlt,
  FaUserPlus
} from "react-icons/fa";

/* ASSETS */

import aiAns from "../assets/ai-ans.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import historyImg from "../assets/history.png";

import hrImg from "../assets/HR.png";
import techImg from "../assets/tech.png";
import confImg from "../assets/confi.png";
import creditImg from "../assets/credit.png";



const Home = () => {

  const navigate = useNavigate();

 
const particlesInit = async (engine) => {
  await loadSlim(engine);
};

  /* STEPS DATA */

  const steps = [
    {
      icon: <FaRobot size={28} />,
      step: "STEP 1",
      title: "Role & Experience Selection",
      desc: "AI adjusts difficulty based on selected job role."
    },
    {
      icon: <FaMicrophone size={28} />,
      step: "STEP 2",
      title: "Smart Voice Interview",
      desc: "Dynamic follow-up questions based on your answers."
    },
    {
      icon: <FaBolt size={28} />,
      step: "STEP 3",
      title: "Timer Based Simulation",
      desc: "Real interview pressure with time tracking."
    }
  ];

  /* ADVANCED AI FEATURES */

  const capabilities = [
    {
      img: aiAns,
      title: "AI Answer Evaluation",
      desc: "Scores communication, technical accuracy and confidence."
    },
    {
      img: resumeImg,
      title: "Resume Based Interview",
      desc: "Project specific questions based on uploaded resume."
    },
    {
      img: pdfImg,
      title: "Downloadable PDF Report",
      desc: "Detailed strengths, weaknesses and improvement insights."
    },
    {
      img: historyImg,
      title: "History & Analytics",
      desc: "Track progress with performance graphs and topic analysis."
    }
  ];

  /* INTERVIEW MODES */

  const modes = [
    {
      img: hrImg,
      title: "HR Interview Mode",
      desc: "Behavioral and communication based evaluation."
    },
    {
      img: techImg,
      title: "Technical Mode",
      desc: "Deep technical questioning based on selected role."
    },
    {
      img: confImg,
      title: "Confidence Detection",
      desc: "Voice tone and confidence analysis."
    },
    {
      img: creditImg,
      title: "Credits System",
      desc: "Unlock premium interview sessions easily."
    }
  ];

  return (

    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">

      {/* PARTICLES */}

      <Particles
        id="tsparticles"
        init={particlesInit}
        className="absolute inset-0 -z-10"
        options={{
          background: { color: "#020617" },
          particles: {
            number: { value: 80 },
            color: { value: "#3b82f6" },
            links: { enable: true, color: "#3b82f6", distance: 120 },
            move: { enable: true, speed: 1 },
            size: { value: 2 }
          }
        }}
      />

      {/* BACKGROUND GLOW */}

      <div className="absolute w-[500px] h-[500px] bg-indigo-600/30 blur-[200px] -top-40 -left-40 rounded-full"></div>
      <div className="absolute w-[400px] h-[400px] bg-blue-600/20 blur-[200px] bottom-0 right-0 rounded-full"></div>


      {/* NAVBAR */}

      <div className="flex justify-between items-center px-12 py-6">

        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <FaRobot /> InterviewIQ
        </h1>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/auth")}
          className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-500 transition flex items-center gap-2"
        >
          <FaSignInAlt /> Login
        </motion.button>

      </div>


      {/* HERO */}

      <div className="flex flex-col items-center text-center mt-32 px-6">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl font-bold leading-tight"
        >
          Master Interviews with
          <br />
          <span className="text-blue-500">
            AI Powered Practice
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 mt-6 max-w-2xl text-lg"
        >
          InterviewIQ simulates real interviews using artificial intelligence,
          analyzes answers and improves communication, confidence and
          technical skills.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10 flex gap-6"
        >

          <button
            onClick={() => navigate("/auth")}
            className="bg-blue-600 px-8 py-4 rounded-xl text-lg flex items-center gap-2 hover:bg-blue-500"
          >
            <FaRocket className="text-yellow-400" /> Start Practicing
          </button>

        </motion.div>

      </div>


      {/* STEPS SECTION */}

      <div className="grid md:grid-cols-3 gap-10 px-24 mt-40">

  {steps.map((item, index) => (

    <motion.div
      key={index}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.06,
        rotateX: 5,
        rotateY: 5
      }}
      transition={{ type: "spring", stiffness: 200 }}
      className="
        relative
        bg-gradient-to-br 
        from-white/10 
        to-white/5 
        backdrop-blur-xl
        border 
        border-white/10
        p-10 
        rounded-2xl 
        shadow-xl 
        text-center
        overflow-hidden
      "
    >

      {/* Glow Effect */}

      <div
        className="
          absolute 
          -top-10 
          -right-10 
          w-32 
          h-32 
          bg-blue-500/20 
          blur-3xl
        "
      ></div>

      <div className="text-blue-400 mb-4 flex justify-center text-3xl">
        {item.icon}
      </div>

      <p className="text-green-400 text-sm mb-2 font-semibold">
        {item.step}
      </p>

      <h3 className="text-xl font-semibold mb-2">
        {item.title}
      </h3>

      <p className="text-gray-400 text-sm">
        {item.desc}
      </p>

    </motion.div>

  ))}

       </div>



      {/* ADVANCED AI CAPABILITIES */}

        <div className="px-24 mt-40">

        <h2 className="text-3xl font-bold text-center mb-14">
            Advanced AI <span className="text-blue-500">Capabilities</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-10">

            {capabilities.map((item, index) => (

            <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="
                bg-white/10
                backdrop-blur-xl
                border
                border-white/10
                p-6
                rounded-xl
                flex
                flex-col
                items-center
                text-center
                shadow-lg
                "
            >

                <img
                src={item.img}
                alt={item.title}
                className="w-16 mb-4"
                />

                <h3 className="text-lg font-semibold mb-1">
                {item.title}
                </h3>

                <p className="text-gray-400 text-sm max-w-[240px]">
                {item.desc}
                </p>

            </motion.div>

            ))}

        </div>

        </div>

      {/* MULTIPLE INTERVIEW MODES */}

        <div className="mt-40 max-w-5xl mx-auto relative">

        <h2 className="text-3xl font-bold text-center mb-20">
            Multiple Interview <span className="text-blue-500">Modes</span>
        </h2>

        {/* VERTICAL LINE */}

        <div className="absolute left-1/2 top-24 bottom-0 w-[2px] bg-blue-500/40"></div>

        <div className="space-y-20">

            {modes.map((item, index) => (

            <div key={index} className="relative flex items-center">

                {/* CONNECTOR LINE */}

                <div className="absolute left-1/2 w-20 h-[2px] bg-blue-500/40"></div>

                {/* CARD */}

                <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className="ml-[55%] w-[300px] bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-xl text-center"
                >

                <img src={item.img} className="w-12 mx-auto mb-3" />

                <h3 className="text-lg font-semibold">
                    {item.title}
                </h3>

                <p className="text-gray-400 text-sm mt-1">
                    {item.desc}
                </p>

                </motion.div>

            </div>

            ))}

        </div>

        </div>

      {/* ANALYTICS */}

      <div className="px-24 mt-40 grid md:grid-cols-2 gap-16 items-center">

        <div>

          <h2 className="text-4xl font-bold mb-6">
            Track Interview Performance
          </h2>

          <p className="text-gray-400">
            AI analyzes confidence, technical knowledge and speech clarity
            to generate performance insights.
          </p>

        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-white/10 p-10 rounded-2xl"
        >

          <div className="h-48 flex items-end gap-4">

            <div className="bg-blue-500 w-6 h-[90px] rounded"></div>
            <div className="bg-blue-500 w-6 h-[140px] rounded"></div>
            <div className="bg-blue-500 w-6 h-[70px] rounded"></div>
            <div className="bg-blue-500 w-6 h-[170px] rounded"></div>
            <div className="bg-blue-500 w-6 h-[120px] rounded"></div>
            <div className="bg-blue-500 w-6 h-[150px] rounded"></div>

          </div>

        </motion.div>

      </div>


            {/* AI INTERVIEW PREVIEW */}

        <div className="flex justify-center mt-40">

        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/10 backdrop-blur-xl border border-white/10 p-10 rounded-2xl max-w-4xl w-full"
        >

            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <FaBolt className="text-blue-400" /> Live AI Interview Simulation
            </h2>

            {/* QUESTION */}

            <div className="bg-black/40 p-6 rounded-xl mb-6">

            <h3 className="font-semibold mb-2 text-blue-400">
                AI Question
            </h3>

            <p className="text-gray-300">
                Explain the concept of React Virtual DOM and how it improves performance.
            </p>

            </div>

            {/* USER RESPONSE */}

            <div className="bg-black/40 p-6 rounded-xl mb-6 text-center">

            <h3 className="font-semibold mb-4 text-green-400">
                Your Response (Speaking)
            </h3>

            <VoiceWave />

            <p className="text-gray-400 text-sm mt-4">
                AI is analyzing your speech clarity, confidence and answer quality...
            </p>

            </div>

            {/* AI FEEDBACK */}

            <div className="bg-black/40 p-6 rounded-xl">

            <h3 className="font-semibold mb-2 text-purple-400">
                AI Feedback
            </h3>

            <p className="text-gray-300">
                Good explanation of Virtual DOM concept.
                Try mentioning React reconciliation algorithm and diffing process
                for a stronger answer.
            </p>

            </div>

        </motion.div>

        </div>


        {/* TESTIMONIALS */}

        <div className="px-24 mt-40">

        <h2 className="text-4xl font-bold text-center mb-12">
            Loved by Developers
        </h2>

        <div className="grid md:grid-cols-3 gap-10">

            <Testimonial
            name="Rahul Sharma"
            role="Software Engineer"
            text="InterviewIQ helped me crack my FAANG interview."
            />

            <Testimonial
            name="Ananya Verma"
            role="Frontend Developer"
            text="AI feedback improved my confidence."
            />

            <Testimonial
            name="Arjun Mehta"
            role="Backend Developer"
            text="The best AI mock interview platform."
            />

        </div>

        </div>


        {/* CTA */}

        <div className="flex flex-col items-center text-center mt-40 pb-32">

        <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold"
        >
            Start Your AI Interview Journey Today
        </motion.h2>

        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/auth")}
            className="mt-10 bg-blue-600 px-10 py-4 rounded-xl text-lg hover:bg-blue-500 flex items-center gap-3"
        >
            <FaUserPlus />
            Create Free Account
        </motion.button>

        </div>


        {/* FOOTER */}

        <footer className="border-t border-white/10 px-24 py-16">

        <div className="grid md:grid-cols-4 gap-10">

            <div>

            <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
                <FaRobot /> InterviewIQ
            </h2>

            <p className="text-gray-400 text-sm">
                AI powered mock interview platform helping developers
                improve technical and communication skills.
            </p>

            </div>

            <div>

            <h3 className="font-semibold mb-4">Product</h3>

            <ul className="space-y-2 text-gray-400">
                <li>Mock Interviews</li>
                <li>AI Feedback</li>
                <li>Analytics</li>
            </ul>

            </div>

            <div>

            <h3 className="font-semibold mb-4">Company</h3>

            <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
            </ul>

            </div>

            <div>

            <h3 className="font-semibold mb-4">Resources</h3>

            <ul className="space-y-2 text-gray-400">
                <li>Blog</li>
                <li>Docs</li>
                <li>Support</li>
            </ul>

            </div>

        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} InterviewIQ. All rights reserved.
        </div>

        </footer>

        

    </div>

  );
};

export default Home;

const VoiceWave = () => {

  const bars = new Array(20).fill(0);

  return (
    <div className="flex items-end gap-[3px] h-16 justify-center">

      {bars.map((_, i) => (
        <motion.div
          key={i}
          animate={{ height: ["10px", "40px", "15px", "60px", "20px"] }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
            delay: i * 0.05
          }}
          className="w-[4px] bg-blue-500 rounded"
        />
      ))}

    </div>
  );
};


const Testimonial = ({ name, role, text }) => {

  return (

    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-2xl"
    >

      <div className="flex gap-1 text-yellow-400 mb-4">

        <FaStar />
        <FaStar />
        <FaStar />
        <FaStar />
        <FaStar />

      </div>

      <p className="text-gray-400 mb-4">
        {text}
      </p>

      <h4 className="font-semibold">
        {name}
      </h4>

      <p className="text-sm text-gray-500">
        {role}
      </p>

    </motion.div>

  );

};
