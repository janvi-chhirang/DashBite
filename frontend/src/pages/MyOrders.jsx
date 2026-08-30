import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "./../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";
import { setMyOrders, updateRealTimeOrderStatus } from "../redux/userSlice";
import toast from "react-hot-toast";

const MyOrders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData, myOrders, socket } = useSelector(
    (state) => state.user || {},
  );

  const userRole = userData?.role || userData?.user?.role || "User";
  const userId = userData?._id || userData?.user?._id;

  const rawList = useMemo(() => {
    return Array.isArray(myOrders)
      ? myOrders
      : Array.isArray(myOrders?.filteredOrders)
        ? myOrders.filteredOrders
        : Array.isArray(myOrders?.order)
          ? myOrders.order
          : Array.isArray(myOrders?.orders)
            ? myOrders.orders
            : myOrders
              ? [myOrders]
              : [];
  }, [myOrders]);

  const ordersList = useMemo(() => {
    return rawList.filter(
      (order) => order && (order._id || order.newOrder?._id),
    );
  }, [rawList]);

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (data) => {
      const ownerId = data?.shopOrders?.owner?._id || data?.shopOrders?.owner;

      if (ownerId && userId && ownerId.toString() === userId.toString()) {
        dispatch(setMyOrders([data, ...rawList]));
        toast.success("New incoming order received!", {
          duration: 4000,
        });
      }
    };

    const handleUpdateStatus = ({
      orderId,
      shopId,
      status,
      userId: eventUserId,
    }) => {
      if (
        userId &&
        eventUserId &&
        eventUserId.toString() === userId.toString()
      ) {
        dispatch(updateRealTimeOrderStatus({ orderId, shopId, status }));
        toast.success(`Order status updated to: ${status}`);
      }
    };

    socket.on("newOrder", handleNewOrder);
    socket.on("update-status", handleUpdateStatus);

    return () => {
      socket.off("newOrder", handleNewOrder);
      socket.off("update-status", handleUpdateStatus);
    };
  }, [socket, dispatch, userId, rawList]);

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex justify-center px-4 pt-6">
      <div className="w-full max-w-3xl p-4">
        <div className="flex items-center gap-5 mb-6">
          <IoMdArrowBack
            onClick={() => navigate("/")}
            size={25}
            className="text-[#ff4d2d] cursor-pointer hover:scale-110 transition-transform duration-200"
          />
          <h1 className="text-2xl font-bold text-gray-800">
            {userRole === "Owner" ? "Orders" : "My Orders"}
          </h1>
        </div>

        <div className="space-y-6">
          {ordersList.length > 0 ? (
            ordersList.map((orderItem, index) => {
              const cleanItem = orderItem?.newOrder || orderItem;
              if (userRole === "Owner") {
                return (
                  <OwnerOrderCard
                    key={cleanItem?._id || index}
                    data={cleanItem}
                  />
                );
              }
              return (
                <UserOrderCard key={cleanItem?._id || index} data={cleanItem} />
              );
            })
          ) : (
            <p className="text-center text-gray-500 font-medium">
              No orders found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
