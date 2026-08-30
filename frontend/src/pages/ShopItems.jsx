import axios from "axios";
import React, { useEffect, useState } from "react";
import { serverUrl } from "../App";
import { useParams, useNavigate } from "react-router-dom";
import { FaStore, FaUtensils } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { IoArrowBack } from "react-icons/io5";
import FoodCard from "../components/FoodCard";
import toast from "react-hot-toast";

const ShopItems = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [shop, setShop] = useState(null);

  useEffect(() => {
    const handleShop = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/item/get-item-by-shop/${shopId}`,
          { withCredentials: true },
        );
        setShop(result.data?.shop || null);
        setItems(result.data?.item || []);
      } catch (error) {
        console.error("Failed to fetch shop items:", error);
        toast.error(
          error.response?.data?.message || "Failed to load shop menu. Try again."
        );
      }
    };

    if (shopId) {
      handleShop();
    }
  }, [shopId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button with clean circular white/accent theme */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 z-20 flex items-center justify-center p-3 rounded-full bg-white text-orange-500 shadow-lg hover:bg-orange-500 hover:text-white transition-all duration-200 cursor-pointer active:scale-95"
      >
        <IoArrowBack size={22} />
      </button>

      {/* Hero Header */}
      {shop && (
        <div className="relative w-full h-64 md:h-80 lg:h-96">
          <img
            src={shop.image}
            alt={shop.name || "Shop banner"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-transparent flex flex-col justify-center items-center text-center px-4">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">
              {shop.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <FaLocationDot size={20} className=" shrink-0" color="red" />
              <p className="text-lg font-medium text-gray-200">
                {shop.address}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Menu Section */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="flex items-center justify-center gap-3 text-3xl font-bold mb-10 text-gray-800">
          <FaUtensils className="text-orange-500" />
          Our Menu
        </h2>

        {items.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8">
            {items.map((item) => (
              <FoodCard key={item._id || item.id} data={item} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg py-8">
            No Items Available
          </p>
        )}
      </div>
    </div>
  );
};

export default ShopItems;
