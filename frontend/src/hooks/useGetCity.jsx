import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setCurrentCity, setCurrentState, setCurrentAddress } from "../redux/userSlice"; 
import { setAddress, setLocation } from "../redux/mapSlice";

const useGetCity = () => {
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    // Get the longitude and latitude of the device
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          console.log(position);
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          dispatch(setLocation({lat:latitude,lon:longitude}));
          
          const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`,
          );
          
          if (
            result.data &&
            result.data.results &&
            result.data.results.length > 0
          ) {
            const locationData = result.data.results[0];

            let cityName = locationData.city;
            if (
              !cityName ||
              cityName.toLowerCase().includes("colony") ||
              cityName.toLowerCase().includes("nagar")
            ) {
              cityName =
                locationData.state_district || locationData.county || cityName;
            }
            if (cityName) {
              cityName = cityName.replace(/\b(Tehsil|District)\b/gi, "").trim();
            }
            
            const stateName = locationData.state; 


            dispatch(setCurrentCity(cityName));
            
            if (stateName) {
              dispatch(setCurrentState(stateName)); 
            }
            dispatch(setCurrentAddress(locationData.formatted));
            // console.log("City and State from coordinates:", cityName, stateName);
            dispatch(setAddress(result?.data?.results[0].formatted))
          }
        } catch (error) {
          console.error("Error fetching city from coordinates:", error);
        }
      },
      (error) => {
        console.error("Geolocation error or permission denied:", error);
      },
    );
  }, [dispatch, apiKey]);
};

export default useGetCity;
