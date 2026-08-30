import React, { useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "./../App";

import { setMyShopData } from "../redux/ownerSlice"; 
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";

const CreateEditShop = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  
  const { myShopData } = useSelector((state) => state.Owner || {});
  const { currentCity, currentState, currentAddress } = useSelector(
    (state) => state.user || {},
  );
  
  const [name, setName] = useState(myShopData?.name || "");
  const [address, setAddress] = useState(
    myShopData?.address || currentAddress || "",
  );
  const [city, setCity] = useState(myShopData?.city || currentCity || "");
  const [shopState, setShopState] = useState(
    myShopData?.state || currentState || "",
  );

  const [frontImage, setFrontImage] = useState(null);
  const [backendImage, setBackendImage] = useState(myShopData?.image || "");

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
      toast.error("Please enter shop name");
      return;
    }
    if (!shopState.trim()) {
      toast.error("Please enter state");
      return;
    }
    if (!city.trim()) {
      toast.error("Please enter city");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter shop address");
      return;
    }
    if (!myShopData && !frontImage) {
      toast.error("Please upload a shop image");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("address", address);
      formData.append("city", city);
      formData.append("state", shopState);

      if (frontImage) {
        formData.append("image", frontImage); 
      }
      
      const result = await axios.post(`${serverUrl}/api/shop/create-edit-shop`, formData, { withCredentials: true });
      
      dispatch(setMyShopData(result.data.shop));
      toast.success(
        myShopData
          ? "Shop details updated successfully!"
          : "Shop registered successfully!"
      );
      
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.error("Error submitting the form:", error);
      toast.error(
        error.response?.data?.message || "Failed to save shop details. Please try again."
      );
      setLoading(false);
    }
  };    

  const formKey = `${currentAddress || ""}-${currentCity || ""}-${currentState || ""}`;

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

          <h2 className="text-2xl font-bold text-gray-800">
            {myShopData ? "Edit Shop" : "Add Shop"}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          key={myShopData ? "edit" : formKey}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="shopName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Shop Name
            </label>

            <input
              id="shopName"
              type="text"
              placeholder="Enter Shop Name"
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
              Shop Image
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                State
              </label>

              <input
                id="state"
                type="text"
                placeholder="State"
                value={shopState}
                onChange={(e) => setShopState(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                City
              </label>

              <input
                id="city"
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Address
            </label>

            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address.."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#ff4d2d] text-white py-3 px-6 rounded-lg cursor-pointer font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200" disabled={loading}
          >
            {loading ? <ClipLoader size={20} color="white"/> : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEditShop;
