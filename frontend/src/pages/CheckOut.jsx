import React, { useEffect, useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { IoLocationSharp } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { TbCurrentLocationFilled } from "react-icons/tb";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import "leaflet/dist/leaflet.css";
import { setAddress, setLocation } from "../redux/mapSlice";
import axios from "axios";
import { MdDeliveryDining } from "react-icons/md";
import { FaMobileAlt } from "react-icons/fa";
import { FaCreditCard } from "react-icons/fa";
import { addMyOrder } from "../redux/userSlice";
import toast from "react-hot-toast";

const serverUrl = import.meta.env.VITE_SERVER_URL || "";

const getAddressByLatLng = async (lat, lon, dispatch) => {
  const apiKey = import.meta.env.VITE_GEOAPIKEY;
  try {
    const result = await axios.get(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${apiKey}`,
    );
    dispatch(setAddress(result?.data?.results[0]?.formatted));
  } catch (error) {
    console.log("error in getAddressByLatLng api : ", error);
  }
};

const getCurrLocation = async (dispatch) => {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      console.log(position);
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      dispatch(setLocation({ lat: latitude, lon: longitude }));
      toast.success("Location fetched successfully!");
    },
    (error) => {
      console.log("Geolocation error:", error);
      toast.error("Failed to get current location");
    },
  );
};

function RecenterMap({ location, dispatch }) {
  const map = useMap();

  useEffect(() => {
    if (location.lat && location.lon) {
      map.setView([location.lat, location.lon], 16, { animate: true });
      getAddressByLatLng(location.lat, location.lon, dispatch);
    }
  }, [location, map, dispatch]);

  return null;
}

const CheckOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { location, address } = useSelector((state) => state.map);
  const { cartItems, totalAmt } = useSelector((state) => state.user);
  const [addressInput, setAddressInput] = useState("");
  const apiKey = import.meta.env.VITE_GEOAPIKEY;
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const deliveryFee = totalAmt > 500 ? 0 : 40;
  const amountWithDeliveryFee = totalAmt + deliveryFee;

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng;
    dispatch(setLocation({ lat, lon: lng }));
    getAddressByLatLng(lat, lng, dispatch);
    toast.success("Pin location updated!");
  };

  const getLatLonByAddress = async () => {
    if (!addressInput.trim()) {
      toast.error("Please enter an address to search");
      return;
    }
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          addressInput,
        )}&apiKey=${apiKey}`,
      );
      console.log(result);
      if (result?.data?.features?.length > 0) {
        const [lon, lat] = result.data.features[0].geometry.coordinates;
        dispatch(setLocation({ lat, lon }));
        dispatch(setAddress(result.data.features[0].properties.formatted));
        toast.success("Address found on map!");
      } else {
        toast.error("No location found for this address");
      }
    } catch (error) {
      console.log("error in getLatLonByAddress api : ", error);
      toast.error("Error searching address");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAddressInput(address || "");
  }, [address]);

  const handlePlaceOrder = async () => {
    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    if (!addressInput.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }

    try {
      const result = await axios.post(
        `${serverUrl}/api/order/place-order`,
        {
          paymentMethod,
          deliveryAddress: {
            text: addressInput,
            latitude: location?.lat,
            longitude: location?.lon,
          },
          totalAmount: amountWithDeliveryFee,
          cartItems,
        },
        { withCredentials: true },
      );
      if (paymentMethod === "cod") {
        if (result?.data?.newOrder) {
          dispatch(addMyOrder(result.data.newOrder));
        }
        toast.success("Order placed successfully!");
        navigate("/order-placed");
      } else {
        const orderId = result.data.orderId;
        const razorOrder = result.data.razorOrder;
        openRazorPayWindow(orderId, razorOrder);
      }
    } catch (error) {
      console.log("Error in placing order : ", error);
      toast.error(error.response?.data?.message || "Error placing order");
    }
  };

  const openRazorPayWindow = async (orderId, razorOrder) => {
    if (!window.Razorpay) {
      toast.error(
        "Razorpay SDK failed to load. Please check your internet connection.",
      );
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: "INR",
      name: "DashBite",
      description: "Food Delivery Website",
      order_id: razorOrder.id,
      prefill: {
        name: "Customer",
        email: "customer@dashbite.com",
        contact: "9876543210",
      },
      readonly: {
        contact: true,
        email: true,
        name: true,
      },
      handler: async function (response) {
        try {
          const result = await axios.post(
            `${serverUrl}/api/order/verify-payment`,
            {
              razorpay_payment_id: response.razorpay_payment_id,
              orderId,
            },
            { withCredentials: true },
          );
          dispatch(addMyOrder(result.data));
          toast.success("Payment verified! Order placed successfully.");
          navigate("/order-placed");
        } catch (error) {
          console.log("Error verifying payment: ", error);
          toast.error(
            error.response?.data?.message || "Payment verification failed",
          );
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      toast.error(response.error?.description || "Payment failed!");
    });
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-6">
      <div className="absolute top-5 left-5 z-10">
        <IoMdArrowBack
          onClick={() => navigate("/cart")}
          size={35}
          className="text-[#ff4d2d] cursor-pointer"
        />
      </div>
      <div className="w-full max-w-225 bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">CheckOut</h1>
        <section>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
            <IoLocationSharp className="text-[#ff4d2d]" /> Delivery Location
          </h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              placeholder="Enter your delivery address..."
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
            />
            <button
              className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-lg flex items-center justify-center cursor-pointer"
              onClick={getLatLonByAddress}
            >
              <FaSearch />
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center cursor-pointer"
              onClick={() => getCurrLocation(dispatch)}
            >
              <TbCurrentLocationFilled />
            </button>
          </div>
          <div className="rounded-xl border overflow-hidden">
            <div className="h-64 w-full flex items-center justify-center">
              <MapContainer
                className={"w-full h-full"}
                center={[location?.lat || 0, location?.lon || 0]}
                zoom={16}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap location={location} dispatch={dispatch} />
                <Marker
                  position={[location?.lat || 0, location?.lon || 0]}
                  draggable
                  eventHandlers={{ dragend: onDragEnd }}
                />
              </MapContainer>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Payment Method
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${
                paymentMethod === "cod"
                  ? "border-[#ff4d2d] bg-orange-50 shadow"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => {
                setPaymentMethod("cod");
                toast.success("Payment method set to Cash on Delivery");
              }}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <MdDeliveryDining className="text-green-600 text-xl" />
              </span>
              <div>
                <p className="font-medium text-gray-800">Cash On Delivery</p>
                <p className="text-xs text-gray-500">
                  Pay when your food arrives
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${
                paymentMethod === "online"
                  ? "border-[#ff4d2d] bg-orange-50 shadow"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => {
                setPaymentMethod("online");
                toast.success("Payment method set to Online Payment");
              }}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <FaMobileAlt className="text-purple-700 text-lg" />
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <FaCreditCard className="text-blue-700 text-lg" />
              </span>
              <div>
                <p className="font-medium text-gray-800">
                  UPI / Credit /Debit Card
                </p>
                <p className="text-xs text-gray-500">Pay Securely Online</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Order Summary
          </h2>
          <div className="rounded-xl border bg-gray-50 p-4 space-y-3">
            {cartItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between text-sm text-gray-700"
              >
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>₹ {item.price * item.quantity}</span>
              </div>
            ))}
            <hr className="border-gray-200 my-2" />
            <div className="flex justify-between text-gray-800">
              <span>SubTotal</span>
              <span>₹ {totalAmt}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? "Free" : `₹ ${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-[#ff4d2d] pt-2">
              <span>Total</span>
              <span>₹ {amountWithDeliveryFee}</span>
            </div>
          </div>
        </section>
        <button
          onClick={handlePlaceOrder}
          className="w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-xl font-semibold cursor-pointer"
        >
          {paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"}
        </button>
      </div>
    </div>
  );
};

export default CheckOut;
