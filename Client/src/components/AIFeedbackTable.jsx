import { motion } from "framer-motion";
import { FaFilePdf, FaTrash } from "react-icons/fa";

const AIFeedbackUltra = ({ interviews, onDelete }) => {
  return (
    <div className="p-6 space-y-6">

      {/* TITLE */}
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        AI Feedback Reports
      </h2>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-white/10 backdrop-blur-xl">

        {/* HEADER */}
        <div className="grid grid-cols-5 px-6 py-4 text-gray-400 border-b border-white/10">
          <p>Role</p>
          <p className="text-center">Interview Type</p>
          <p className="text-center">Score</p>
          <p>Status</p>
          <p className="text-right">Actions</p>
        </div>

        {/* ROWS */}
        {interviews.map((i) => {

          const score = i.overallScore || 0;
          const status = i.status==="completed" ? "Completed ✅" : "Pending ⏳";
          const interviewType = i.interviewType;
          return (
            <div key={i._id}>

              {/* MAIN ROW */}
              <motion.div
                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                className="grid grid-cols-5 px-5 py-3 border-b border-white/10 items-center"
              >

                {/* ROLE */}
                <p className="font-medium">{i.role}</p>

                {/* Interview type */}
                <div className="flex items-center justify-center">
                <p className="text-gray-400">{interviewType}</p>
                </div>

                {/* SCORE + PIE */}
                <div className="flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-400">
                    {score}
                  </span>

                </div>

                {/* STATUS */}
                <p className="text-gray-400">{status}</p>

                {/* ACTIONS */}
                <div className="flex justify-end gap-4">

                  {/* DOWNLOAD PDF */}
                  <button
                    onClick={() => {
                     window.open(
                        `https://interviewiq-0iq8.onrender.com/api/interview/report/${i._id}`,
                        "_blank"
                      );
                    }}
                    className="flex items-center gap-2 hover:text-green-400 transition"
                  >
                    <FaFilePdf />
                    <span className="text-sm">Download</span>
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => onDelete(i._id)}
                    className="flex items-center gap-2 hover:text-red-500 transition"
                  >
                    <FaTrash />
                    <span className="text-sm">Delete</span>
                  </button>

                </div>

              </motion.div>
            </div>
          );
        })}

      </div>

    </div>
  );
};

export default AIFeedbackUltra;
