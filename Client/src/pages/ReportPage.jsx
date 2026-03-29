import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const ReportPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(
          `/interview/report-data/${id}`,
          { withCredentials: true }
        );
        setData(res.data.interview);
      } catch (err) {
        console.log(err.response?.data || err.message);
      }
    };

    fetchReport();
  }, [id]);

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );

    const score = data.overallScore || 0;
    const percentage = score * 10;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10">

      {/* HEADER */}
      <h1 className="text-4xl font-bold mb-10 text-center">
        🚀 Interview Report
      </h1>

      {/* ================= SCORE CARD ================= */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-10 mb-10 shadow-xl flex flex-col items-center justify-center">

        <p className="text-gray-400 mb-6 text-lg">
          Overall Performance
        </p>

        {/* CIRCLE */}
        <div className="relative w-40 h-40">

          <svg className="w-full h-full rotate-[-90deg]">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#1f2937"
              strokeWidth="12"
              fill="transparent"
            />

            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * percentage) / 100}
              strokeLinecap="round"
            />

            <defs>
              <linearGradient id="gradient">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
          </svg>

          {/* SCORE TEXT */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-white">
              {score}/10
            </p>
          </div>

        </div>

        {/* FEEDBACK */}
        <p className="mt-6 text-gray-300 text-center max-w-sm text-sm leading-relaxed">
          {score >= 8
            ? "Excellent performance. You're interview-ready 🚀"
            : score >= 5
            ? "Good attempt, but improvement needed ⚡"
            : "Significant improvement required 📉"}
        </p>

      </div>

      {/* ================= AI SUMMARY ================= */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">

        {/* FEEDBACK */}
        <div className="bg-white/10 border border-white/10 p-6 rounded-2xl">
          <h2 className="text-blue-400 text-lg mb-3 font-semibold">
            🤖 AI Feedback
          </h2>
          <p className="text-gray-300 leading-relaxed">
            {data.aiSummary?.finalFeedback}
          </p>
        </div>

        {/* STRENGTH */}
        <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl">
          <h2 className="text-green-400 text-lg mb-3 font-semibold">
            ✅ Strengths
          </h2>
          {data.aiSummary?.strengths?.map((s, i) => (
            <p key={i} className="text-gray-300 mb-1">
              • {s}
            </p>
          ))}
        </div>

        {/* WEAKNESS */}
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl md:col-span-2">
          <h2 className="text-red-400 text-lg mb-3 font-semibold">
            ⚠ Weaknesses
          </h2>
          {data.aiSummary?.weaknesses?.map((w, i) => (
            <p key={i} className="text-gray-300 mb-1">
              • {w}
            </p>
          ))}
        </div>

      </div>

      {/* ================= QUESTIONS ================= */}
      <div>
        <h2 className="text-2xl text-yellow-400 mb-6 font-semibold">
          📌 Question Analysis
        </h2>

        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">

          {data.questions.map((q, i) => (
            <div
              key={i}
              className="bg-white/10 border border-white/10 p-6 rounded-2xl backdrop-blur-xl"
            >

              {/* QUESTION */}
              <p className="text-blue-400 font-semibold mb-2">
                Q{i + 1}: {q.question}
              </p>

              {/* ANSWER */}
              <p className="text-gray-300 mb-2">
                <span className="text-gray-400">Your Answer:</span>{" "}
                {q.answer || "No answer"}
              </p>

              {/* SCORE */}
              <p className="text-green-400 font-semibold mb-3">
                Score: {q.score || 0}/10
              </p>

              {/* FEEDBACK */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg mb-3">
                <p className="text-indigo-300 text-sm leading-relaxed">
                  {q.feedback}
                </p>
              </div>

              {/* IDEAL ANSWER */}
              {q.idealAnswer && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                  <p className="text-yellow-300 text-sm font-semibold mb-1">
                    AI Suggested Answer
                  </p>
                  <p className="text-gray-300 text-sm">
                    {q.idealAnswer}
                  </p>
                </div>
              )}

            </div>
          ))}

        </div>
      </div>

    </div>
  );
};

export default ReportPage;
