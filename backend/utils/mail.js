import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOtpMail = async (to, otp) => {
  const recipient = (typeof to === "object" ? to?.email : to)
    ?.replace(/['"<>]/g, "")
    .trim();

  if (!recipient) throw new Error("Recipient email is missing");

  return await transporter.sendMail({
    from: `"DashBite" <${process.env.EMAIL_USER}>`,
    to: recipient,
    subject: "Reset Your Password",
    html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`,
  });
};

export const sendDeliveryOTP = async (user, otp) => {
  const rawEmail = typeof user === "object" ? user?.email : user;
  if (!rawEmail) throw new Error("Recipient email is missing");

  const cleanRecipient = String(rawEmail).replace(/['"<>]/g, "").trim();

  return await transporter.sendMail({
    from: `"DashBite" <${process.env.EMAIL_USER}>`,
    to: cleanRecipient,
    subject: "Delivery Confirmation OTP",
    html: `<p>Your OTP for delivery is <b>${otp}</b>. It expires in 5 minutes.</p>`,
  });
};