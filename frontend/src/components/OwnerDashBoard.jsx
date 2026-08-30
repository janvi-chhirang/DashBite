import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaPen, FaPlus, FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "./../App";
import { setMyShopData } from "../redux/ownerSlice";
import OwnerItemCard from "./OwnerItemCard"; 
import toast from "react-hot-toast";

const OwnerDashBoard = () => {
  const { myShopData } = useSelector((state) => state.Owner);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/shop/get-my-shop`, {
          withCredentials: true,
        });

        if (response.data && response.data.shop) {
          dispatch(setMyShopData(response.data.shop));
        } else if (response.data && response.data.myShopData) {
          dispatch(setMyShopData(response.data.myShopData));
        }
      } catch (error) {
        console.error("Error fetching shop data:", error);
        toast.error(
          error.response?.data?.message || "Failed to load shop details",
          { id: "shop-fetch-error" }
        );
      }
    };

    if (!myShopData) {
      fetchShop();
    }
  }, [myShopData, dispatch]);

  return (
    <div className="w-full min-h-[calc(100vh-76px)] bg-[#fff9f6] flex flex-col items-center pt-6 sm:pt-10 pb-12 antialiased">
      {!myShopData ? (
        <div className="flex justify-center items-center px-4 w-full">
          <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-orange-100 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <FaUtensils className="text-[#ff4d2d] w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Add Your Restaurant
            </h2>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              Join our food delivery platform and reach thousands of hungry
              customers every day.
            </p>
            <button
              onClick={() => navigate("/create-edit-shop")}
              className="bg-[#ff4d2d] hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-full shadow-md transition-all duration-200 cursor-pointer flex items-center gap-2"
            >
              <FaPlus size={14} /> Get Started
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-3xl px-4 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-md border border-orange-50/50 overflow-hidden relative group w-full">
            <div className="w-full h-48 sm:h-64 md:h-72 bg-orange-50 relative overflow-hidden">
              <img
                src={myShopData?.shop?.image || myShopData?.image}
                alt="Shop Banner"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />

              <button
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center backdrop-blur-sm"
                onClick={() => navigate("/create-edit-shop")}
                title="Edit Shop Details"
              >
                <FaPen size={14} className="text-[#ff4d2d]" />
              </button>
            </div>

            <div className="p-6 sm:p-8 relative">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold tracking-wider text-[#ff4d2d] uppercase bg-orange-50 px-2.5 py-1 rounded-md w-fit">
                  Restaurant Dashboard
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {myShopData?.shop?.name || myShopData?.name}
                </h1>

                <div className="flex items-start gap-2 text-gray-600 text-sm sm:text-base mt-2">
                  <FaMapMarkerAlt className="text-gray-400 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-700">
                      {myShopData?.city}, {myShopData?.state}
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5 leading-relaxed">
                      {myShopData?.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Empty Menu State */}
          {myShopData && (!myShopData?.item || myShopData?.item?.length === 0) && (
            <div className="w-full bg-white border border-dashed border-orange-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                  <FaUtensils className="text-[#ff4d2d] w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Your Menu is Empty!
                  </h3>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Start adding your delicious food items to attract more
                    storefront customers.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/add-food")}
                className="bg-[#ff4d2d] hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-full shadow-md transition-colors duration-200 cursor-pointer flex items-center gap-2 whitespace-nowrap text-sm"
              >
                <FaPlus size={12} /> Add Food Item
              </button>
            </div>
          )}

          {/* Items List */}
          {myShopData?.item && myShopData.item.length > 0 && (
            <div className="flex flex-col gap-4 items-center w-full max-w-3xl">
              {myShopData.item.map((item, index) => (
                <OwnerItemCard key={item._id || index} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashBoard;
