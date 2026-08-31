import * as brevo from "@getbrevo/brevo";
import dotenv from "dotenv";
dotenv.config();

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

export const sendOtpMail = async (to, otp) => {
  try {
    const recipient = (typeof to === "object" ? to?.email : to)
      ?.replace(/['"<>]/g, "")
      .trim();

    if (!recipient) throw new Error("Recipient email is missing");

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "Reset Your Password";
    sendSmtpEmail.htmlContent = `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`;
    sendSmtpEmail.sender = { name: "DashBite", email: "janvichhirang@gmail.com" };
    sendSmtpEmail.to = [{ email: recipient }];

    return await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error("Brevo sendOtpMail Error:", error.response?.body || error.message);
    throw error;
  }
};

export const sendDeliveryOTP = async (user, otp) => {
  try {
    const rawEmail = typeof user === "object" ? user?.email : user;
    if (!rawEmail) throw new Error("Recipient email is missing");

    const cleanRecipient = String(rawEmail).replace(/['"<>]/g, "").trim();

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "Delivery Confirmation OTP";
    sendSmtpEmail.htmlContent = `<p>Your OTP for delivery is <b>${otp}</b>. It expires in 5 minutes.</p>`;
    sendSmtpEmail.sender = { name: "DashBite", email: "janvichhirang@gmail.com" };
    sendSmtpEmail.to = [{ email: cleanRecipient }];

    return await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error("Brevo sendDeliveryOTP Error:", error.response?.body || error.message);
    throw error;
  }
};