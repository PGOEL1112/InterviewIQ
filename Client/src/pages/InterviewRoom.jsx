import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { FaMicrophone, FaPaperPlane, FaDownload } from "react-icons/fa";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import femaleAI from "../assets/Videos/female-ai.mp4";
import maleAI from "../assets/Videos/male-ai.mp4";
import { useNavigate } from "react-router-dom";
import { current } from "@reduxjs/toolkit";

/* ==============================
   VOICE WAVEFORM COMPONENT
============================== */

const bars = new Array(20).fill(0);

const VoiceWave = () => (
  <div className="flex items-end gap-[3px] h-16 justify-center">
    {bars.map((_, i) => (
      <motion.div
        key={i}
        animate={{ height: ["10px", "40px", "15px", "60px", "20px"] }}
        transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.05 }}
        className="w-[4px] bg-blue-500 rounded"
      />
    ))}
  </div>
);
const InterviewRoom = () => {
  const navigate = useNavigate();
  const { interviewId } = useParams();
  /* ---------------------------
     STATES
  ---------------------------- */

  const [question, setQuestion] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);

  const [timeLeft, setTimeLeft] = useState(60);
  const [timeLimit, setTimeLimit] = useState(60);
  
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [analysis, setAnalysis] = useState([]);
  
  const [finalReport, setFinalReport] = useState(null);
  
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [voiceGender, setVoiceGender] = useState("male");
  const [loadingQuestion,setLoadingQuestion] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  const [aiMessage,setAiMessage] = useState("");
  const [errorMsg,setErrorMsg] = useState("");

  const [introMessage,setIntroMessage] = useState("");
  const [isTimeUp, setIsTimeUp] = useState(false);

  const [startTimer, setStartTimer] = useState(false);
 
  const hasSubmittedRef = useRef(false);
  const submitTypeRef = useRef(null); 


  const [interviewMode, setInterviewMode] = useState("Technical");
  const [phase, setPhase] = useState("tech"); // tech → hr
  
  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const typingRef = useRef(null);

   const reportRef = useRef();

  const api = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true
  });

  /* ---------------------------
     GENERATE QUESTION
  ---------------------------- */

  const generateQuestion = async () => {
   if (loadingQuestion || !introDone) return;
    setLoadingQuestion(true);
    console.log("🔥 GENERATE QUESTION CALLED");
    try{  
      const token = localStorage.getItem("token");

      const res = await api.post(
      `/interview/question/${interviewId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
    const data = res.data;
    console.log("📥 NEW QUESTION:", data.questionNumber);
    setInterviewMode(data.interviewType);

    let gender = "male";

    if(data.interviewType === "HR"){
      gender = "female";
    }
    else if (data.interviewType === "Technical") {
      gender = "male";
    }
    
    else if (data.interviewType === "Mixed") {
      if (data.questionNumber <= 5) {
        gender = "male";
        setPhase("tech");
      } else {
        gender = "female";
        setPhase("hr");
      }
    }
    setVoiceGender(gender);

    if (
      data.interviewType === "Mixed" &&
      phase === "tech" &&
      data.questionNumber === 6
    ) {
      setVoiceGender("female"); // switch UI video

      typeText(
        "Now it's time to conduct HR Interview. Let's begin.",
        "question"
      );

      window.speechSynthesis.cancel();

      setTimeout(() => {
        speakText(
          "Now it's time to conduct HR Interview. Let's begin.",
          false,
          false,
          "female"
        );
      }, 300);
      return; // 🚨 IMPORTANT → stop normal question
    }

    if(timerRef.current){
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setQuestion(data.question);
    setAnswer("");
    setFeedback("");
    setStartTimer(false);
    hasSubmittedRef.current=false;
    setDifficulty(data.difficulty);

    setTimeLimit(data.timeLimit || 60);
    setTimeLeft(data.timeLimit || 60);
    setQuestionNumber(data.questionNumber);
    setTotalQuestions(data.totalQuestions);
    typeText(data.question, "question");
    window.speechSynthesis.cancel();  

    videoRef.current?.pause();
    videoRef.current.currentTime = 0;

    setTimeout(()=>{
      speakText(data.question, false, true, gender);
    },300);

  }
  catch(err){
    console.log("Question error:",err);
  }

  finally{
    setLoadingQuestion(false);
  }

  };

  /* ---------------------------
     AI SPEAK FUNCTION
  ---------------------------- */

  const speakText = (text, urgent=false, startTimerAfter=false, gender="male") => {

    if (!window.speechSynthesis) return;

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    const voices = speechSynthesis.getVoices();
  
    if(!voices.length){
      speechSynthesis.onvoiceschanged = () => speakText(text);
      return;
    }

    let selectedVoice;
    if (gender === "female") {

      selectedVoice = voices.find(v =>
        v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("samantha")
      );

    } else {

      selectedVoice = voices.find(v =>
        v.name.toLowerCase().includes("david") ||
        v.name.toLowerCase().includes("mark")
      );

    }

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.voice = selectedVoice;

    utterance.rate = urgent ? 1.2 : 0.92;
    utterance.pitch = urgent ? 1.3 : 1.05;

    utterance.volume = 1;
    utterance.onstart = () => {
      setIsAISpeaking(true);
      videoRef.current?.play();

    };

    utterance.onend = () => {

      console.log("🗣 SPEECH ENDED → should start timer");
      if (!startTimerAfter && introDone) return;
      setIsAISpeaking(false);
      videoRef.current?.pause();
      videoRef.current.currentTime = 0;

      if (!introDone) {
        setIntroDone(true);
        setIntroMessage("");
      } 
      else if(startTimerAfter){
        setTimeout(() => {
          setStartTimer(true);
        }, 200);
      }
    };

    speechSynthesis.speak(utterance);
  };

 const typeText = (text, mode = "question") => {
  const setter = mode === "intro" ? setIntroMessage : setAiMessage;
  
  if (typingRef.current) {
    clearInterval(typingRef.current);
  }
  setter("");
  let i = 0;
  typingRef.current = setInterval(() => {
    setter(text.slice(0, i + 1)); 
    i++;
    if (i >= text.length) {
      clearInterval(typingRef.current);
    }
  }, 25);
};

  const playIntro = () => {
    const userName = localStorage.getItem("name") || "User";

    const welcomeText = `
  Hello ${userName}! Welcome to your AI mock interview.

  I will ask you a series of questions based on your role.

  Try to answer clearly and confidently.

  Let's begin your interview.
  `;

  typeText(welcomeText,"intro");
  speakText(welcomeText);

};

  /* ---------------------------
     SPEECH TO TEXT
  ---------------------------- */

  const startListening = () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

      if(!SpeechRecognition){
        setErrorMsg("⚠ Speech recognition not supported");
        setTimeout(()=>setErrorMsg(""),2000);
        return;
      }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;

    recognition.onresult = (event) => {

      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setAnswer(transcript);

    };

    recognition.start();
    recognitionRef.current = recognition;

  };


  useEffect(() => {
    console.log("⏱ TIMER CHECK:", startTimer, "Q:", questionNumber);
    
    if (!startTimer) return; 
    if(timerRef.current) return;
    
    timerRef.current = setInterval(() => {

      setTimeLeft(prev => {
        if (prev ===8) {
          window.speechSynthesis.cancel();
          speakText("Hurry up! Only 5 seconds left!", true, false, voiceGender); // true = urgent tone
        }

        if (prev <= 1) {
          if (hasSubmittedRef.current) return 0;
          clearInterval(timerRef.current);
          timerRef.current = null;
          submitTypeRef.current = "auto";
          submitAnswer("auto");
          return 0;
        }

        return prev - 1;

      });

    }, 1000);

    return () =>  {
      clearInterval(timerRef.current);
      timerRef.current=null;
    };

  }, [startTimer]);

  const submitAnswer = async (type="manual") => {
    if(hasSubmittedRef.current) return;
    hasSubmittedRef.current=true;
    submitTypeRef.current=type;

     if(timerRef.current){
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

    setStartTimer(false); 
    recognitionRef.current?.stop();
    
    const finalAnswer = answer?.trim() || "";
    
    if (type === "manual" && finalAnswer.length < 3) {
      setErrorMsg("⚠ Please answer before submitting");
      hasSubmittedRef.current = false;
      return;
    }

    setIsSubmitting(true);
    try{
      const token = localStorage.getItem("token");
      const res = await api.post(
      `/interview/answer/${interviewId}`,
      {
        answer : finalAnswer, 
        timeTaken:  type === "auto" ? timeLimit : Math.max(0,timeLimit - timeLeft)
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = res.data;
    if (type === "auto") {
        setIsTimeUp(true);
        setFeedback({
          text: "⏰ Time over! You couldn't answer this question.",
          ideal: data.idealAnswer || "No answer available."
        });

        speakText(
          "Time is up. Moving to next question.",
          false,
          false,
          voiceGender
        );

      } else {
        setIsTimeUp(false);
        setFeedback({
          text: data.feedback || "Answer submitted successfully.",
          ideal: data.idealAnswer
        });
      }

    setAnalysis(prev => [
      ...prev,
      {
        question,
        answer:finalAnswer,
        score: data.score,
        confidence: data.confidence,
        communication: data.communication,
        correctness: data.correctness,
        feedback: data.feedback
      }
    ]);
  }

  catch(err){
    console.log("Submit error",err);
  } 
  finally{
     setIsSubmitting(false);
  }
  };

  /* ---------------------------
     NEXT QUESTION
  ---------------------------- */

  const nextQuestion = () => {
    if (questionNumber >= totalQuestions) {
      finishInterview();
      return;
    }

     window.speechSynthesis.cancel();
      setIsAISpeaking(false);
      setLoadingQuestion(false);


    recognitionRef.current?.stop();

    if(timerRef.current){
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setStartTimer(false);
     setIsTimeUp(false);
    setAnswer("");
    setFeedback("");
    hasSubmittedRef.current=false;
    submitTypeRef.current=null;

    setTimeout(() => {
      generateQuestion();
    }, 1000);
  };

const finishInterview = async () => {
  try{
    const token = localStorage.getItem("token");

    await api.post(
      `/interview/complete/${interviewId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const interviewType = interviewMode;
     let gender = "male";

    if (interviewType === "HR") {
      gender = "female";
    } 
    else if (interviewType === "Technical") {
      gender = "male";
    } 
    else if (interviewType === "Mixed") {
      // Mixed → ending HR hota hai → female
      gender = "female";
    }

   speakText(
   "Thank you for completing your interview. Your performance has been analyzed successfully. You can now view your detailed report and insights on your dashboard.",
   false,
   false,
   gender
  );
    setTimeout(() => {
      navigate("/dashboard");
    }, 12500);

  }catch(err){
    console.log("Finish error:", err);
    const interviewType = interviewMode;
    let gender = interviewType === "HR" ? "female" : "male";
    speakText(
      "Thank you for completing your interview. Your performance has been analyzed successfully. You can now view your detailed report and insights on your dashboard.",
      false,
      false,
      gender
    );
    setTimeout(() => {
      navigate("/dashboard");
    }, 12500);
  }
};

  /* ==========================
     FIRST LOAD
  ========================== */
    useEffect(()=>{
        speechSynthesis.onvoiceschanged = () => {
        speechSynthesis.getVoices();
        }
    },[]);

useEffect(() => {
  if (introDone) {
    generateQuestion();
  }
}, [introDone]);


useEffect(() => {
  if(interviewId && !introDone){
    playIntro();
  }
}, [interviewId, introDone]);


  /* ---------------------------
     UI
  ---------------------------- */

  return(

<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] text-white p-10">

<motion.div
initial={{opacity:0,scale:0.95}}
animate={{opacity:1,scale:1}}
transition={{duration:0.6}}
className="w-[1200px] grid grid-cols-[360px_1fr] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
>

{/* LEFT PANEL */}

<div className="p-8 border-r border-white/10 flex flex-col items-center gap-6">

<motion.div
animate={{boxShadow:[
"0 0 0px rgba(59,130,246,0.3)",
"0 0 40px rgba(59,130,246,0.6)",
"0 0 0px rgba(59,130,246,0.3)"
]}}
transition={{duration:3,repeat:Infinity}}
className="rounded-2xl overflow-hidden border border-white/10"
>

<video key={voiceGender} ref={videoRef} muted loop className="w-[300px]">
<source
src={voiceGender==="female"?femaleAI:maleAI}
type="video/mp4"
/>
</video>

</motion.div>

<div className="text-gray-300 text-sm text-center min-h-[40px]">
{introMessage || (isAISpeaking ? "AI Speaking..." : "AI Listening")}
</div>

{isAISpeaking && <VoiceWave/>}

{/* TIMER */}

<div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">

<div className={`w-28 mx-auto ${timeLeft <= 10 ? "animate-pulse" : ""}`}>

<CircularProgressbar
value={timeLeft}
maxValue={timeLimit}
text={`${timeLeft}s`}
styles={{
path:{
  stroke: timeLeft <= 10 ? "#ef4444" : "#3b82f6"
},
trail:{stroke:"#1e293b"},
text:{fill:"#fff",fontSize:"20px"}
}}
/>

</div>

<p className="text-gray-400 mt-3">
Interview Timer
</p>

</div>

{/* QUESTION PROGRESS */}

<div className="w-full mt-2">

<div className="flex items-center justify-between">

{Array.from({ length: totalQuestions }).map((_, i) => {

const step = i + 1;

return (

<div key={i} className="flex-1 flex items-center">

{/* circle */}

<div
className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold
${step < questionNumber
? "bg-green-500 text-white"
: step === questionNumber
? "bg-blue-500 text-white"
: "bg-gray-700 text-gray-400"
}`}
>
{step < questionNumber ? "✓" : step}
</div>

{/* line */}

{i !== totalQuestions - 1 && (
<div
className={`flex-1 h-[2px]
${step < questionNumber ? "bg-green-500" : "bg-gray-700"}`}
/>
)}

</div>

);

})}

</div>

<p className="text-xs text-gray-400 mt-2 text-center">
Interview Progress
</p>

</div>

</div>


{/* RIGHT PANEL */}

<div className="p-10 flex flex-col gap-8">

<div>
  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
    AI Smart Interview
  </h2>
</div>

{loadingQuestion && (
  <p className="text-blue-400 text-sm animate-pulse">
    Generating question...
  </p>
)}

{/* QUESTION CARD */}

<motion.div
initial={{y:20,opacity:0}}
animate={{y:0,opacity:1}}
className="bg-white/5 border border-white/10 p-6 rounded-2xl"
>

<p className="text-gray-400 text-sm uppercase tracking-widest">
Question {questionNumber} of {totalQuestions}
</p>

<p className="text-xs text-indigo-400 mt-1">
  Difficulty: {difficulty}
</p>

<p className="mt-3 text-lg text-gray-200 font-medium leading-relaxed">
  {aiMessage}
</p>

</motion.div>

{/* ANSWER */}

<textarea
value={answer}
disabled={isTimeUp}
onChange={(e)=>setAnswer(e.target.value)}
placeholder="Type your answer here..."
className="w-full h-[230px] p-6 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

{/* BUTTONS */}

<div className="flex gap-4">

<motion.button
whileHover={{scale:1.05}}
disabled={isTimeUp}
whileTap={{scale:0.95}}
onClick={startListening}
className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500"
>
<FaMicrophone/>
Speak
</motion.button>

<motion.button
whileHover={{scale:1.05}}
disabled={isSubmitting || isTimeUp}
whileTap={{scale:0.95}}
onClick={() => submitAnswer("manual")}
className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500"
>
<FaPaperPlane/>
Submit
</motion.button>

</div>

{errorMsg && (
  <div className="text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-sm">
    {errorMsg}
  </div>
)}


{/* FEEDBACK */}

{feedback&&(

<motion.div
initial={{opacity:0}}
animate={{opacity:1}}
className="bg-emerald-500/10 border border-emerald-400/30 p-6 rounded-2xl"
>

<p className="text-emerald-300">{feedback?.text}</p>

<div className="mt-3 text-gray-300 text-sm">
  <b>Suggested Answer:</b>
  <p className="mt-1 text-gray-400">{feedback?.ideal}</p>
</div>


{questionNumber<totalQuestions?(
<button
onClick={nextQuestion}
className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500"
>
Next Question →
</button>
):(
<button
onClick={async () => {
  await finishInterview();
}}
className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500"
>
Finish Interview
</button>
)}

</motion.div>

)}

</div>

</motion.div>
</div>

)
};

export default InterviewRoom;