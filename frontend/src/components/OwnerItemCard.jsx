import React from "react";
import { FaPen } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "./../App";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";
import toast from "react-hot-toast";

const OwnerItemCard = ({ item }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDelete = async () => {
    try {
      const res = await axios.delete(
        `${serverUrl}/api/item/delete-item/${item._id}`,
        { withCredentials: true },
      );
      dispatch(setMyShopData(res.data.shop));
      toast.success(`${item.name} deleted successfully!`);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to delete item. Please try again.",
      );
    }
  };

  return (
    <div className="flex bg-white rounded-lg shadow-md overflow-hidden border border-[#ff4d2d] w-full max-w-2xl">
      <div className="w-36 shrink-0 bg-gray-50">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col justify-between p-3 flex-1 w-full">
        <div>
          <h2 className="text-base font-semibold text-[#ff4d2d]">
            {item.name}
          </h2>
          <p>
            <span className="font-medium text-gray-700">Category:</span>{" "}
            {item.category}
          </p>
          <p>
            <span className="font-medium text-gray-700">Food Type:</span>{" "}
            {item.foodType}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-[#ff4d2d] font-bold">Rs.{item.price}</div>
          <div className="flex items-center gap-1">
            <div
              className="p-2 rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d] cursor-pointer"
              onClick={() => navigate(`/edit-item/${item._id}`)}
            >
              <FaPen size={16} />
            </div>
            <div
              className="p-2 rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d] cursor-pointer"
              onClick={handleDelete}
            >
              <FaTrash size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerItemCard;
