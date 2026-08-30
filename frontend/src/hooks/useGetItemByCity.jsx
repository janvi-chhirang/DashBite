import React, { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "./../App";
import { useDispatch, useSelector } from "react-redux";
import { setitemsInMyCity, setshopsInMyCity } from "../redux/userSlice";

const useGetItemByCity = () => {
  const dispatch = useDispatch();
  const currentCity = useSelector((state) => state.user.currentCity);

  useEffect(() => {
    if (!currentCity) return; 

    const fetchShop = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/item/get-item-by-city/${currentCity}`, {
          withCredentials: true,
        });

        dispatch(setitemsInMyCity(result.data));
        console.log("Items loaded:", result.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchShop();
  }, [dispatch,currentCity]); 
};

export default useGetItemByCity;