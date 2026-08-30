import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import toast from "react-hot-toast";

const UserOrderCard = ({ data }) => {
  const navigate = useNavigate();
  const orderId = data?._id ? data._id.slice(-6) : "N/A";

  // Key: `${orderId}_${itemId}` -> value: number (1 to 5)
  const [ratedMap, setRatedMap] = useState({});

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleRating = async (itemId, starValue) => {
    const key = `${data?._id}_${itemId}`;

    try {
      const response = await axios.post(
        `${serverUrl}/api/item/rating`,
        {
          itemId,
          rating: Number(starValue),
          orderId: data?._id,
        },
        { withCredentials: true },
      );

      if (response.data?.success || response.status === 200) {
        setRatedMap((prev) => ({
          ...prev,
          [key]: Number(starValue),
        }));
        toast.success(`Rated ${starValue} ★ successfully!`);
      }
    } catch (error) {
      console.error("handle rating error", error);
      toast.error(
        error.response?.data?.message || "Rating could not be submitted.",
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4 border border-gray-100">
      <div className="flex justify-between border-b pb-2">
        <div>
          <p className="font-semibold text-gray-800">Order #{orderId}</p>
          <p className="text-sm font-medium text-gray-600">
            Date: {formatDate(data?.createdAt)}
          </p>
        </div>
        <div className="text-right space-y-0.5">
          <p className="text-sm text-gray-500">
            {data?.paymentMethod ? data.paymentMethod.toUpperCase() : "N/A"}
          </p>
          <p
            className={`text-xs font-semibold ${
              data?.payment ? "text-green-600" : "text-amber-600"
            }`}
          >
            Payment: {data?.payment ? "Success" : "Pending"}
          </p>
          <p className="font-medium text-blue-600">
            {data?.shopOrders?.[0]?.status}
          </p>
        </div>
      </div>

      {data?.shopOrders?.map((shopOrder, sIndex) => {
        const isDelivered =
          shopOrder?.status?.trim().toLowerCase() === "delivered";

        return (
          <div
            key={shopOrder._id || sIndex}
            className="border rounded-lg p-3 bg-[#fffaf7] space-y-3"
          >
            <p className="font-medium text-gray-800">
              {shopOrder.shop?.name || shopOrder.shopName || "Shop"}
            </p>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {shopOrder?.shopOrderItems?.map((item, iIndex) => {
                const productId = (
                  item?.item?._id ||
                  item?.item ||
                  item?.itemId ||
                  item?._id
                )?.toString();

                const productName =
                  item?.item?.name || item?.name || "Food item";
                const productImage = item?.item?.image || item?.image;

                const ratingKey = `${data?._id}_${productId}`;

                // Check both local instant state and DB persistent flag
                const isAlreadyRated =
                  Boolean(item?.isRated) || Boolean(ratedMap[ratingKey]);
                const finalRating =
                  ratedMap[ratingKey] || item?.userRating || 0;

                return (
                  <div
                    key={item._id || iIndex}
                    className="shrink-0 w-40 border rounded-lg p-2 bg-white flex flex-col justify-between"
                  >
                    <div>
                      <img
                        src={productImage}
                        alt={productName}
                        className="w-full h-24 object-cover rounded"
                      />
                      <p className="text-sm font-semibold mt-1 truncate">
                        {productName}
                      </p>
                      <p className="text-xs text-gray-600">
                        Qty {item?.quantity} x ₹{item?.price}
                      </p>
                    </div>

                    {isDelivered && (
                      <div className="mt-2 pt-1 border-t border-gray-50">
                        {isAlreadyRated ? (
                          <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 px-2 py-1 rounded-md w-fit">
                            <span className="text-yellow-500 text-xs font-bold">
                              ★
                            </span>
                            <span className="text-[11px] font-bold text-yellow-700">
                              {finalRating ? `${finalRating}/5` : "Rated"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                className="text-lg text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors"
                                onClick={() => handleRating(productId, star)}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <p className="font-semibold text-sm">
                SubTotal: ₹{shopOrder.subTotal}
              </p>
              <span className="text-sm font-medium text-blue-600 capitalize">
                Status: {shopOrder.status}
              </span>
            </div>
          </div>
        );
      })}

      <div className="flex justify-between items-center border-t pt-2">
        <p className="font-bold text-gray-800">Total: ₹{data?.totalAmount}</p>
        <button
          type="button"
          className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-150 cursor-pointer"
          onClick={() => navigate(`/track-order/${data?._id}`)}
        >
          Track Order
        </button>
      </div>
    </div>
  );
};

export default UserOrderCard;
