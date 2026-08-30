import axios from "axios";
import React, { useState } from "react";
import { FaPhoneAlt } from "react-icons/fa";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../redux/userSlice";
import toast from "react-hot-toast";

const OwnerOrderCard = ({ data }) => {
  const dispatch = useDispatch();

  const shopOrderData = Array.isArray(data?.shopOrders)
    ? data.shopOrders[0]
    : data?.shopOrders || data?.shopOrder;

  const [updatedBoys, setUpdatedBoys] = useState(null);
  const currentStatus = shopOrderData?.status || "Pending";

  const broadcastedFromProps = Array.isArray(
    shopOrderData?.assignment?.brodcastedTo,
  )
    ? shopOrderData.assignment.brodcastedTo.map((boy) => ({
        deliveryBoyId: boy._id,
        fullName: boy.fullName,
        email: boy.email,
        mobileNumber: boy.mobileNumber,
        latitude: boy.location?.coordinates?.[1],
        longitude: boy.location?.coordinates?.[0],
      }))
    : [];

  const availableDeliveryBoys =
    updatedBoys !== null ? updatedBoys : broadcastedFromProps;

  const handleUpdateStatus = async (orderId, shopId, status) => {
    if (!status || status === currentStatus) return;

    try {
      dispatch(updateOrderStatus({ orderId, shopId, status }));

      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true },
      );

      if (Array.isArray(result.data?.availableDeliveryBoys)) {
        setUpdatedBoys(result.data.availableDeliveryBoys);
      } else {
        setUpdatedBoys([]);
      }

      toast.success(`Order status updated to "${status}"`);
    } catch (error) {
      console.error("Error in handleUpdateStatus : ", error);
      toast.error(
        error.response?.data?.message || "Failed to update order status",
      );
    }
  };

  const isCompleted =
    currentStatus === "Delivered" || currentStatus === "Cancelled";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
      {/* Customer Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {data?.user?.fullName || "Customer"}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.user?.email || "N/A"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200/80 w-fit">
          <FaPhoneAlt className="text-orange-500 text-xs" />
          <span>{data?.user?.mobileNumber || "N/A"}</span>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3.5 text-sm text-gray-800 space-y-1">
        <p className="font-medium text-gray-800 flex items-start gap-1.5 leading-relaxed">
          <span className="text-orange-500 shrink-0 mt-0.5">📍</span>
          <span>
            {data?.deliveryAddress?.text || "No delivery address provided"}
          </span>
        </p>
        {data?.deliveryAddress?.latitude &&
          data?.deliveryAddress?.longitude && (
            <p className="text-xs text-gray-400 pl-5 font-mono">
              lat: {data.deliveryAddress.latitude} , lon:{" "}
              {data.deliveryAddress.longitude}
            </p>
          )}
      </div>

      {/* Order Items */}
      <div className="flex space-x-3 overflow-x-auto pb-2 pt-1">
        {shopOrderData?.shopOrderItems?.map((item, index) => {
          const itemName = item?.name || item?.item?.name || "Food Item";
          const itemPrice = item?.price || item?.item?.price || 0;
          const itemImage = item?.item?.image || item?.image;

          return (
            <div
              key={index}
              className="shrink-0 w-44 border border-gray-200 rounded-xl p-3 bg-white shadow-xs flex flex-col justify-between"
            >
              <div className="w-full h-28 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden mb-2">
                <img
                  src={itemImage}
                  alt={itemName}
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 truncate">
                  {itemName}
                </p>
                <p className="text-xs font-semibold text-orange-600 mt-1">
                  Qty {item?.quantity || 1} × ₹{itemPrice}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Info */}
      <div className="flex justify-between items-center text-sm font-medium text-gray-800 bg-orange-50/50 border border-orange-100 p-3.5 rounded-xl">
        <div>
          Payment Method:{" "}
          <span className="font-bold text-gray-900 uppercase">
            {data?.paymentMethod || "cod"}
          </span>
        </div>
        <div>
          Payment Status:{" "}
          <span
            className={`font-bold ${
              data?.payment ? "text-green-600" : "text-amber-600"
            }`}
          >
            {data?.payment ? "Success" : "Pending"}
          </span>
        </div>
      </div>

      {/* Status Bar & Dropdown */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">status :</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200 capitalize">
            {currentStatus}
          </span>
        </div>

        <select
          value={currentStatus}
          disabled={isCompleted}
          onChange={(e) =>
            handleUpdateStatus(
              data._id,
              shopOrderData?.shop?._id || shopOrderData?.shop,
              e.target.value,
            )
          }
          className="rounded-lg border border-orange-300 bg-white px-3 py-1.5 text-sm font-semibold text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer shadow-xs hover:border-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="Pending">Pending</option>
          <option value="Preparing">Preparing</option>
          <option value="Out for delivery">Out for delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Available Delivery Partners Section */}
      {currentStatus === "Out for delivery" && (
        <div className="p-4 border border-orange-200 rounded-xl bg-orange-50/50 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
            </span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-950">
              Available Delivery Partners ({availableDeliveryBoys.length})
            </h4>
          </div>

          {availableDeliveryBoys.length > 0 ? (
            <div className="space-y-2">
              {availableDeliveryBoys.map((boy) => (
                <div
                  key={boy.deliveryBoyId || boy._id}
                  className="flex items-center justify-between p-3 bg-white border border-orange-100 rounded-lg shadow-xs hover:border-orange-300 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs uppercase">
                      {boy.fullName?.[0] || "D"}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      {boy.fullName}
                    </span>
                  </div>

                  <a
                    href={`tel:${boy.mobileNumber}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {boy.mobileNumber}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center bg-white/80 border border-dashed border-orange-200 rounded-lg">
              <p className="text-xs font-semibold text-amber-900 animate-pulse">
                ⏳ Searching & waiting for a delivery partner to accept...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Order Total */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <span className="text-sm font-medium text-gray-500">Order Total</span>
        <span className="text-lg font-black text-gray-900">
          Total: ₹{shopOrderData?.subTotal || 0}
        </span>
      </div>
    </div>
  );
};

export default OwnerOrderCard;
