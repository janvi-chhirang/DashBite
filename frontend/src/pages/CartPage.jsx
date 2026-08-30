import React from "react";
import { IoMdArrowBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CartItemCard from "../components/CartItemCard";
import toast from "react-hot-toast";

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, totalAmt } = useSelector((state) => state.user || {});

  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty! Add items to proceed.");
      return;
    }
    navigate("/check-out");
  };

  return (
    <div className="min-h-screen bg-[#fff9f6] flex justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-5 mb-6">
          <IoMdArrowBack
            onClick={() => navigate("/")}
            size={25}
            className="text-[#ff4d2d] cursor-pointer hover:scale-110 transition-transform duration-200"
          />
          <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
        </div>

        {!cartItems || cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-orange-100 shadow-sm text-center flex flex-col items-center gap-3">
            <p className="text-gray-500 text-lg font-medium">
              Cart is currently empty.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer active:scale-95 shadow-xs"
            >
              Browse Food Items
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems?.map((item, index) => (
                <CartItemCard data={item} key={item._id || item.id || index} />
              ))}
            </div>
            <div className="mt-6 bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border border-gray-100">
              <h1 className="text-lg font-semibold text-gray-800">Total Amount</h1>
              <span className="text-xl font-bold text-[#ff4d2d]">
                ₹{totalAmt}
              </span>
            </div>
            <div className="flex mt-4 justify-end">
              <button
                className="rounded-lg bg-[#ff4d2d] px-6 py-3 text-lg font-medium text-white transition hover:bg-[#e64526] active:scale-95 cursor-pointer shadow-sm"
                onClick={handleCheckout}
              >
                Check Out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
