import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Area
} from "recharts";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

/* ================= SCORE CIRCLES ================= */

const ScoreCircle = ({ score }) => {
  const feedback =
    score < 4
      ? "Significant improvement required"
      : score < 7
      ? "Good, but can improve"
      : "Excellent performance";

  return (
    <div className="bg-[#111827] border border-white/10 p-6 rounded-2xl text-center">
      <p className="text-gray-400 text-sm">Overall Performance</p>

      <div className="mt-4 flex justify-center">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full">
            <circle cx="56" cy="56" r="50" stroke="#1f2937" strokeWidth="8" fill="none" />
            <circle
              cx="56"
              cy="56"
              r="50"
              stroke="#22c55e"
              strokeWidth="8"
              fill="none"
              strokeDasharray={314}
              strokeDashoffset={314 - (score / 10) * 314}
              strokeLinecap="round"
              transform="rotate(-90 56 56)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
            {score}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-300">{feedback}</p>
    </div>
  );
};

const CircleStat = ({ label, value, color }) => {
  const feedback =
    value < 4 ? "Needs improvement"
    : value < 7 ? "Good"
    : "Strong";

  return (
    <div className="bg-[#111827] border border-white/10 p-6 rounded-2xl text-center">
      <p className="text-gray-400 text-sm">{label}</p>

      <div className="mt-4 flex justify-center">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full">
            <circle cx="48" cy="48" r="40" stroke="#1f2937" strokeWidth="6" fill="none" />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke={color}
              strokeWidth="6"
              fill="none"
              strokeDasharray={251}
              strokeDashoffset={251 - (value / 10) * 251}
              strokeLinecap="round"
              transform="rotate(-90 48 48)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
            {value}
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-300">{feedback}</p>
    </div>
  );
};

/* ================= MAIN ================= */

const PremiumAnalytics = ({ interviews }) => {
   const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleClick = () => setOpen(false);
    if (open) {
      window.addEventListener("click", handleClick);
    }
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [open]);

  const selected = interviews[selectedIndex];

  if (!interviews || interviews.length === 0) {
    return <p className="text-white">No interviews found</p>;
  }
  const avgScore = (
    interviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) /
    (interviews.length || 1)
  ).toFixed(1);

  const confidence =
    selected?.questions?.reduce((s, q) => s + (q.confidence || 0), 0) /
    (selected?.questions?.length || 1);

  const communication =
    selected?.questions?.reduce((s, q) => s + (q.communication || 0), 0) /
    (selected?.questions?.length || 1);

  const correctness =
    selected?.questions?.reduce((s, q) => s + (q.score || 0), 0) /
    (selected?.questions?.length || 1);

  const lineData =
    selected?.questions?.map((q, i) => ({
      name: `Q${i + 1}`,
      score: q.score || 0
    })) || [];

  return (
    <div className="p-6 space-y-6 text-white">

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-6">
        <ScoreCircle score={Number(avgScore)} />
        <CircleStat label="Confidence" value={confidence.toFixed(1)} color="#3b82f6" />
        <CircleStat label="Communication" value={communication.toFixed(1)} color="#22c55e" />
        <CircleStat label="Correctness" value={correctness.toFixed(1)} color="#f59e0b" />
      </div>

      {/* 🔥 DROPDOWN (REPLACED BUTTONS) */}
      <div className="relative w-full max-w-md">

  {/* SELECTED */}
  <div
    onClick={(e) => {
      e.stopPropagation();
      setOpen(!open);
    }}
    className="cursor-pointer bg-gradient-to-r from-[#0f172a] to-[#020617] border border-white/10 px-5 py-4 rounded-xl flex justify-between items-center hover:border-blue-500 transition"
  >
    <span className="text-sm font-medium">
      {selected.role} • {selected.interviewType} • {selected.overallScore}/10
    </span>

    <span className={`transition ${open ? "rotate-180" : ""}`}>
      ⌄
    </span>
  </div>

      {/* OPTIONS */}
      {open && (
        <div className="absolute w-full mt-2 bg-[#020617] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">

          {interviews.map((i, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSelectedIndex(idx);
                setOpen(false);
              }}
              className={`px-5 py-4 cursor-pointer transition flex justify-between items-center
              ${
                selectedIndex === idx
                  ? "bg-blue-500/20"
                  : "hover:bg-white/5"
              }`}
            >
              <div>
                <p className="text-sm font-medium">
                  {i.role}
                </p>
                <p className={`text-xs ${
                    i.interviewType === "Technical"
                      ? "text-blue-400"
                      : "text-green-400"
                  }`}>
                    {i.interviewType} • {new Date(i.createdAt).toLocaleDateString()}
                  </p>
              </div>

              <span className="text-sm text-blue-400 font-semibold">
                {i.overallScore}/10
              </span>
            </div>
          ))}

        </div>
      )}
    </div>

      {/* PERFORMANCE TREND */}
      <Card title="📈 Performance Trend">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={lineData}>

            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4}/>
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis domain={[0,10]} stroke="#94a3b8" />
            <Tooltip />

            <Area
              type="monotone"
              dataKey="score"
              fill="url(#areaGradient)"
              stroke="none"
            />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{ r: 5 }}
            />

          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* AI INSIGHTS */}
      <Card title="🤖 AI Insights">

        {selected && (
          <div className="bg-[#020617] p-6 rounded-2xl">

            <div className="flex justify-between mb-4">
              <h3 className="text-blue-400 font-semibold">
                {selected.role}
              </h3>

              <span className={`text-xs px-3 py-1 rounded-full ${
                  selected.interviewType === "Technical"
                    ? "bg-blue-500 text-white"
                    : "bg-green-500 text-black"
                }`}>
                  {selected.interviewType}
                </span>
            </div>

            <p className="text-gray-400 mb-4 text-sm">
              This section summarizes your interview performance including strengths and weaknesses.
            </p>

            <p className="text-gray-300 mb-6">
              {selected.aiSummary?.finalFeedback}
            </p>

            <div className="grid md:grid-cols-2 gap-4">

              <div className="bg-green-500/10 p-4 rounded-lg">
                <p className="text-green-400 mb-2">Strengths</p>
                {selected.aiSummary?.strengths?.map((s,i)=>(
                  <p key={i}>• {s}</p>
                ))}
              </div>

              <div className="bg-red-500/10 p-4 rounded-lg">
                <p className="text-red-400 mb-2">Weaknesses</p>
                {selected.aiSummary?.weaknesses?.map((w,i)=>(
                  <p key={i}>• {w}</p>
                ))}
              </div>

            </div>

          </div>
        )}

      </Card>

      {/* QUESTIONS */}
      <Card title="📌 Question Breakdown">

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">

          {selected?.questions?.map((q,i)=>(
            <div key={i} className="bg-white/5 p-5 rounded-xl border border-white/10">

              <p className="text-blue-400 font-medium mb-2">
                Q{i+1}: {q.question}
              </p>

              <p className="text-gray-300 mb-1">
                <span className="text-gray-400">Answer:</span> {q.answer || "No answer"}
              </p>

              <p className="text-green-400 mb-1">
                Score: {q.score}/10
              </p>

              <p className="text-gray-400 text-sm">
                Feedback: {q.feedback}
              </p>

            </div>
          ))}

        </div>

      </Card>

    </div>
  );
};

/* ================= CARD ================= */

const Card = ({ title, children }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl shadow-lg"
  >
    <h2 className="mb-4 text-lg">{title}</h2>
    {children}
  </motion.div>
);

export default PremiumAnalytics;