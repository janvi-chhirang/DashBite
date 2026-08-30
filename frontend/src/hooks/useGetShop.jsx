import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { serverUrl } from "./../App";
import { setMyShopData } from "../redux/ownerSlice";

const useGetShop = () => {
  const dispatch = useDispatch();
   useEffect(() => {
    const fetchShop = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-my-shop`, {
          withCredentials: true,
        });
        dispatch(setMyShopData(result.data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchShop()
  }, [dispatch]);

}

export default useGetShop;