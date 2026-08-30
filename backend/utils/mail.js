import nodemailer from "nodemailer";
import dotenv from "dotenv";
import dns from "dns";
dotenv.config();

// Force Node to prefer IPv4 when resolving hostnames — Render's outbound
// network can fail (ENETUNREACH) when Node picks Gmail's IPv6 address.
dns.setDefaultResultOrder("ipv4first");

// Sanitize email credentials
const authUser = process.env.EMAIL?.replace(/['"<>]/g, "").trim();
const authPass = process.env.EMAIL_PASSWORD?.replace(/['"<>]/g, "").trim();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4, // force IPv4 - Render's network can fail to reach Gmail over IPv6
  auth: {
    user: authUser,
    pass: authPass,
  },
});

export const sendOtpMail = async (to, otp) => {
  const recipient = (typeof to === "object" ? to?.email : to)?.replace(/['"<>]/g, "").trim();

  await transporter.sendMail({
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

  const cleanRecipient = String(rawEmail).replace(/['"<>]/g, "").trim();

  await transporter.sendMail({
    from: authUser,
    to: cleanRecipient,
    subject: "Delivery Confirmation OTP",
    html: `<p>Your OTP for delivery is <b>${otp}</b>. It expires in 5 minutes.</p>`,
  });
};