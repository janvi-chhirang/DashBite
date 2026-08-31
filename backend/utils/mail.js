import dotenv from "dotenv";
dotenv.config();

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export const sendOtpMail = async (to, otp) => {
  try {
    const recipient = (typeof to === "object" ? to?.email : to)
      ?.replace(/['"<>]/g, "")
      .trim();

    if (!recipient) throw new Error("Recipient email is missing");

    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "DashBite", email: "janvichhirang@gmail.com" },
        to: [{ email: recipient }],
        subject: "Reset Your Password",
        htmlContent: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    return data;
  } catch (error) {
    console.error("Brevo sendOtpMail Error:", error.message);
    throw error;
  }
};

export const sendDeliveryOTP = async (user, otp) => {
  try {
    const rawEmail = typeof user === "object" ? user?.email : user;
    if (!rawEmail) throw new Error("Recipient email is missing");

    const cleanRecipient = String(rawEmail).replace(/['"<>]/g, "").trim();

    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "DashBite", email: "janvichhirang@gmail.com" },
        to: [{ email: cleanRecipient }],
        subject: "Delivery Confirmation OTP",
        htmlContent: `<p>Your OTP for delivery is <b>${otp}</b>. It expires in 5 minutes.</p>`,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    return data;
  } catch (error) {
    console.error("Brevo sendDeliveryOTP Error:", error.message);
    throw error;
  }
};