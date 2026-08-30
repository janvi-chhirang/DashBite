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

const SignUp = () => {
  const primaryColor = "#ff4d2d";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("User");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignUp = async () => {
    if (!fullName.trim()) {
      setError("Please enter your full name");
      toast.error("Please enter your full name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email");
      toast.error("Please enter your email");
      return;
    }
    if (!mobileNumber.trim()) {
      setError("Please enter your mobile number");
      toast.error("Please enter your mobile number");
      return;
    }
    if (!password) {
      setError("Please enter a password");
      toast.error("Please enter a password");
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          fullName,
          email,
          password,
          mobileNumber,
          role,
        },
        { withCredentials: true },
      );
      dispatch(setUserData(result.data));
      setLoading(false);
      setError("");
      toast.success("Account created successfully! Welcome to DashBite.");
      navigate("/");
    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!mobileNumber) {
      setError("Mobile Number is Required");
      toast.error("Mobile Number is Required for Google Sign Up");
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
          role,
          mobileNumber,
        },
        { withCredentials: true },
      );
      dispatch(setUserData(data));
      setError("");
      toast.success("Signed up with Google successfully!");
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
          Create your account to get started with delicious food deliveries
        </p>

        {/* full name */}
        <div className="mb-4">
          <label
            htmlFor="fullName"
            className="block text-gray-700 font-medium mb-1"
          >
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Enter your Full Name"
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            required
          />
        </div>

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

        {/* mobile */}
        <div className="mb-4">
          <label
            htmlFor="mobileNumber"
            className="block text-gray-700 font-medium mb-1"
          >
            Mobile Number
          </label>
          <input
            id="mobileNumber"
            type="tel"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Enter your Mobile Number"
            onChange={(e) => setMobileNumber(e.target.value)}
            value={mobileNumber}
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

        {/* role */}
        <div className="mb-4">
          <label
            htmlFor="role"
            className="block text-gray-700 font-medium mb-1"
          >
            Role
          </label>
          <div className="flex gap-2">
            {["User", "Owner", "Delivery-Boy"].map((r) => (
              <button
                key={r}
                type="button"
                className="flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors cursor-pointer"
                onClick={() => setRole(r)}
                style={
                  role === r
                    ? {
                        backgroundColor: primaryColor,
                        color: "white",
                        borderColor: primaryColor,
                      }
                    : {
                        border: `solid 1px ${borderColor}`,
                        color: "#555",
                      }
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Sign-up button */}
        <button
          onClick={handleSignUp}
          type="button"
          className="w-full font-semibold py-2.5 rounded-lg transition duration-200 cursor-pointer bg-[#ff4d2d] text-white hover:bg-[#e64323]"
          disabled={loading}
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Sign Up"}
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
          <span>Sign up with Google</span>
        </button>

        {/* Already have an account */}
        <p className="text-center text-sm text-gray-600 mt-2">
          Already have an account?{" "}
          <span
            className="font-semibold cursor-pointer hover:underline transition-all"
            style={{ color: primaryColor }}
            onClick={() => navigate("/signin")}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
