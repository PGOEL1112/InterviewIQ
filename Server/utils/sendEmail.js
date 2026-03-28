import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/* ---------------- TRANSPORTER ---------------- */

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port:587,
  secure:false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

/* ---------------- SEND OTP EMAIL ---------------- */

export const sendOTP = async (email, otp) => {
  try {

    const mailOptions = {
      from: `InterviewIQ <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email • InterviewIQ",

      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Email Verification</title>
</head>

<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
<tr>
<td align="center">

<table width="520" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:16px;padding:40px;box-shadow:0 20px 50px rgba(0,0,0,0.35);">

<!-- LOGO -->

<tr>
<td align="center" style="padding-bottom:20px;">

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
🤖
</div>

<h1 style="margin:15px 0 5px 0;font-size:22px;color:#111827;">
InterviewIQ
</h1>

<p style="margin:0;color:#6b7280;font-size:13px;">
AI Powered Interview Preparation
</p>

</td>
</tr>


<!-- TITLE -->

<tr>
<td align="center">

<h2 style="color:#111827;margin:10px 0;">
Verify Your Email
</h2>

<p style="color:#6b7280;font-size:14px;line-height:1.6;margin-bottom:25px;">
Use the verification code below to complete your signup and start practicing AI interviews.
</p>

</td>
</tr>


<!-- OTP BOX -->

<tr>
<td align="center">

<div style="
background:linear-gradient(135deg,#eef2ff,#e0e7ff);
padding:18px 30px;
border-radius:10px;
font-size:36px;
font-weight:700;
letter-spacing:10px;
color:#4338ca;
display:inline-block;
box-shadow:0 8px 20px rgba(79,70,229,0.25);
margin:20px 0;">
${otp}
</div>

</td>
</tr>


<!-- TIMER -->

<tr>
<td align="center">

<p style="font-size:13px;color:#6b7280;">
⏳ This code expires in <b>10 minutes</b>
</p>

</td>
</tr>


<!-- SECURITY NOTE -->

<tr>
<td align="center" style="padding-top:10px;">

<p style="font-size:13px;color:#9ca3af;">
Never share this code with anyone.
If you didn’t request this email, you can safely ignore it.
</p>

</td>
</tr>


<!-- DIVIDER -->

<tr>
<td style="padding:30px 0;">
<hr style="border:none;border-top:1px solid #e5e7eb;">
</td>
</tr>


<!-- FOOTER -->

<tr>
<td align="center">

<p style="font-size:12px;color:#9ca3af;line-height:1.6;margin:0;">
© ${new Date().getFullYear()} InterviewIQ
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
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ OTP email sent to:", email);

  } catch (error) {

    console.error("❌ Email send error:", error);

  }
};