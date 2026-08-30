import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "./../App";
import { setMyOrders } from "../redux/userSlice";

const useGetMyOrders = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user || {});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/order/my-orders`, {
          withCredentials: true,
        });

        const ordersArray =
          result.data?.order ||
          result.data?.filteredOrders ||
          (Array.isArray(result.data) ? result.data : []);

        dispatch(setMyOrders(ordersArray));
      } catch (error) {
        console.error("Error in useGetMyOrders hook:", error);
      }
    };

    if (userData) {
      fetchOrders();
    }
  }, [userData, dispatch]);
};

export default useGetMyOrders;