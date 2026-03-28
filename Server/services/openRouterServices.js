import axios from "axios";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const headers = {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "InterviewIQ"
};


export const callAI = async (messages) => {

    try {
        if(!messages || !Array.isArray(messages) || messages.length===0){
            throw new Error("Messages array is Empty .");
        }

        const response = await axios.post(
            OPENROUTER_URL,
            {
                model: "openai/gpt-4o-mini",
                messages,
                temperature:0.7,
                max_tokens:300
            },
            { 
                headers,
                timeout:30000
             }
        );

        return response?.data?.choices?.[0]?.message?.content || ""


    } catch (error) {

        console.error("AI ERROR:", error.response?.data || error.message);
        return null;

    }

};


export const evaluateAnswer = async (question, answer) => {

  const messages = [
    {
      role: "system",
      content: `
        You are a professional human interviewer evaluating a candidate's answer.

        Score the answer (0–10):

        1. confidence
        2. communication
        3. correctness

        Rules:
        - Be realistic
        - Do not give random high scores
        - If weak answer -> score low
        - If strong answer -> score high

        finalScore = average of the three scores.

        Return ONLY JSON:

        {
        "confidence": number,
        "communication": number,
        "correctness": number,
        "finalScore": number,
        "feedback": "short human feedback"
        "idealAnswer": "perfect structured answer for this question"
        }
        `
    },

    {
      role: "user",
      content: `
        Question: ${question}

        Answer: ${answer}
        `
    }
  ];

  const aiResponse = await callAI(messages);

  const clean = aiResponse.replace(/```json|```/g, "").trim();
  let parsed;
  try {
    parsed =  JSON.parse(clean);
  } 
  catch(err) {
    console.log("❌ AI RAW RESPONSE:", aiResponse);

    parsed = {
      confidence: 0,
      communication: 0,
      correctness: 0,
      finalScore: 0,
      feedback: "AI evaluation failed",
      idealAnswer: "No ideal answer available"
    };
  }

  return parsed; 
};

export const generateFollowupQuestion = async (previousQuestion, answer, difficulty="medium") => {

    const messages = [
        {
            role: "system",
            content: "You are an AI interviewer generating follow-up questions."
        },
        {
            role: "user",
            content: `
            Previous Question: ${previousQuestion}

            Candidate Answer:
            ${answer}

           Generate ONE ${difficulty} follow-up technical question.
            Return only the question text.
            `
        }
    ];

    return await callAI(messages);

};


export const generateInterviewReport = async (answers) => {

  const formatted = answers
    .map((a, i) => `Q${i + 1}: ${a.question}\nA: ${a.answer}`)
    .join("\n\n");

  const messages = [
    {
      role: "system",
        content: `
    You are a strict AI evaluator.

    IMPORTANT:
    - Always return VALID JSON
    - Never break JSON format
    - No explanation outside JSON
    `
        },
        {
        role: "user",
        content: `
    Analyze this interview:

    ${formatted}

    Return JSON:

    {
    "overallScore": number,
    "communicationScore": number,
    "technicalScore": number,
    "strengths": ["..."],
    "weaknesses": ["..."],
    "finalFeedback": "..."
    }
    `
        }
    ];

    try {
    const aiResponse = await callAI(messages);

    if (!aiResponse || typeof aiResponse !== "string") {
      return fallback();
    }

    const clean = aiResponse.replace(/```json|```/g, "").trim();

    if (!clean || clean.length < 10) {
      return fallback();
    }

    return JSON.parse(clean);

  } catch (err) {
    console.log("❌ FINAL REPORT ERROR:", err.message);
    return fallback();
  }
};

const fallback = () => ({
  overallScore: 50,
  communicationScore: 50,
  technicalScore: 50,
  strengths: ["Basic understanding"],
  weaknesses: ["Needs improvement"],
  finalFeedback: "AI failed, fallback used."
});


export const generateResumeQuestions = async (skills, role) => {
    const messages = [
        {
            role: "system",
            content: "You are a technical interviewer generating interview questions."
        },

        {
            role: "user",
            content: `
            Generate 5 technical interview questions.
            Role: ${role}
            Skills: ${skills.join(", ")}
            Return strictly JSON:

            {
            "questions":[
            "question1",
            "question2",
            "question3",
            "question4",
            "question5"
            ]
            }
            `
        }

    ];

    const aiResponse = await callAI(messages);
    const clean = aiResponse.replace(/```json|```/g, "").trim();
    let parsed;

    try {
        parsed = JSON.parse(clean);
    } 
    catch (err) {
        console.log("❌ AI RAW REPORT:", aiResponse);
        parsed = {
            overallScore: 0,
            communication: "Parsing failed",
            technical: "Parsing failed",
            improvements: ["AI response invalid"]
        };
    }

    return parsed;
};
