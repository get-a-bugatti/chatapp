import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export const sendEmail = async function (targetEmail, resetToken) {
  try {
    const { data, error } = await resend.emails.send({
      from: `"Your Chat App Security" <>`,
      to: targetEmail,
      subject: "Chat App - Your Password Reset OTP",
      text: `Your password reset code is ${resetToken}. It will expire in 10 minutes.`,
      html: `
              <div style="font-family: sans-serif; padding: 20px; text-align: center;">
                <h2>Password Reset Request</h2>
                <p>Use the code below to complete your reset process:</p>
                <h1 style="letter-spacing: 5px; color: #4A90E2;">${resetToken}</h1>
                <p>This code expires in 10 minutes. If you did not request this, ignore this email.</p>
              </div>
            `,
    });

    if (error) {
      throw error;
    }

    console.log("Email sent successfully!", { data });
  } catch (e) {
    throw new Error(e.message);
  }
};
