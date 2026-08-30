import React, { useRef, useState, useEffect } from "react";
import { categories } from "../Category.js";
import CategoryCard from "./CategoryCard.jsx";
import { FaCircleChevronLeft } from "react-icons/fa6";
import { FaChevronCircleRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import useGetShopByCity from "../hooks/useGetShopByCity.jsx";
import useGetItemByCity from "../hooks/useGetItemByCity.jsx";
import FoodCard from "./FoodCard.jsx";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const UserDashBoard = () => {
  useGetShopByCity();
  useGetItemByCity();

  const { currentCity, shopsInMyCity, itemsInMyCity, searchItems } =
    useSelector((state) => state.user || {});

  const cateScrollRef = useRef();
  const shopScrollRef = useRef();
  const [showLeftCate, setShowLeftCate] = useState(false);
  const [showRightCate, setShowRightCate] = useState(true);
  const navigate = useNavigate();

  const [showLeftShop, setShowLeftShop] = useState(false);
  const [showRightShop, setShowRightShop] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleFilterByCategory = (category) => {
    setSelectedCategory(category);
    toast.success(`Showing ${category} items`, {
      id: "category-filter-toast",
    });
  };

  const updatedItemList =
    selectedCategory === "All"
      ? itemsInMyCity || []
      : itemsInMyCity?.filter((i) => i.category === selectedCategory) || [];

  const checkCateScroll = () => {
    const el = cateScrollRef.current;
    if (el) {
      setShowLeftCate(el.scrollLeft > 0);
      setShowRightCate(
        Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth,
      );
    }
  };

  const checkShopScroll = () => {
    const el = shopScrollRef.current;
    if (el) {
      setShowLeftShop(el.scrollLeft > 0);
      setShowRightShop(
        Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth,
      );
    }
  };

  useEffect(() => {
    checkCateScroll();
    checkShopScroll();
    window.addEventListener("resize", checkCateScroll);
    window.addEventListener("resize", checkShopScroll);
    return () => {
      window.removeEventListener("resize", checkCateScroll);
      window.removeEventListener("resize", checkShopScroll);
    };
  }, [shopsInMyCity]);

  const handleHorizontalScroll = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollLeft += direction === "left" ? -300 : 300;
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 pb-10">
      {Array.isArray(searchItems) && searchItems.length > 0 && (
        <div className="w-full max-w-6xl flex flex-col gap-5 p-2.5 mx-auto border-b border-gray-200 pb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-gray-800 text-2xl sm:text-3xl font-bold">
              Search Results
            </h1>
            <span className="bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-semibold px-2.5 py-0.5 rounded-full">
              {searchItems.length} {searchItems.length === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="w-full flex flex-wrap gap-5 justify-start">
            {searchItems.map((item, index) => (
              <FoodCard key={item._id || index} data={item} />
            ))}
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl flex flex-col gap-5 p-2.5 mx-auto">
        <h1 className="text-gray-700 text-2xl sm:text-3xl font-bold">
          Inspiration for Your Order
        </h1>

        <div className="w-full relative">
          <button
            onClick={() => handleHorizontalScroll(cateScrollRef, "left")}
            className={`absolute left-2 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full z-10 ${!showLeftCate ? "hidden" : ""}`}
          >
            <FaCircleChevronLeft size={20} />
          </button>

          <div
            ref={cateScrollRef}
            onScroll={checkCateScroll}
            className="w-full flex overflow-x-auto gap-4 pb-2 scrollbar-none md:scrollbar-thin scrollbar-thumb-[#ff4d2d] scroll-smooth px-2"
          >
            {categories.map((cate, index) => (
              <CategoryCard
                key={index}
                name={cate.category}
                image={cate.image}
                onClick={() => handleFilterByCategory(cate.category)}
              />
            ))}
          </div>

          <button
            onClick={() => handleHorizontalScroll(cateScrollRef, "right")}
            className={`absolute right-2 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full z-10 ${!showRightCate ? "hidden" : ""}`}
          >
            <FaChevronCircleRight size={20} />
          </button>
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap-5 p-2.5 mx-auto">
        <h1 className="text-gray-700 text-2xl sm:text-3xl font-bold">
          Best shops in {currentCity || "Your City"}
        </h1>

        <div className="w-full relative">
          <button
            onClick={() => handleHorizontalScroll(shopScrollRef, "left")}
            className={`absolute left-2 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full z-10 ${!showLeftShop ? "hidden" : ""}`}
          >
            <FaCircleChevronLeft size={20} />
          </button>

          <div
            ref={shopScrollRef}
            onScroll={checkShopScroll}
            className="w-full flex overflow-x-auto gap-4 pb-2 scrollbar-none md:scrollbar-thin scrollbar-thumb-[#ff4d2d] scroll-smooth px-2"
          >
            {shopsInMyCity && shopsInMyCity.length > 0 ? (
              shopsInMyCity.map((shop, index) => (
                <CategoryCard
                  name={shop.name}
                  image={shop.image}
                  key={shop._id || index}
                  onClick={() => navigate(`/shop/${shop._id}`)}
                />
              ))
            ) : (
              <p className="text-gray-400 text-sm py-4">
                No shops available in this area.
              </p>
            )}
          </div>

          <button
            onClick={() => handleHorizontalScroll(shopScrollRef, "right")}
            className={`absolute right-2 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full z-10 ${!showRightShop ? "hidden" : ""}`}
          >
            <FaChevronCircleRight size={20} />
          </button>
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap-5 p-2.5 mx-auto">
        <h1 className="text-gray-700 text-2xl sm:text-3xl font-bold">
          Suggested food items
        </h1>
        <div className="w-full h-auto flex flex-wrap gap-5 justify-center">
          {updatedItemList && updatedItemList.length > 0 ? (
            updatedItemList.map((item, index) => (
              <FoodCard key={item._id || index} data={item} />
            ))
          ) : (
            <p className="text-gray-400 text-sm py-4">
              No food items available in this category.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashBoard;
