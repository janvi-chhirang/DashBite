import React, { useState } from "react";
import { FaLeaf, FaDrumstickBite, FaStar, FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa6";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/userSlice";
import toast from "react-hot-toast";

const FoodCard = ({ data }) => {
  const [quantity, setQuantity] = useState(0);
  const dispatch = useDispatch();

  const handleIncrement = (e) => {
    e.stopPropagation();
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    setQuantity((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); 
    if (quantity === 0) {
      toast.error("Please select a quantity first");
      return;
    }

    dispatch(
      addToCart({
        id: data._id || data.id, 
        name: data.name,
        price: data.price,
        image: data.image,
        shop: data.shop,
        quantity: quantity,
        foodType: data.foodType,
      })
    );

    toast.success(`Added ${quantity} × ${data.name} to cart`);
    setQuantity(0);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} className="text-yellow-500 text-sm" />
        ) : (
          <FaRegStar key={i} className="text-yellow-500 text-sm" />
        )
      );
    }
    return stars;
  };

  return (
    <div className="group w-62.5 rounded-2xl border-2 border-[#ff4d2d] bg-white shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer">
      <div className="relative w-full h-42.5 flex justify-center items-center bg-gray-50 overflow-hidden">
        <div className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow z-10 flex items-center justify-center">
          {data?.foodType?.toLowerCase() === "veg" ? (
            <FaLeaf className="text-green-600 text-base" />
          ) : (
            <FaDrumstickBite className="text-red-600 text-base" />
          )}
        </div>
        <img
          src={data?.image}
          alt={data?.name || "food image"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex-1 flex flex-col p-4 pb-1">
        <h1 className="font-semibold text-gray-900 text-base truncate">
          {data?.name}
        </h1>
        <div className="flex items-center gap-1 mt-1">
          <div className="flex items-center gap-0.5">
            {renderStars(data?.rating?.average || 0)}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({data?.rating?.count || 0})
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto p-4 pt-2">
        <span className="font-bold text-gray-900 text-lg">₹{data?.price}</span>
        
        <div className="flex items-center border border-gray-200 rounded-full overflow-hidden shadow-sm bg-white">
          <button 
            onClick={handleDecrement}
            className="px-2.5 py-2 hover:bg-gray-100 text-gray-600 transition active:scale-95 cursor-pointer"
            aria-label="Decrease quantity"
          >
            <FaMinus size={10}/>
          </button>
          <span className="px-2 font-medium text-sm min-w-5 text-center select-none">
            {quantity}
          </span>
          <button 
            onClick={handleIncrement}
            className="px-2.5 py-2 hover:bg-gray-100 text-gray-600 transition active:scale-95 cursor-pointer"
            aria-label="Increase quantity"
          >
            <FaPlus size={10}/>
          </button>
          <button 
            onClick={handleAddToCart}
            disabled={quantity === 0}
            className={`px-3.5 py-2 text-white transition-colors active:scale-95 ${
              quantity > 0 ? "bg-[#ff4d2d] hover:bg-[#e03a1b] cursor-pointer" : "bg-gray-300 cursor-not-allowed"
            }`}
            aria-label="Add to cart"
          >
            <FaShoppingCart size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
