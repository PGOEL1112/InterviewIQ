import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY
});

export const textToSpeech = async(text)=>{

 const speech = await openai.audio.speech.create({
  model:"gpt-4o-mini-tts",
  voice:"alloy",
  input:text
 });

 const fileName = `question-${Date.now()}.mp3`;
 const filePath = `.public/audio/${fileName}`;

 const buffer = Buffer.from(await speech.arrayBuffer());
 fs.writeFileSync(filePath,buffer);

 return `/audio/${fileName}`;

};
