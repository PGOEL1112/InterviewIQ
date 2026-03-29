import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

/* ---------- SEND SUCCESS EMAIL ---------- */

export const sendPasswordResetSuccessEmail = async (email, name) => {

    try {

      await resend.emails.send({
      from: "InterviewIQ <onboarding@resend.dev>",
      to: email,
      subject: "Password Updated Successfully • InterviewIQ",
            html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Password Updated</title>
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
background:#dcfce7;
border-radius:14px;
display:flex;
align-items:center;
justify-content:center;
font-size:28px;
margin:auto;">
✅
</div>

<h1 style="margin:15px 0 5px 0;font-size:22px;color:#111827;">
Password Updated
</h1>

</td>
</tr>

<tr>
<td align="center">

<p style="color:#374151;font-size:14px;">
Hello <b>${name}</b>,
</p>

<p style="color:#6b7280;font-size:14px;">
Your password has been successfully changed.
</p>

</td>
</tr>

<tr>
<td align="center">

<div style="
margin-top:20px;
padding:16px;
background:#ecfdf5;
border-radius:10px;
font-size:14px;
color:#16a34a;
font-weight:600;
">

Your account is now secure.

</div>

</td>
</tr>

<tr>
<td align="center">

<p style="margin-top:25px;font-size:13px;color:#9ca3af;">
If you did not perform this action, please contact support immediately.
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
        });

        console.log("✅ Password reset confirmation sent");

    }

    catch (error) {

        console.error("❌ Confirmation email error:", error);

    }

};
