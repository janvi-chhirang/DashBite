import React, { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "./../App";
import { useDispatch, useSelector } from "react-redux";
import { setshopsInMyCity } from "../redux/userSlice";

const useGetShopByCity = () => {
  const dispatch = useDispatch();
  const currentCity = useSelector((state) => state.user.currentCity);

  useEffect(() => {
    if (!currentCity) return; 

    const fetchShop = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-shop-by-city/${currentCity}`, {
          withCredentials: true,
        });

        dispatch(setshopsInMyCity(result.data));
        console.log("Shops loaded:", result.data);
      } catch (error) {
        console.error("Error fetching shops:", error);
      }
    };

    fetchShop();
  }, [dispatch,currentCity]); 
};

export default useGetShopByCity;
