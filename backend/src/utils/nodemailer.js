import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (targetEmail, resetToken) => {
  const mailOptions = {
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
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};
