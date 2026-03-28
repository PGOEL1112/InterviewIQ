import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  role: {
    type: String,
    required: true
  },

  experienceLevel: {
    type: String,
    enum: ["Fresher", "Junior", "Mid", "Senior"],
    default: "Fresher"
  },

  interviewType: {
    type: String,
    enum: ["HR", "Technical", "Mixed"],
    default: "Technical"
  },

  questions: [
    {
      question: String,
      difficulty: String,
      timeLimit: Number,

      askedAt: {
        type: Date,
        default: Date.now
      },

      answer: String,
      answerdAt: Date,

      score: {
        type: Number,
        default: 0
      },

      confidence: {
        type: Number,
        default: 0
      },

      communication: {
        type: Number,
        default: 0
      },

      correctness: {
        type: Number,
        default: 0
      },

      feedback: String,

      // 🔥 ADD THIS HERE (CORRECT PLACE)
      idealAnswer: String
    }
  ],

  overallScore: {
    type: Number,
    default: 0
  },

  aiSummary: {
    overallScore: Number,
    communicationScore: Number,
    technicalScore: Number,
    strengths: [String],
    weaknesses: [String],
    finalFeedback: String
  },

  resumeUsed: {
    type: Boolean,
    default: false
  },

  duration: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["started", "completed", "abandoned"],
    default: "started"
  },

  totalQuestions: {
    type: Number,
    default: 5
  },

  startedAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
});

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;