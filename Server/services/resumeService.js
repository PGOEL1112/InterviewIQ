import fs from "fs";
import { createRequire } from "module";
import { callAI } from "./openRouterServices.js";
import axios from "axios";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
const mammoth = require("mammoth");


const detectExperienceLevel = (expText) => {

  if (!expText) return "Fresher";

  const text = expText.toLowerCase();

  if (text.includes("5") || text.includes("senior")) return "Senior";

  if (text.includes("3") || text.includes("4") || text.includes("mid"))
    return "Mid";

  if (
    text.includes("1") ||
    text.includes("2") ||
    text.includes("hands") ||
    text.includes("intern")
  )
    return "Junior";

  return "Fresher";
};


export const analyzeResume = async (filePath) => {

  try {
    let buffer;
     if (filePath.startsWith("http")) {
      const response = await axios.get(filePath, {
        responseType: "arraybuffer"
      });
      buffer = response.data;
    } else {
      buffer = fs.readFileSync(filePath);
    }
    let resumeText = "";
    if (filePath.endsWith(".pdf")) {
      const data = await pdf(buffer);
      resumeText = data.text;

    } else if (filePath.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      resumeText = result.value;

    }
    else if (filePath.endsWith(".doc")) {
      throw new Error("Please upload DOCX or PDF file");
    } 
    else {
      throw new Error("Unsupported file format. Use PDF or DOCX.");
    }

    console.log("Extracted Resume Text:");
    console.log(resumeText.slice(0, 300));

    if (!resumeText || resumeText.length < 20) {
      throw new Error("Resume text extraction failed. Use text-based PDF.");
    }

    const messages = [
      {
        role: "system",
        content: "You are an AI career coach analyzing resumes."
      },
      {
        role: "user",
        content: `
          Extract structured information from this resume.

          Return STRICT JSON only.

          {
          "role":"string",
          "experience":"string",
          "projects":["project1","project2"],
          "skills":["skill1","skill2"]
          }

          Resume:
          ${resumeText}
          `
      }
    ];

    const aiResponse = await callAI(messages);

    console.log("AI RAW RESPONSE:", aiResponse);

    const clean = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(clean);
    } catch {

      parsed = {
        role: "Software Developer",
        experience: "Fresher",
        projects: [],
        skills: []
      };

    }

    /* =========================
       EXPERIENCE LEVEL FIX
    ========================== */

    const experienceLevel = detectExperienceLevel(parsed.experience);

    return {
      role: parsed.role || "Software Developer",
      experience: experienceLevel,
      projects: parsed.projects || [],
      skills: parsed.skills || []
    };

  } catch (error) {

    console.error("Resume analysis failed:", error);
    throw error;

  }

};
