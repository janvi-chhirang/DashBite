import React from "react";
import { useSelector } from "react-redux";
import UserDashBoard from "./../components/userDashBoard";
import OwnerDashBoard from "./../components/ownerDashBoard";
import DeliveryBoyDashBoard from "./../components/DeliveryBoyDashBoard";
import Nav from "../components/Nav";

const Home = () => {
  const { userData } = useSelector((state) => state.user || {});
  const currentUser = userData?.user || userData;
  const userRole = currentUser?.role;

  return (
    <div className="w-screen min-h-screen pt-25 flex flex-col items-center bg-[#fff9f6]">
      <Nav />

      {!currentUser && (
        <p className="text-gray-500 mt-10">
          Loading user profile or Not Logged In...
        </p>
      )}

      {userRole === "User" && <UserDashBoard />}
      {userRole === "Owner" && <OwnerDashBoard />}
      {userRole === "Delivery-Boy" && <DeliveryBoyDashBoard />}
    </div>
  );
};

export default Home;
