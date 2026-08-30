import nodemailer from "nodemailer";
import dns from "node:dns";
import dotenv from "dotenv";

// Force Node.js to resolve IPv4 addresses first to prevent ENETUNREACH on IPv6
dns.setDefaultResultOrder("ipv4first");

dotenv.config();

// Sanitize email credentials
const authUser = process.env.EMAIL?.replace(/['"<>]/g, "").trim();
const authPass = process.env.EMAIL_PASSWORD?.replace(/['"<>]/g, "").trim();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: authUser,
    pass: authPass, // Must be a 16-character Google App Password
  },
});

export const sendOtpMail = async (to, otp) => {
  const recipient = (typeof to === "object" ? to?.email : to)
    ?.replace(/['"<>]/g, "")
    .trim();

  if (!recipient) {
    throw new Error("Recipient email address is missing");
  }

  return await transporter.sendMail({
    from: authUser,
    to: recipient,
    subject: "Reset Your Password",
    html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`,
  });
};

export const sendDeliveryOTP = async (user, otp) => {
  const rawEmail = typeof user === "object" ? user?.email : user;

  if (!rawEmail) {
    throw new Error("Recipient email address is missing");
  }

  const cleanRecipient = String(rawEmail)
    .replace(/['"<>]/g, "")
    .trim();

  return await transporter.sendMail({
    from: authUser,
    to: cleanRecipient,
    subject: "Delivery Confirmation OTP",
    html: `<p>Your OTP for delivery is <b>${otp}</b>. It expires in 5 minutes.</p>`,
  });
};