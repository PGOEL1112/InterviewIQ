import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

/* ---------- SEND RESET OTP EMAIL ---------- */

export const sendResetOTPEmail = async (email, otp) => {
  try {

    await resend.emails.send({
      from: "InterviewIQ <onboarding@resend.dev>",
      to: email,
      subject: "Password Reset OTP • InterviewIQ",

            html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset Password</title>
</head>

<body style="margin:0;padding:0;background:#020617;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:50px 0;">
<tr>
<td align="center">

<table width="520" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:16px;padding:40px;box-shadow:0 20px 50px rgba(0,0,0,0.35);">

<tr>
<td align="center">

<div style="
width:60px;
height:60px;
background:#eef2ff;
border-radius:14px;
display:flex;
align-items:center;
justify-content:center;
font-size:28px;
margin:auto;">
🔐
</div>

<h1 style="margin:15px 0 5px 0;font-size:22px;color:#111827;">
InterviewIQ
</h1>

<p style="margin:0;color:#6b7280;font-size:13px;">
AI Powered Interview Preparation
</p>

</td>
</tr>

<tr>
<td align="center">

<h2 style="color:#111827;margin:20px 0 10px 0;">
Reset Password Verification
</h2>

<p style="color:#6b7280;font-size:14px;">
Use the verification code below to reset your password.
</p>

</td>
</tr>

<tr>
<td align="center">

<div style="
margin:35px 0;
padding:18px;
background:linear-gradient(135deg,#eef2ff,#e0e7ff);
border-radius:12px;
font-size:36px;
font-weight:700;
letter-spacing:12px;
color:#4338ca;
text-align:center;
">

${otp}

</div>

</td>
</tr>

<tr>
<td align="center">

<p style="font-size:13px;color:#6b7280;">
⏳ This code will expire in <b>10 minutes</b>
</p>

</td>
</tr>

<tr>
<td align="center">

<p style="font-size:13px;color:#9ca3af;">
If you didn't request this email, you can safely ignore it.
</p>

</td>
</tr>

<tr>
<td style="padding:30px 0;">
<hr style="border:none;border-top:1px solid #e5e7eb;">
</td>
</tr>

<tr>
<td align="center">

<p style="font-size:12px;color:#9ca3af;margin:0;">
© 2026 InterviewIQ
<br/>
AI Interview Practice Platform
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`
        });

        console.log("✅ Reset OTP email sent to:", email);
    }

    catch (error) {
        console.error("❌ Reset OTP email error:", error);
    }

};
