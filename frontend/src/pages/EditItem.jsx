import React, { useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "./../App";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";

const EditItem = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { itemId } = useParams();

  const { myShopData } = useSelector((state) => state.Owner || {});
  const [currItem, setCurrItem] = useState(null);

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const categories = [
    "Snacks",
    "Main Course",
    "Desserts",
    "Pizza",
    "Burgers",
    "Sandwiches",
    "South Indian",
    "North Indian",
    "Chinese",
    "Fast Food",
    "Others",
  ];
  const [foodType, setFoodType] = useState("");
  const foodTypes = ["Veg", "Non-Veg"];

  const [frontImage, setFrontImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFrontImage(file);
      setBackendImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter item name");
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!foodType) {
      toast.error("Please select a food type");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("foodType", foodType);
      formData.append("price", price);

      if (frontImage) {
        formData.append("image", frontImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/item/edit-item/${itemId}`,
        formData,
        { withCredentials: true },
      );

      dispatch(setMyShopData(result.data.shop));
      toast.success(`${name} updated successfully!`);

      setLoading(false);
      navigate("/");
    } catch (error) {
      console.error("Error submitting the form:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update item. Please try again.",
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/item/get-by-id/${itemId}`,
          { withCredentials: true },
        );

        const item = res.data?.item || res.data;

        if (item) {
          setName(item.name || "");
          setPrice(item.price || 0);
          setCategory(item.category || "");
          setFoodType(item.foodType || "");
          setBackendImage(item.image || null);
        }
      } catch (error) {
        console.error("Error fetching item data:", error);
        toast.error("Failed to fetch item details");
      }
    };

    if (itemId) {
      fetchItemData();
    }
  }, [itemId]);

  return (
    <div className="flex flex-col justify-center items-center p-6 bg-linear-to-br from-orange-50 to-white relative min-h-screen">
      <div className="absolute top-5 left-5 z-10">
        <IoMdArrowBack
          onClick={() => navigate("/")}
          size={25}
          className="text-[#ff4d2d] cursor-pointer hover:scale-110 transition-transform duration-200"
        />
      </div>

      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100">
        <div className="flex flex-col items-center">
          <div className="bg-orange-100 p-4 rounded-full mb-4 flex items-center justify-center">
            <FaUtensils className="text-[#ff4d2d] w-14 h-14 sm:w-16 sm:h-16" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800">Edit Your Item</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          key={myShopData ? "edit" : "add"}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="shopName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>

            <input
              id="shopName"
              type="text"
              placeholder="Enter Item Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-sm"
            />
          </div>

          <div>
            <label
              htmlFor="shopImage"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Food Image
            </label>

            <input
              id="shopImage"
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-sm"
            />

            {backendImage && (
              <div className="mt-4 flex justify-center">
                <img
                  src={backendImage}
                  alt="Shop Preview"
                  className="mt-2 w-32 h-32 object-cover rounded-lg border border-orange-100 shadow-sm"
                />
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="shopPrice"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price (Rs.)
            </label>

            <input
              id="shopPrice"
              type="number"
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-sm"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>

            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-sm"
            >
              <option value="">Select a category</option>
              {categories.map((cate, index) => (
                <option key={index} value={cate}>
                  {cate}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="foodType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Food Type
            </label>

            <select
              id="foodType"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-sm"
            >
              <option value="">Select a food type</option>
              {foodTypes.map((cate, index) => (
                <option key={index} value={cate}>
                  {cate}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-[#ff4d2d] text-white py-3 px-6 rounded-lg cursor-pointer font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200"
            disabled={loading}
          >
            {loading ? <ClipLoader size={20} color="white" /> : "Save"}
          </button>
          <div />
        </form>
      </div>
    </div>
  );
};

export default EditItem;
