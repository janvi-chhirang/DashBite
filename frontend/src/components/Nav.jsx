import React, { useState, useEffect, useRef } from "react";
import { IoLocation, IoSearch, IoCartOutline } from "react-icons/io5";
import { TbReceipt2 } from "react-icons/tb";
import { FaPlus } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "./../App";
import { setSearchItems, setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Nav = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userData, currentCity } = useSelector((state) => state.user || {});
  const cartItems = useSelector(
    (state) => state.cart?.cartItems || state.user?.cartItems || [],
  );
  const { myShopData } = useSelector((state) => state.Owner || {});

  const currentUser = userData?.user || userData;
  const userRole = currentUser?.role || userData?.role;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const abortControllerRef = useRef(null);
  const dropdownRef = useRef(null);

  const totalCartCount = cartItems.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogOut = async () => {
    try {
      setIsDropdownOpen(false);
      await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      toast.success("Logged out successfully!");
      navigate("/signin");
    } catch (error) {
      console.error("LogOut error", error);
      toast.error(error.response?.data?.message || "Failed to log out. Try again.");
    }
  };

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      dispatch(setSearchItems(null));
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/item/search-items?query=${encodeURIComponent(trimmedQuery)}&city=${encodeURIComponent(currentCity || "")}`,
          {
            withCredentials: true,
            signal: controller.signal,
          },
        );
        dispatch(setSearchItems(result.data.items || []));
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error in search:-", error.response?.data || error);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, currentCity, dispatch]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      dispatch(setSearchItems(null));
    }
  };

  const handleClear = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setQuery("");
    setShowSearch(false);
    dispatch(setSearchItems(null));
  };

  return (
    <div className="w-full h-20 flex items-center justify-between md:justify-center gap-6 px-5 fixed top-0 z-50 bg-[#fff9f6] border-b border-gray-100">
      {showSearch && userRole === "User" && (
        <div className="w-[90%] fixed top-20 left-[5%] h-11 bg-white shadow-md rounded-lg flex items-center gap-5 px-4 z-50 animate-fadeIn">
          <div className="flex items-center w-[30%] overflow-hidden gap-2 border-r-2 border-gray-400">
            <IoLocation className="w-6 h-6 text-[#ff4d2d]" />
            <div className="w-[80%] truncate text-gray-600">{currentCity}</div>
          </div>
          <div className="w-[70%] flex items-center gap-2">
            <IoSearch size={22} className="text-[#ff4d2d]" />
            <input
              onChange={handleInputChange}
              value={query}
              type="text"
              placeholder="Search what you crave for..."
              className="px-2 text-gray-700 outline-none w-full"
            />
            <RxCross2
              size={25}
              className="text-[#ff4d2d] cursor-pointer"
              onClick={handleClear}
            />
          </div>
        </div>
      )}

      <h1
        onClick={() => navigate("/")}
        className="text-3xl font-bold mb-2 text-[#ff4d2d] cursor-pointer"
      >
        DashBite
      </h1>

      {userRole === "User" && (
        <div className="hidden md:flex md:w-[60%] lg:w-[40%] h-11 bg-white shadow-md rounded-lg items-center gap-5 px-4">
          <div className="flex items-center w-[30%] overflow-hidden gap-2 border-r-2 border-gray-400">
            <IoLocation className="w-6 h-6 text-[#ff4d2d]" />
            <div className="w-[80%] truncate text-gray-600">{currentCity}</div>
          </div>

          <div className="w-[70%] flex items-center gap-2">
            <IoSearch size={22} className="text-[#ff4d2d]" />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search what you crave for..."
              className="px-2 text-gray-700 outline-none w-full"
            />
            {query && (
              <RxCross2
                size={22}
                className="text-gray-400 hover:text-[#ff4d2d] cursor-pointer"
                onClick={handleClear}
              />
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 relative">
        {userRole === "User" && (
          <IoSearch
            size={22}
            className="text-[#ff4d2d] md:hidden cursor-pointer"
            onClick={() => setShowSearch(!showSearch)}
          />
        )}

        {userRole === "User" && (
          <div
            className="relative cursor-pointer"
            onClick={() => navigate("/cart")}
          >
            <IoCartOutline size={25} className="text-[#ff4d2d]" />
            <span className="absolute -right-2 -top-2 text-[#ff4d2d] font-bold text-xs">
              {totalCartCount}
            </span>
          </div>
        )}

        {userRole === "Owner" && (
          <>
            {myShopData && (
              <button
                className="flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d] hover:bg-[#ff4d2d]/20 transition duration-200"
                onClick={() => navigate("/add-food")}
              >
                <FaPlus className="w-5 h-5 md:w-4.5 md:h-4.5" />
                <span className="hidden md:inline">Add Food Items</span>
              </button>
            )}

            <div
              className="hidden md:flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium hover:bg-[#ff4d2d]/20 transition duration-200"
              onClick={() => navigate("/my-orders")}
            >
              <TbReceipt2 size={18} />
              <span>My Orders</span>
            </div>

            <div
              className="md:hidden flex items-center justify-center w-10 h-10 cursor-pointer relative rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]"
              onClick={() => navigate("/my-orders")}
            >
              <TbReceipt2 size={20} />
            </div>
          </>
        )}

        {userRole === "User" && (
          <button
            className="hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium cursor-pointer hover:bg-[#ff4d2d]/20 transition duration-200"
            onClick={() => navigate("/my-orders")}
          >
            My Orders
          </button>
        )}

        {/* Profile Avatar & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[17px] shadow-sm font-semibold cursor-pointer select-none active:scale-95 hover:shadow-md transition-all duration-150"
          >
            {currentUser?.fullName
              ? currentUser.fullName.slice(0, 1).toUpperCase()
              : "?"}
          </div>

          {/* Compact Dropdown Menu */}
          <div
            className={`absolute top-12 right-0 w-44 bg-white shadow-xl rounded-xl p-3 flex flex-col gap-1 z-50 border border-gray-100 origin-top-right transform transition-all duration-150 ease-out ${
              isDropdownOpen && currentUser
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
            }`}
          >
            <div className="text-[14px] font-bold text-gray-800 truncate border-b border-gray-100 pb-1.5 px-1">
              {currentUser?.fullName}
            </div>

            {userRole === "User" && (
              <div
                className="md:hidden text-[13px] font-semibold text-gray-600 cursor-pointer hover:text-[#ff4d2d] hover:bg-orange-50/50 rounded-lg px-2 py-1.5 transition-all duration-100"
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate("/my-orders");
                }}
              >
                My Orders
              </div>
            )}

            <div
              className="text-[#ff4d2d] font-semibold text-[13px] cursor-pointer hover:text-[#e03e1f] hover:bg-orange-50/50 rounded-lg px-2 py-1.5 transition-all duration-100"
              onClick={handleLogOut}
            >
              Log Out
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nav;
