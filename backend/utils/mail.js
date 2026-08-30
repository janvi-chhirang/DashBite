import nodemailer from "nodemailer";
import dns from "node:dns";
import dotenv from "dotenv";

// Force IPv4 to bypass Render's broken IPv6 routing
dns.setDefaultResultOrder("ipv4first");

dotenv.config();

// Sanitize credentials
const authUser = process.env.EMAIL?.replace(/['"<>]/g, "").trim();
const authPass = process.env.EMAIL_PASSWORD?.replace(/['"<>]/g, "").trim();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL on port 465 (Render blocks 587)
  auth: {
    user: authUser,
    pass: authPass, // Google 16-character App Password
  },
  connectionTimeout: 20000, // 20s timeout allowance
  greetingTimeout: 20000,
  socketTimeout: 30000,
});

export const sendOtpMail = async (to, otp) => {
  const recipient = (typeof to === "object" ? to?.email : to)
    ?.replace(/['"<>]/g, "")
    .trim();

  if (!recipient) {
    throw new Error("Recipient email address is missing");
  }

  return await transporter.sendMail({
    from: `"Support" <${authUser}>`,
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
    from: `"Delivery Team" <${authUser}>`,
    to: cleanRecipient,
    subject: "Delivery Confirmation OTP",
    html: `<p>Your OTP for delivery is <b>${otp}</b>. It expires in 5 minutes.</p>`,
  });
};