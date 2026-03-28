import React from "react";
import { motion } from "framer-motion";

const bars = new Array(20).fill(0);

const VoiceWave = () => {

return (

<div className="flex items-end gap-[3px] h-16">

{bars.map((_,i)=>(
<motion.div
key={i}
animate={{
height:["10px","40px","15px","60px","20px"]
}}
transition={{
repeat:Infinity,
duration:1.2,
delay:i*0.05
}}
className="w-[4px] bg-blue-500 rounded"
/>
))}

</div>

);

};

export default VoiceWave;