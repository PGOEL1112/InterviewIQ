import { callAI } from "./openRouterServices.js";

export const generateFinalReport = async (answers) => {

  try{
      const formatted = answers
        .map((a,i)=>`Q${i+1}: ${a.question}\nA: ${a.answer}`)
        .join("\n\n");

      const messages=[

        {
          role:"system",
          content:"You are an AI interview evaluator."
        },

        {
          role:"user",
          content:`
    Analyze this interview.

    ${formatted}

    Return JSON:

    {
    "overallScore":0,
    "communicationScore":0,
    "technicalScore":0,
    "strengths":[],
    "weaknesses":[],
    "finalFeedback":""
    }
    `
        }

      ];

      const res=await callAI(messages);

       if (!res || typeof res !== "string") {
        throw new Error("AI returned empty");
      }
      
      const clean=res.replace(/```json|```/g,"").trim();
      return JSON.parse(clean);
    }
    catch(err){
      console.log("Ai Failed-> Fallback Used");

       return {
        overallScore: 60,
        communicationScore: 55,
        technicalScore: 65,
        strengths: ["Basic understanding", "Attempted all questions"],
        weaknesses: ["Lack of depth", "Needs clarity"],
        finalFeedback:
          "Your interview was completed successfully. Work on improving clarity and technical depth."
    };
    }

};
