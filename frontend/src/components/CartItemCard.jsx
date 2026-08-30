import React from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { FaTrashCan } from "react-icons/fa6";
import { removeCartItem, updateQty } from "../redux/userSlice";
import toast from "react-hot-toast";

const CartItemCard = ({ data }) => {
  const dispatch = useDispatch();

  const handleIncrement = (id, currentQty) => {
    dispatch(updateQty({ id, quantity: currentQty + 1 }));
    toast.success(`Quantity Increased to ${currentQty + 1}`);
  };

  const handleDecrement = (id, currentQty) => {
    if (currentQty > 1) {
      dispatch(updateQty({ id, quantity: currentQty - 1 }));
      toast.success(`Quantity Decreased to ${currentQty - 1}`);
    } else {
      dispatch(removeCartItem(id));
      toast.error(`${data.name} removed from cart`);
    }
  };

  const handleRemove = (id) => {
    dispatch(removeCartItem(id));
    toast.success(`${data.name} removed from cart`);
  };

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow border">
      <div className="flex items-center gap-4">
        <img
          src={data.image}
          alt="image"
          className="w-25 h-25 object-cover rounded-lg border"
        />
        <div>
          <h1 className="font-medium text-gray-800">{data.name}</h1>
          <p className="text-sm text-gray-700">
            ₹{data.price} x {data.quantity}
          </p>
          <p className="font-bold text-gray-900">
            ₹{data.price * data.quantity}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          className="p-2 cursor-pointer bg-gray-100 rounded-full hover:bg-gray-200"
          aria-label="Decrease quantity"
          onClick={() => handleDecrement(data.id || data._id, data.quantity)}
        >
          <FaMinus size={10} />
        </button>
        <span>{data.quantity}</span>
        <button
          className="p-2 cursor-pointer bg-gray-100 rounded-full hover:bg-gray-200"
          aria-label="Increase quantity"
          onClick={() => handleIncrement(data.id || data._id, data.quantity)}
        >
          <FaPlus size={10} />
        </button>
        <button
          className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 cursor-pointer"
          onClick={() => handleRemove(data.id || data._id)}
        >
          <FaTrashCan size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItemCard;
