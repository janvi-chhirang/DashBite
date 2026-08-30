import React, { useEffect, useRef } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../redux/userSlice";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

const OrderPlaced = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (!hasShownToast.current) {
      toast.success("Order confirmed! Your food is being prepared.");
      hasShownToast.current = true;
    }
  }, []);

  const handleBackToHome = () => {
    dispatch(clearCart());
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#fff9f6] flex flex-col justify-center items-center px-4 text-center relative overflow-hidden">
      <FaCheckCircle className="text-green-500 text-6xl mb-4 animate-bounce" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed!</h1>
      <p className="text-gray-600 max-w-md mb-6">
        Thank you for your purchase. Your order is being prepared. You can track
        your order status in the "My Orders" section.
      </p>
      <button
        className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-6 py-3 rounded-lg text-lg font-medium transition cursor-pointer"
        onClick={handleBackToHome}
      >
        Back to home
      </button>
    </div>
  );
};

export default OrderPlaced;
