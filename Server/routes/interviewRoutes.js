import express from "express";

import uploadResume from "../middlewares/uploadResume.js";
import uploadAudio from "../middlewares/uploadAudio.js";
import isAuth from "../middlewares/isAuth.js";

import {
  resumeAnalysis,
  startInterview,
  startResumeInterview,
  generateQuestion,
  submitAnswer,
  completeInterview,
  getInterviewHistory,
  getSingleInterview,
  voiceAnswerEvaluation,
  deleteInterview,
  getReport,
  getReportData,
} from "../controllers/interviewContoller.js";

const router = express.Router();

router.post("/start", isAuth, startInterview);

router.post(
  "/resume",
  isAuth,
  uploadResume.single("resume"),
  resumeAnalysis
);

router.post(
  "/resume-interview",
  isAuth,
  uploadResume.single("resume"),
  startResumeInterview
);


router.post("/question/:interviewId", isAuth, generateQuestion);
router.post("/answer/:interviewId", isAuth, submitAnswer);
router.post(
  "/voice-answer",
  isAuth,
  uploadAudio.single("audio"),
  voiceAnswerEvaluation
);

router.post("/complete/:interviewId", isAuth, completeInterview);
router.get("/report-data/:interviewId", isAuth, getReportData);

// 📄 PDF REPORT
router.get("/report/:interviewId", isAuth, getReport);
router.get("/history", isAuth, getInterviewHistory);
router.get("/:interviewId", isAuth, getSingleInterview);
router.delete("/:interviewId", isAuth, deleteInterview);

export default router;
