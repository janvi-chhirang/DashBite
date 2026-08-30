import { useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../FireBase";
import { ClipLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import toast from "react-hot-toast";

const SignIn = () => {
  const primaryColor = "#ff4d2d";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      const msg = "Please enter both email and password";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        {
          email,
          password,
        },
        { withCredentials: true },
      );
      dispatch(setUserData(result.data));
      setLoading(false);
      setError("");
      toast.success("Signed in successfully!");
      navigate("/");
    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const firebaseRes = await signInWithPopup(auth, provider);

      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: firebaseRes.user.displayName,
          email: firebaseRes.user.email,
        },
        { withCredentials: true },
      );

      // Dispatch backend DB user data (NOT firebase credentials)
      dispatch(setUserData(data));
      setError("");
      toast.success("Signed in with Google successfully!");
      navigate("/");
    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex justify-center items-center p-4"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-8"
        style={{ border: `1px solid ${borderColor}` }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: primaryColor }}>
          DashBite
        </h1>
        <p className="text-gray-600 mb-8">
          Sign In to your account to get started with delicious food deliveries
        </p>

        {/* email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Enter your Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>

        {/* password */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 font-medium mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter a strong password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <IoMdEye /> : <IoMdEyeOff />}
            </button>
          </div>
        </div>
        <div
          className="text-right mb-3 text-[#ff4d2d] font-medium cursor-pointer"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password
        </div>

        {/* Sign-in button */}
        <button
          onClick={handleSignIn}
          type="button"
          className="w-full font-semibold py-2.5 rounded-lg transition duration-200 cursor-pointer bg-[#ff4d2d] text-white hover:bg-[#e64323]"
          disabled={loading}
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Sign In"}
        </button>

        {/* error text */}
        <p className="text-red-800 text-center my-2">{error && `*${error}`}</p>

        {/* OR Separator */}
        <div className="flex items-center my-2">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-gray-400 text-sm font-medium">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* google button */}
        <button
          onClick={handleGoogleAuth}
          type="button"
          className="w-full flex items-center justify-center gap-2 cursor-pointer border rounded-lg px-4 py-2.5 transition duration-200 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
        >
          <FcGoogle size={22} />
          <span>Sign in with Google</span>
        </button>

        {/* Want to create a new account */}
        <p className="text-center text-sm text-gray-600 mt-2">
          Want to create a new account?{" "}
          <span
            className="font-semibold cursor-pointer hover:underline transition-all"
            style={{ color: primaryColor }}
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
