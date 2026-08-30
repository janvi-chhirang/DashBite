import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpMail = async (to, otp) => {
  const recipient = (typeof to === "object" ? to?.email : to)
    ?.replace(/['"<>]/g, "")
    .trim();

  if (!recipient) throw new Error("Recipient email is missing");

  // Testing ke liye "onboarding@resend.dev" default sender hota hai
  return await resend.emails.send({
    from: "onboarding@resend.dev",
    to: recipient,
    subject: "Reset Your Password",
    html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`,
  });
};

export const sendDeliveryOTP = async (user, otp) => {
  const rawEmail = typeof user === "object" ? user?.email : user;
  if (!rawEmail) throw new Error("Recipient email is missing");

  const cleanRecipient = String(rawEmail).replace(/['"<>]/g, "").trim();

  return await resend.emails.send({
    from: "onboarding@resend.dev",
    to: cleanRecipient,
    subject: "Delivery Confirmation OTP",
    html: `<p>Your OTP for delivery is <b>${otp}</b>. It expires in 5 minutes.</p>`,
  });
};