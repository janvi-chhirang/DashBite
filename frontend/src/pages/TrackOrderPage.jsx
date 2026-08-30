import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking";
import { serverUrl } from "./../App";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSelector((state) => state.user || {});
  const [currentOrder, setCurrentOrder] = useState(null);
  const [liveLocation, setLiveLocation] = useState({});

  useEffect(() => {
    if (!socket) return;

    const handleUpdateLocation = ({ deliveryBoyId, latitude, longitude }) => {
      setLiveLocation((prev) => ({
        ...prev,
        [deliveryBoyId]: { lat: latitude, lon: longitude },
      }));
    };

    socket.on("updateDeliveryBoyLocation", handleUpdateLocation);

    return () => {
      socket.off("updateDeliveryBoyLocation", handleUpdateLocation);
    };
  }, [socket]);

  useEffect(() => {
    const handleGetOrder = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/order/get-order-by-id/${orderId}`,
          { withCredentials: true },
        );
        setCurrentOrder(result?.data?.order || result?.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch order details",
        );
      }
    };

    if (orderId) {
      handleGetOrder();
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[#fffaf7] py-6 px-4 font-sans">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="cursor-pointer"
          >
            <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Track Order</h1>
        </div>

        {/* Orders List */}
        {currentOrder?.shopOrders?.map((shopOrder, index) => {
          const isDelivered =
            shopOrder?.status?.toLowerCase() === "delivered" ||
            currentOrder?.status?.toLowerCase() === "delivered";

          const itemsList = shopOrder?.shopOrderItems
            ?.map((item) => item?.name || item?.item?.name)
            .filter(Boolean)
            .join(", ");

          const deliveryBoy = shopOrder?.assignedDeliveryBoy;
          const deliveryBoyId = deliveryBoy?._id || deliveryBoy?.id;

          // Use live socket coordinates if available, otherwise fallback to database coordinates
          const liveCoords = deliveryBoyId ? liveLocation[deliveryBoyId] : null;

          const trackingPayload = {
            deliveryBoyLocation: {
              lat:
                liveCoords?.lat ||
                deliveryBoy?.location?.coordinates?.[1] ||
                deliveryBoy?.location?.lat,
              lon:
                liveCoords?.lon ||
                deliveryBoy?.location?.coordinates?.[0] ||
                deliveryBoy?.location?.lon,
            },
            customerLocation: {
              lat:
                currentOrder?.deliveryAddress?.latitude ||
                currentOrder?.deliveryAddress?.lat ||
                currentOrder?.deliveryAddress?.location?.coordinates?.[1],
              lon:
                currentOrder?.deliveryAddress?.longitude ||
                currentOrder?.deliveryAddress?.lon ||
                currentOrder?.deliveryAddress?.location?.coordinates?.[0],
            },
            deliveryAddress: {
              text:
                currentOrder?.deliveryAddress?.text ||
                currentOrder?.deliveryAddress?.address ||
                currentOrder?.deliveryAddress?.city ||
                "Delivery Address",
            },
          };

          return (
            <div
              key={shopOrder?._id || index}
              className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 space-y-4"
            >
              {/* Shop Name & Status Badge */}
              <div className="flex justify-between items-center">
                <h2 className="text-[22px] font-bold text-[#ff4d2d]">
                  {shopOrder?.shop?.name || shopOrder?.shopName || "Restaurant"}
                </h2>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    isDelivered
                      ? "bg-green-50 text-green-600 border-green-200"
                      : "bg-orange-50 text-[#ff4d2d] border-orange-200"
                  }`}
                >
                  {shopOrder?.status || "Processing"}
                </span>
              </div>

              {/* Items & Subtotal */}
              <div className="space-y-1 text-[15px] text-gray-800">
                <p>
                  <span className="font-bold">Items: </span>
                  {itemsList || "N/A"}
                </p>
                <p>
                  <span className="font-bold">Subtotal: </span>₹
                  {shopOrder?.subTotal}
                </p>
              </div>

              {/* Delivery Address */}
              <div className="text-[15px] text-gray-800">
                <p>
                  <span className="font-bold">Delivery address: </span>
                  {trackingPayload.deliveryAddress.text}
                </p>
              </div>

              {/* Conditional Rendering: Delivered Message vs Live Tracking */}
              {isDelivered ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3.5">
                  <FaCheckCircle className="text-green-600 text-2xl shrink-0" />
                  <div>
                    <h3 className="text-base font-bold text-green-700">
                      Delivered
                    </h3>
                    <p className="text-xs text-green-600 font-medium">
                      Delivered at:{" "}
                      {shopOrder?.deliveredAt
                        ? new Date(shopOrder.deliveredAt).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Recently"}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Delivery Boy Info */}
                  <div className="text-[15px] text-gray-800 space-y-1">
                    <p className="font-bold">Delivery Boy Info:</p>
                    <p>
                      Name:{" "}
                      {deliveryBoy?.fullName ||
                        deliveryBoy?.name ||
                        "Not Assigned"}
                    </p>
                    <p>
                      Contact No.:{" "}
                      {deliveryBoy?.phone || deliveryBoy?.mobileNumber || "N/A"}
                    </p>
                  </div>

                  {/* Map */}
                  <DeliveryBoyTracking data={trackingPayload} />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackOrderPage;
