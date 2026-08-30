import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpMail } from "./../utils/mail.js";

// sign-up
const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobileNumber, role } = req.body;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    if (mobileNumber.length < 10) {
      return res
        .status(400)
        .json({ message: "Mobile number must be at least 10 digits long" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName: fullName,
      email: email,
      password: hashedPassword,
      mobileNumber: mobileNumber,
      role: role,
    });
    const token = await genToken(user._id);
    res.cookie("token", token, {
      secure: true,
      sameSite: "none",
      maxAge: 1 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return res.status(201).json({
      message: "Signed-Up successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Error occurred while signing up",
    });
  }
};

// sign-In
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "User doesn't exist" });
    }

    // FIX: Prevents bcrypt from crashing if a Google OAuth user tries standard form login
    if (!user.password) {
      return res.status(400).json({ 
        message: "This account was created using Google. Please log in via Google Auth." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect Password" });
    }

    const token = await genToken(user._id);
    res.cookie("token", token, {
      secure: true,
      sameSite: "none",
      maxAge: 1 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return res.status(201).json({
      message: "Signed-In successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Error occurred while signing In",
    });
  }
};

// sign-out
const signOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "LogOut Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Error occurred while signing Out",
    });
  }
};

// otp-reset-message
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; 
    await user.save();
    sendOtpMail(user.email, otp);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "Error while Sending OTP",
    });
  }
};

// verify otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.resetOtp != otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or Expired Otp" });
    }
    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "Error while verifying OTP",
    });
  }
};

// reset password
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "OTP verification is required" });
    }
    const hashedpassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedpassword;
    user.isOtpVerified = false;
    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "Error while resetting the new password",
    });
  }
};

// google-authentication
const googleAuth = async (req, res) => {
  try {
    const { fullName, email, mobileNumber, role } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName,
        email,
        mobileNumber: mobileNumber || "",
        role: role || "User",
      });
    }

    const token = await genToken(user._id);
    res.cookie("token", token, {
      secure: true,
      sameSite: "none",
      maxAge: 1 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return res.status(200).json({
      message: "Google Auth successful",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "Google Auth Error",
    });
  }
};

export { signUp, signIn, signOut, sendOtp, verifyOtp, resetPassword, googleAuth };
