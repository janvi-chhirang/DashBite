import { useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  setCurrentCity,
  setCurrentState,
  setCurrentAddress,
} from "../redux/userSlice";
import { setAddress, setLocation } from "../redux/mapSlice";
import { serverUrl } from "./../App";

const useUpdateLocation = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user || {});

  useEffect(() => {
    const updateLocation = async (lat, lon) => {
      const result = await axios.post(
        `${serverUrl}/api/user/update-location`,
        {
          latitude: lat,
          longitude: lon,
        },
        { withCredentials: true },
      );
      console.log(result.data);
    };
    navigator.geolocation.watchPosition((pos)=>{
        const { latitude, longitude } = pos.coords;
        updateLocation(latitude, longitude);
    })
  }, [userData]);
};

export default useUpdateLocation;
