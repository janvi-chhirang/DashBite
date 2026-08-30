import React, { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true },
      );
      console.log(result);
      setLoading(false);
      setError("");
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError("Please enter the OTP");
      toast.error("Please enter the OTP");
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true },
      );
      console.log(result);
      setLoading(false);
      setError("");
      toast.success("OTP verified successfully!");
      setStep(3);
    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields");
      toast.error("Please fill in both password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New Password and Confirm Password should be same");
      toast.error("New Password and Confirm Password should be same");
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email, newPassword },
        { withCredentials: true },
      );
      console.log(result);
      setLoading(false);
      toast.success("Password reset successfully! Please sign in.");
      navigate("/signin");
    } catch (error) {
      console.log(error);
      const msg = error.response?.data?.message || "Failed to reset password";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]">
      {/* STEP 1 */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
          <div className="flex items-center gap-4 mb-6">
            <IoArrowBack
              className="text-[#ff4d2d] cursor-pointer"
              size={30}
              onClick={() => navigate("/signin")}
            />
            <h1 className="text-2xl font-bold text-[#ff4d2d]">
              Forgot Password
            </h1>
          </div>

          <div>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#ff4d2d]"
                placeholder="Enter your Email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>
            <button
              onClick={handleSendOtp}
              type="button"
              className="w-full font-semibold py-2.5 rounded-lg transition duration-200 cursor-pointer bg-[#ff4d2d] text-white hover:bg-[#e64323]"
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color="white" /> : "Send OTP"}
            </button>
            {/* error text */}
            <p className="text-red-800 text-center my-2">
              {error && `*${error}`}
            </p>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
          <div className="flex items-center gap-4 mb-6">
            <IoArrowBack
              className="text-[#ff4d2d] cursor-pointer"
              size={30}
              onClick={() => setStep(1)}
            />
            <h1 className="text-2xl font-bold text-[#ff4d2d]">Verify OTP</h1>
          </div>

          <div>
            <div className="mb-6">
              <label
                htmlFor="otp"
                className="block text-gray-700 font-medium mb-1"
              >
                OTP
              </label>
              <input
                id="otp"
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#ff4d2d]"
                placeholder="Enter OTP"
                onChange={(e) => setOtp(e.target.value)}
                value={otp}
                required
              />
            </div>
            <button
              onClick={handleVerifyOtp}
              type="button"
              className="w-full font-semibold py-2.5 rounded-lg transition duration-200 cursor-pointer bg-[#ff4d2d] text-white hover:bg-[#e64323]"
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color="white" /> : "Verify"}
            </button>
            {/* error text */}
            <p className="text-red-800 text-center my-2">
              {error && `*${error}`}
            </p>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
          <div className="flex items-center gap-4 mb-6">
            <IoArrowBack
              className="text-[#ff4d2d] cursor-pointer"
              size={30}
              onClick={() => setStep(2)}
            />
            <h1 className="text-2xl font-bold text-[#ff4d2d]">
              Reset Password
            </h1>
          </div>

          <div>
            <div className="mb-6">
              <label
                htmlFor="newPassword"
                className="block text-gray-700 font-medium mb-1"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#ff4d2d]"
                placeholder="Enter new password"
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 font-medium mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#ff4d2d]"
                placeholder="Confirm password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                required
              />
            </div>
            <button
              type="button"
              onClick={handleResetPassword}
              className="w-full font-semibold py-2.5 rounded-lg transition duration-200 cursor-pointer bg-[#ff4d2d] text-white hover:bg-[#e64323]"
              disabled={loading}
            >
              {loading ? (
                <ClipLoader size={20} color="white" />
              ) : (
                "Reset Password"
              )}
            </button>
            {/* error text */}
            <p className="text-red-800 text-center my-2">
              {error && `*${error}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
