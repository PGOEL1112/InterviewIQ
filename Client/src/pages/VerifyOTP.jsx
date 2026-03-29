import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VerifyOTP = () => {

const navigate = useNavigate();

const email = localStorage.getItem("verifyEmail");

const [otp,setOtp] = useState(["","","","","",""]);
const [loading,setLoading] = useState(false);
const [message,setMessage] = useState("");

const [timer,setTimer] = useState(60);

const inputs = useRef([]);




/* TIMER */

useEffect(()=>{

if(timer > 0){

const interval = setInterval(()=>{

setTimer(prev=>prev-1);

},1000);

return ()=>clearInterval(interval);

}

},[timer]);



/* HANDLE CHANGE */

const handleChange = (value,index)=>{

if(!/^[0-9]?$/.test(value)) return;

const newOtp = [...otp];

newOtp[index] = value;

setOtp(newOtp);

if(value && index < 5){

inputs.current[index+1].focus();

}

};



/* BACKSPACE */

const handleKeyDown = (e,index)=>{

if(e.key === "Backspace" && !otp[index] && index>0){

inputs.current[index-1].focus();

}

if(e.key === "Enter"){
handleVerify();
}

};



/* PASTE OTP */

const handlePaste = (e)=>{

const paste = e.clipboardData.getData("text").slice(0,6);

if(!/^\d+$/.test(paste)) return;

const pasteArray = paste.split("");

setOtp(pasteArray);

pasteArray.forEach((num,i)=>{

if(inputs.current[i]){

inputs.current[i].value = num;

}

});

};



/* VERIFY OTP */

const handleVerify = async ()=>{

const finalOtp = otp.join("");

if(finalOtp.length < 6){

setMessage("Enter complete OTP");

return;

}

try{

setLoading(true);

const res = await axios.post("/auth/verify-email", {
  email,
  otp: finalOtp
});

if(res.data.success){

setMessage("Email verified successfully");

setTimeout(()=>{

navigate("/auth");

},1500);

}

}
catch(err){

setMessage(

err.response?.data?.message || "Verification failed"

);

}
finally{

setLoading(false);

}

};



/* RESEND OTP */

const handleResend = async () => {

try{

const email = localStorage.getItem("verifyEmail");

await axios.post("/auth/resend-otp", { email });
setTimer(60);

setMessage("OTP sent again to your email");

}
catch{

setMessage("Failed to resend OTP");

}

};


return(

<div className="min-h-screen flex items-center justify-center bg-[#020617] text-white relative overflow-hidden">

{/* background glow */}

<div className="absolute w-[500px] h-[500px] bg-blue-600/20 blur-[160px] rounded-full -top-40 -left-40"></div>

<div className="absolute w-[400px] h-[400px] bg-indigo-600/20 blur-[150px] bottom-0 right-0"></div>



<motion.div

initial={{opacity:0,y:40}}

animate={{opacity:1,y:0}}

className="relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 p-10 rounded-3xl w-[420px] text-center shadow-xl"

>

<h2 className="text-2xl font-bold mb-2">

Verify your Email

</h2>

<p className="text-gray-400 text-sm mb-6">

Enter the 6 digit code sent to your email

</p>



{/* OTP INPUT */}

<div

onPaste={handlePaste}

className="flex justify-center gap-3 mb-6"

>

{otp.map((digit,index)=>(

<input

key={index}

ref={el => inputs.current[index] = el}

type="text"

maxLength="1"

value={digit}

onChange={(e)=>handleChange(e.target.value,index)}

onKeyDown={(e)=>handleKeyDown(e,index)}

className="w-12 h-14 text-center text-xl rounded-lg bg-white/10 border border-white/20 focus:border-blue-500 outline-none"

/>

))}

</div>



{/* VERIFY BUTTON */}
<motion.button
whileHover={{scale: loading ? 1 : 1.05}}
whileTap={{scale: loading ? 1 : 0.95}}
onClick={handleVerify}
disabled={loading}
className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg font-semibold flex items-center justify-center gap-2"
>

{loading ? (
<>
<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
Verifying...
</>
) : (
"Verify Email"
)}

</motion.button>


{/* MESSAGE */}

{message && (

<p className="text-sm mt-4 text-gray-300">

{message}

</p>

)}



{/* RESEND */}

<div className="mt-6 text-sm text-gray-400">

{timer > 0 ? (

<p>

Resend OTP in <span className="text-blue-400">{timer}s</span>

</p>

) : (

<button

onClick={handleResend}

className="text-blue-400 hover:underline"

>

Resend OTP

</button>

)}

</div>



</motion.div>

</div>

);

};

export default VerifyOTP;
