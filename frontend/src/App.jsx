import { Navigate, Route, Routes } from "react-router-dom";
import SignUp from "./pages/signup";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import useGetCurrUser from "./hooks/useGetCurrUser";
import AddItems from "./pages/AddItems";
import EditItem from "./pages/EditItem";
import { useDispatch, useSelector } from "react-redux";
import Home from "./pages/Home";
import useGetCity from "./hooks/useGetCity";
import useGetShop from "./hooks/useGetShop";
import CreateEditShop from "./pages/CreateEditShop";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemByCity from "./hooks/useGetItemByCity";
import useUpdateLocation from "./hooks/useUpdateLocation";
import CartPage from "./pages/CartPage";
import CheckOut from "./pages/CheckOut";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";
import useGetMyOrders from "./hooks/useGetMyOrders";
import TrackOrderPage from "./pages/TrackOrderPage";
import ShopItems from "./pages/ShopItems";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { setSocket, updateRealTimeOrderStatus } from "./redux/userSlice";
import { Toaster } from "react-hot-toast";

export const serverUrl = "http://localhost:8000";

const App = () => {
  useUpdateLocation();
  useGetCurrUser();
  useGetCity();
  useGetShop();
  useGetShopByCity();
  useGetItemByCity();
  useGetMyOrders();

  const { userData } = useSelector((state) => state.user || {});

  const currentUser = userData?.user || userData;
  const currentUserId = currentUser?._id;
  const dispatch = useDispatch();

  useEffect(() => {
    if (!currentUserId) return;

    const socketInstance = io(serverUrl, { withCredentials: true });
    dispatch(setSocket(socketInstance));

    socketInstance.on("connect", () => {
      console.log("Connected to socket with ID:", socketInstance.id);
      socketInstance.emit("identity", { userId: currentUserId });
    });

    socketInstance.on("update-status", (data) => {
      dispatch(updateRealTimeOrderStatus(data));
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [currentUserId, dispatch]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500, 
          style: {
            background: "#ffffff",
            color: "#1f2937",
            padding: "12px 18px",
            borderRadius: "12px",
            border: "1px solid #f3f4f6",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
            fontSize: "14px",
            fontWeight: "600",
          },
          success: {
            iconTheme: {
              primary: "#10b981", 
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444", 
              secondary: "#ffffff",
            },
          },
        }}
      />
      <Routes>
        <Route
          path="/signup"
          element={!userData ? <SignUp /> : <Navigate to="/" />}
        />
        <Route
          path="/signin"
          element={!userData ? <SignIn /> : <Navigate to="/" />}
        />
        <Route
          path="/forgot-password"
          element={!userData ? <ForgotPassword /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to="/signin" />}
        />
        <Route
          path="/create-edit-shop"
          element={userData ? <CreateEditShop /> : <Navigate to="/signin" />}
        />
        <Route
          path="/add-food"
          element={userData ? <AddItems /> : <Navigate to="/signin" />}
        />
        <Route
          path="/edit-item/:itemId"
          element={userData ? <EditItem /> : <Navigate to="/signin" />}
        />
        <Route
          path="/cart"
          element={userData ? <CartPage /> : <Navigate to="/signin" />}
        />
        <Route
          path="/check-out"
          element={userData ? <CheckOut /> : <Navigate to="/signin" />}
        />
        <Route
          path="/order-placed"
          element={userData ? <OrderPlaced /> : <Navigate to="/signin" />}
        />
        <Route
          path="/my-orders"
          element={userData ? <MyOrders /> : <Navigate to="/signin" />}
        />
        <Route
          path="/track-order/:orderId"
          element={userData ? <TrackOrderPage /> : <Navigate to="/signin" />}
        />
        <Route
          path="/shop/:shopId"
          element={userData ? <ShopItems /> : <Navigate to="/signin" />}
        />
      </Routes>
    </>
  );
};

export default App;
