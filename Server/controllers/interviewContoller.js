import Interview from "../models/interviewModel.js";
import fs from "fs";
import {
  callAI,
  evaluateAnswer,
  generateFollowupQuestion,
  generateInterviewReport,
  generateResumeQuestions
} from "../services/openRouterServices.js";

import { analyzeResume } from "../services/resumeService.js";
import User from "../models/userModel.js";
import { speechToText } from "../utils/speechToText.js";
import { textToSpeech } from "../utils/textToSpeech.js";
import PDFDocument from "pdfkit";
import { generateFinalReport } from "../services/reportService.js";

export const startInterview = async (req, res) => {

  try {

    const { role, experienceLevel, interviewType } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.credits !== -1 && user.credits < 10) {
      return res.status(403).json({
        message: "Not enough credits. Upgrade plan."
      });
    }

    if (user.credits !== -1) {
      await User.findByIdAndUpdate(
        user._id,
        { $inc: { credits: -10 } }
      );
    }

    const interview = await Interview.create({
      user: req.user._id,
      role,
      experienceLevel,
      interviewType,
      questions: [],
      duration: Date.now()
    });

    const updatedUser = await User.findById(user._id);

    res.status(201).json({
      success: true,
      interview,
      credits: updatedUser.credits
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

export const upgradePlan = async (req, res) => {

  try {

    const { plan } = req.body;

    const user = await User.findById(req.user._id);

    if (plan === "pro") {
      user.plan = "pro";
      user.credits = 1200;
    }

    if (plan === "elite") {
      user.plan = "elite";
      user.credits = -1;
    }

    await user.save();

    res.json({
      success: true,
      plan: user.plan,
      credits: user.credits
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

};

export const generateQuestion = async (req, res) => {

  try {
    const interviewId = req.params.interviewId;
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found"
      });
    }

    if (
      interview.updatedAt &&
      Date.now() - interview.updatedAt.getTime() < 1500
    ) {
      return res.status(429).json({
        message: "Please wait before requesting another question"
      });
    }

    let maxQuestions = interview.interviewType === "Mixed" ? 10 : 5;

    if (interview.questions.length >= maxQuestions) {
      return res.status(400).json({
        message: "Interview completed. Maximum questions reached."
      });
    }

    /* -----------------------------
       Difficulty logic
    ----------------------------- */

    let difficulty = "medium";

    if (interview.questions.length > 0) {

      const lastScore =
        interview.questions[interview.questions.length - 1].score || 0;

      if (lastScore >= 8) difficulty = "hard";
      else if (lastScore >= 5) difficulty = "medium";
      else difficulty = "easy";

    }

    /* -----------------------------
       Generate question
    ----------------------------- */

    let questionText;
    let type = interview.interviewType;

    if (interview.interviewType === "Mixed") {
      maxQuestions = 10;
    }

    if (type === "Mixed") {
      if (interview.questions.length < 5) {
        type = "Technical";   // first 5
      } else {
        type = "HR";          // next 5
      }
    }

    if (interview.questions.length === 0) {

      const messages = [
        {
          role: "system",
          content: type === "HR"
            ? `
      You are a professional HR interviewer.

      You adapt questions based on candidate background:
      - TECH → project, teamwork, challenges
      - NON-TECH → leadership, decision-making, communication
      `
            : `
      You are a professional interviewer.

      You adapt technical questions based on candidate background:

      TECH BACKGROUND (BTech, BCA, MCA, developers):
      → Ask DSA, OOPs, DBMS, OS, coding, project-based questions

      NON-TECH BACKGROUND (BBA, MBA, PGDM):
      → DO NOT ask coding
      → Ask business logic, analytical thinking, case-based questions
      `
        },
        {
          role: "user",
          content: `
      Generate ONE UNIQUE and high-quality interview question.

      Rules:
      - Must be grammatically correct English
      - Must be meaningful and practical
      - Do NOT generate generic questions
      - Keep it appropriate for ${interview.experienceLevel}

      Role: ${interview.role}
      Experience Level: ${interview.experienceLevel}
      Interview Type: ${type}

      📌 LOGIC:

      IF Technical:
      - TECH → coding / core CS / project
      - NON-TECH → logical / business / analytical

      IF HR:
      - TECH → project, teamwork, challenges
      - NON-TECH → leadership, decision-making

      Return ONLY the question text.
      `
        }
      ];

      questionText = await callAI(messages);

    } else {

      const lastQuestion =
        interview.questions[interview.questions.length - 1].question;

      const lastAnswer =
        interview.questions[interview.questions.length - 1].answer || "";

      if (type === "HR") {
        const previousQuestions = interview.questions
          .map(q => q.question)
          .join("\n");

        questionText = await callAI([
          {
            role: "system",
            content: `
          You are an HR interviewer.

          Adapt questions based on background:
          - TECH → projects, teamwork, challenges
          - NON-TECH → leadership, communication, decision making
          `
          },
          {
            role: "user",
            content: `
      Ask a UNIQUE ${difficulty} HR interview question.

      IMPORTANT:
      - Do NOT repeat any of these questions:
      ${previousQuestions}

      - Make it fresh and different
      - Role: ${interview.role}
      - Experience: ${interview.experienceLevel}
        
      📌 LOGIC:
        - TECH → project-based / teamwork / challenges
        - NON-TECH → leadership / decision making / communication
        Return ONLY the question.
      `
          }
        ]);
      } else {

        const previousQuestions = interview.questions
          .map(q => q.question)
          .join("\n");

        questionText = await callAI([
          {
            role: "system",
            content: `
          You are a technical interviewer.

          Adapt questions based on background:

          TECH:
          → DSA, OOPs, DBMS, OS, coding, projects

          NON-TECH:
          → business logic, analytical thinking
          → DO NOT ask coding
          `
          },
          {
            role: "user",
            content: `
        Ask a UNIQUE ${difficulty} technical interview question.

        DO NOT repeat any of these questions:
        ${previousQuestions}

        Role: ${interview.role}
        📌 LOGIC:
        - TECH → DSA / OOP / DBMS / coding
        - NON-TECH → logical / analytical / business problem
        Return ONLY the question.
        `
          }
        ]);

      }

    }

    const index = interview.questions.length;
    const timers = [60, 60, 90, 90, 120];
    const timeLimit = timers[index] || 90;

    let audioPath = null;

    try {
      if (questionText) {
        audioPath = await textToSpeech(questionText);
      }
    } catch (err) {
      console.log("TTS failed:", err);
      audioPath = null;
    }

    interview.questions.push({
      question: questionText.trim(),
      difficulty,
      timeLimit
    });

    await interview.save();

    res.json({
      success: true,
      question: questionText.replace(/["]/g, "").trim(),
      difficulty,
      timeLimit,
      audio: audioPath,
      questionNumber: interview.questions.length,
      totalQuestions: maxQuestions,
      interviewType: type,
    });

  } catch (error) {

    console.error("Generate Question Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};



export const submitAnswer = async (req, res) => {

  try {

    const { interviewId } = req.params;
    const { answer, timeTaken, submitType } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found"
      });
    }

    if (interview.questions.length === 0) {
      return res.status(400).json({
        message: "No question generated yet"
      });
    }

    const questionIndex = interview.questions.length - 1;
    const questionObj = interview.questions[questionIndex];

    const questionText = questionObj.question;

    if (!answer || answer.trim().length < 3) {
      const aiFeedback = await evaluateAnswer(questionText, "No answer");
      questionObj.score = 0;
      questionObj.answer = "";

      if (submitType === "auto") {
        questionObj.feedback = "⏰ Time over! You didn't answer.";
      } else {
        questionObj.feedback = "⚠ You submitted without answering.";
      }
      await interview.save();
      return res.json({
        success: true,
        feedback: questionObj.feedback,
        idealAnswer: aiFeedback.idealAnswer,
        score: 0
      });
    }

    /* ======================
       TIME LIMIT CHECK
    ====================== */

    if (timeTaken && questionObj.timeLimit && timeTaken > questionObj.timeLimit + 2) {

      questionObj.score = 0;
      questionObj.feedback = "Time limit exceeded. Answer not evaluated.";
      questionObj.answer = answer;

      await interview.save();

      return res.json({
        success: true,
        feedback: questionObj.feedback,
        score: 0
      });
    }

    /* ======================
       AI EVALUATION
    ====================== */

    const aiFeedback = await evaluateAnswer(questionText, answer);

    questionObj.answer = answer;
    questionObj.confidence = aiFeedback.confidence;
    questionObj.communication = aiFeedback.communication;
    questionObj.correctness = aiFeedback.correctness;

    questionObj.score = aiFeedback.finalScore;
    questionObj.feedback = aiFeedback.feedback;
    questionObj.idealAnswer = aiFeedback.idealAnswer;
    await interview.save();

    res.json({
      success: true,
      feedback: aiFeedback.feedback,
      idealAnswer: aiFeedback.idealAnswer,
      score: aiFeedback.finalScore,
      confidence: aiFeedback.confidence,
      communication: aiFeedback.communication,
      correctness: aiFeedback.correctness
    });


  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


export const resumeAnalysis = async (req, res) => {

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }

    const fileUrl = req.file.path;
    const analysis = await analyzeResume(fileUrl);  // delete uploaded file

    res.json({
      success: true,
      role: analysis.role,
      experience: analysis.experience,
      projects: analysis.projects,
      skills: analysis.skills
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });


  }

};


export const completeInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found"
      });
    }

    /* =========================
       CALCULATIONS
    ========================= */

    const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalScore += Number(q.score) || 0;
      totalConfidence += Number(q.confidence) || 0;
      totalCommunication += Number(q.communication) || 0;
      totalCorrectness += Number(q.correctness) || 0;
    });

    const finalScore = totalQuestions ? totalScore / totalQuestions : 0;
    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

    /* =========================
       SAFE QUESTIONS
    ========================= */

    const safeQuestions = interview.questions.map((q) => ({
      question: q.question,
      answer: q.answer || "No answer"
    }));

    /* =========================
       AI SUMMARY (SAFE)
    ========================= */

    let aiSummary;

    try {
      const aiRes = await generateFinalReport(safeQuestions);

      if (aiRes && typeof aiRes === "object" && !Array.isArray(aiRes)) {
        aiSummary = aiRes;
      } else {
        throw new Error("Invalid AI response");
      }
    } catch (err) {
      console.log("⚠ AI FAILED → USING FALLBACK");

      aiSummary = {
        overallScore: Number(finalScore.toFixed(1)),
        communicationScore: Number(avgCommunication.toFixed(1)),
        technicalScore: Number(avgCorrectness.toFixed(1)),
        strengths: ["Attempted interview"],
        weaknesses: ["AI evaluation unavailable"],
        finalFeedback:
          "Interview completed successfully. AI evaluation is currently unavailable."
      };
    }

    /* =========================
       SAVE EVERYTHING (🔥 MAIN FIX)
    ========================= */

    interview.status = "completed";

    // 🔥 THIS WAS MISSING (MAIN BUG FIX)
    interview.overallScore = Number(finalScore.toFixed(1));
    interview.aiSummary = aiSummary;

    interview.duration = Math.floor(
      (Date.now() - interview.duration) / 1000
    );

    await interview.save();

    /* =========================
       RESPONSE
    ========================= */

    res.json({
      success: true,

      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),

      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0
      })),

      aiSummary
    });

  } catch (error) {
    console.log("❌ COMPLETE INTERVIEW ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to complete interview"
    });
  }
};


export const deleteInterview = async (req, res) => {
  try {

    const { interviewId } = req.params;
    console.log("DELETE HIT:", interviewId);

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found"
      });
    }

    // // optional: user check
    // if (interview.user.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ message: "Unauthorized" });
    // }

    await Interview.findByIdAndDelete(interviewId);

    res.status(200).json({
      message: "Interview deleted successfully"
    });

  } catch (error) {
    console.log("Delete error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const startResumeInterview = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }

    const user = await User.findById(req.user._id);

    if (user.credits !== -1 && user.credits < 10) {
      return res.status(403).json({
        message: "Not enough credits"
      });
    }

    if (user.credits !== -1) {
      await User.findByIdAndUpdate(
        user._id,
        { $inc: { credits: -10 } }
      );
    }

    const fileUrl = req.file.path;
    const resumeData = await analyzeResume(fileUrl);

    const questionData = await generateResumeQuestions(
      resumeData.skills,
      resumeData.role
    );

    const interview = await Interview.create({

      user: req.user._id,
      role: resumeData.role,
      experienceLevel: resumeData.experience,
      interviewType: "Technical",
      resumeUsed: true,
      questions: questionData.questions.map(q => ({
        question: q
      }))

    });

    res.json({
      success: true,
      interview
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


export const getInterviewHistory = async (req, res) => {

  try {

    const page = Number(req.query.page) || 1;
    const limit = 10;

    const interviews = await Interview.find({
      user: req.user._id
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);


    res.json({
      success: true,
      interviews
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

export const getSingleInterview = async (req, res) => {

  try {

    const { interviewId } = req.params;

    const interview = await Interview.findOne({
      _id: interviewId,
      user: req.user._id
    });

    res.json({
      success: true,
      interview
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

export const voiceAnswerEvaluation = async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({ message: "Audio required" });
    }

    const audioPath = req.file.path;

    const textAnswer = await speechToText(audioPath);

    const feedback = await evaluateAnswer(
      req.body.question,
      textAnswer
    );

    res.json({
      success: true,
      transcript: textAnswer,
      feedback
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};

export const getReport = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=AI_Report_${interview._id}.pdf`
    );

    doc.pipe(res);

    doc.font("Helvetica").lineGap(2);

    /* ================= HEADER ================= */

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("#020617")
      .text("AI INTERVIEW REPORT");

    doc.moveDown(0.3);

    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .strokeColor("#e2e8f0")
      .stroke();

    doc.moveDown(1.5);

    /* ================= TOP CARD ================= */

    let topY = doc.y;

    doc.roundedRect(50, topY, 500, 90, 12).fill("#f8fafc");

    // ROLE
    doc
      .fillColor("#64748b")
      .fontSize(10)
      .text("ROLE", 60, topY + 15);

    doc
      .fillColor("#020617")
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(interview.role, 60, topY + 30);

    // SCORE
    doc
      .fillColor("#64748b")
      .fontSize(10)
      .text("SCORE", 320, topY + 15);

    doc
      .fillColor("#16a34a")
      .font("Helvetica-Bold")
      .fontSize(18)
      .text(interview.overallScore || 0, 320, topY + 30);

    // STATUS
    doc
      .fillColor("#64748b")
      .fontSize(10)
      .text("STATUS", 420, topY + 15);

    doc
      .fillColor("#2563eb")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(interview.status, 420, topY + 30);

    doc.moveDown(4);

    /* ================= AI SUMMARY ================= */

    let summaryY = doc.y;

    const summaryHeight = doc.heightOfString(
      interview.aiSummary?.finalFeedback || "",
      { width: 480 }
    );

    doc.roundedRect(50, summaryY, 500, summaryHeight + 50, 12).fill("#f1f5f9");

    doc
      .fillColor("#020617")
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("AI SUMMARY", 60, summaryY + 12);

    doc
      .fillColor("#334155")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(
        interview.aiSummary?.finalFeedback || "No feedback available",
        60,
        summaryY + 35,
        { width: 480 }
      );

    doc.moveDown(4);

    /* ================= STRENGTHS & WEAKNESSES ================= */

    let swY = doc.y;

    // WEAKNESS
    const weakText = (interview.aiSummary?.weaknesses || []).join("\n");
    const strongText = (interview.aiSummary?.strengths || []).join("\n");

    doc.font("Helvetica").fontSize(10);

    // dynamic height calculate
    const weakHeight = doc.heightOfString(weakText || "No weaknesses", { width: 200 });
    const strongHeight = doc.heightOfString(strongText || "No strengths", { width: 200 });

    const boxHeight = Math.max(weakHeight, strongHeight) + 50;

    // 🔥 PAGE BREAK CHECK
    if (doc.y + boxHeight > doc.page.height - 50) {
      doc.addPage();
      swY = doc.y;
    }
    // WEAKNESSES
    doc.roundedRect(50, swY, 230, boxHeight, 12).fill("#fef2f2");

    doc
      .fillColor("#dc2626")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("WEAKNESSES", 60, swY + 12);

    doc
      .fillColor("#7f1d1d")
      .font("Helvetica")
      .fontSize(10)
      .text(weakText || "No weaknesses", 60, swY + 35, { width: 200 });

    // STRENGTHS
    doc.roundedRect(320, swY, 230, boxHeight, 12).fill("#ecfdf5");

    doc
      .fillColor("#15803d")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("STRENGTHS", 330, swY + 12);

    doc
      .fillColor("#065f46")
      .font("Helvetica")
      .fontSize(10)
      .text(strongText || "No strengths", 330, swY + 35, { width: 200 });

    // move cursor properly
    doc.y = swY + boxHeight + 20;
    doc.moveDown(2);

    /* ================= DIVIDER ================= */

    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .strokeColor("#e2e8f0")
      .stroke();

    // ================= QUESTIONS =================

    doc.moveDown(2);

    // PAGE BREAK FOR HEADING
    if (doc.y + 50 > doc.page.height - 50) {
      doc.addPage();
    }

    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("#111827")
      .text("QUESTION BREAKDOWN", 50);

    doc.moveDown(1.2);

    interview.questions.forEach((q, i) => {
      const boxWidth = 500;
      const marginX = 50;
      const padding = 16;
      const feedbackPadding = 18;

      let startY = doc.y;

      const contentWidth = boxWidth - padding * 2;
      const lineGap = 8;

      doc.font("Helvetica-Bold").fontSize(12.5);
      const qHeight = doc.heightOfString(`Q${i + 1}: ${q.question}`, {
        width: contentWidth,
      });

      doc.font("Helvetica").fontSize(10.5);
      const aHeight = doc.heightOfString(
        `Answer: ${q.answer || "No answer"}`,
        { width: contentWidth }
      );

      doc.font("Helvetica-Oblique").fontSize(10);
      const feedbackWidth = contentWidth - 20;

      const fHeight = doc.heightOfString(
        q.feedback || "No feedback provided",
        { width: feedbackWidth }
      );

      const totalHeight =
        padding +
        qHeight +
        lineGap +
        aHeight +
        lineGap +
        15 + // score height
        lineGap +
        (fHeight + feedbackPadding + 8) +
        padding;

      // PAGE BREAK
      if (doc.y + totalHeight > doc.page.height - 50) {
        doc.addPage();
        startY = doc.y;
      }

      // CARD BACKGROUND
      doc
        .roundedRect(marginX, startY, boxWidth, totalHeight, 14)
        .fill("#f8fafc");

      let currentY = startY + padding;

      // QUESTION
      doc
        .fillColor("#0f172a")
        .font("Helvetica-Bold")
        .fontSize(12.5)
        .text(`Q${i + 1}: ${q.question}`, marginX + padding, currentY, {
          width: contentWidth,
        });

      currentY += qHeight + lineGap;

      // ANSWER
      doc
        .fillColor("#475569")
        .font("Helvetica")
        .fontSize(10.5)
        .text(
          `Answer: ${q.answer || "No answer"}`,
          marginX + padding,
          currentY,
          { width: contentWidth }
        );

      currentY += aHeight + lineGap;

      // SCORE
      doc
        .fillColor("#16a34a")
        .font("Helvetica-Bold")
        .fontSize(10.5)
        .text(`Score: ${q.score || 0}/10`, marginX + padding, currentY);

      currentY += 15 + lineGap;

      // FEEDBACK BOX
      doc
        .roundedRect(
          marginX + padding,
          currentY,
          contentWidth - 4,
          fHeight + feedbackPadding,
          10
        )
        .fill("#eef2ff");

      // FEEDBACK TEXT (CENTERED PERFECTLY)
      doc
        .fillColor("#4338ca")
        .font("Helvetica-Oblique")
        .fontSize(10)
        .text(
          q.feedback || "No feedback provided",
          marginX + padding + 10,
          currentY + feedbackPadding / 2,
          { width: contentWidth - 12 }
        );

      // FINAL POSITION FOR NEXT CARD
      doc.y = startY + totalHeight + 20;
    });
    /* ================= FOOTER ================= */
    if (doc.y > doc.page.height - 80) {
      doc.addPage();
    }

    doc.moveDown(1);

    doc
      .fillColor("#94a3b8")
      .fontSize(9)
      .text("AI Generated Report • InterviewIQ", {
        align: "center",
      });

    doc.end();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "PDF generation failed" });
  }
};

export const getReportData = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json({ interview });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
