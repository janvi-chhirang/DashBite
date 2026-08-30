import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { serverUrl } from "../App";
import Nav from "./Nav";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DeliveryBoyDashBoard = () => {
  const { userData, socket } = useSelector((state) => state.user || {});
  const [availableOrders, setAvailableOrders] = useState([]);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");

  // Delivery stats states
  const [deliveryStats, setDeliveryStats] = useState([]);
  const [todayDeliveriesCount, setTodayDeliveriesCount] = useState(0);
  const [totalDeliveriesCount, setTotalDeliveriesCount] = useState(0);

  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Realtime coordinates state for the delivery boy
  const initialLat =
    userData?.location?.coordinates?.[1] ||
    userData?.user?.location?.coordinates?.[1] ||
    null;
  const initialLon =
    userData?.location?.coordinates?.[0] ||
    userData?.user?.location?.coordinates?.[0] ||
    null;

  const [liveCoords, setLiveCoords] = useState({
    lat: initialLat,
    lon: initialLon,
  });

  // Socket listener for new assignments
  useEffect(() => {
    if (!socket || !userData) return;

    const handleNewAssignment = (data) => {
      const deliveryBoyId = userData?._id || userData?.user?._id;
      if (
        data?.sentTo &&
        deliveryBoyId &&
        data.sentTo.toString() === deliveryBoyId.toString()
      ) {
        setAvailableOrders((prev) => [...prev, data]);
        toast.success(
          `New order available from ${data.shopName || "a restaurant"}!`,
          {
            duration: 4000,
          },
        );
      }
    };

    socket.on("newAssignment", handleNewAssignment);

    return () => {
      socket.off("newAssignment", handleNewAssignment);
    };
  }, [socket, userData]);

  // Realtime Geolocation Tracker
  useEffect(() => {
    if (!socket || !userData) return;
    const userRole = userData?.role || userData?.user?.role;
    const userId = userData?._id || userData?.user?._id;

    if (userRole !== "Delivery-Boy") return;

    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const latitude = pos.coords.latitude;
          const longitude = pos.coords.longitude;

          setLiveCoords({ lat: latitude, lon: longitude });

          socket.emit("updateLocation", {
            latitude,
            longitude,
            userId,
          });
        },
        (error) => {
          console.error("Geolocation watch error:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        },
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [socket, userData]);

  // Fetch active assignment
  const fetchCurrentAssignment = useCallback(async () => {
    try {
      const response = await axios.get(
        `${serverUrl}/api/order/get-current-assignment`,
        { withCredentials: true },
      );

      if (response.data?.success) {
        setCurrentAssignment(response.data.currentAssignment);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setCurrentAssignment(null);
        return;
      }
      console.error("Error fetching current assignment:", err);
    }
  }, []);

  // Fetch all days delivery stats and earnings
  const fetchDeliveryStats = useCallback(async () => {
    try {
      const response = await axios.get(
        `${serverUrl}/api/order/get-delivery-stats`,
        { withCredentials: true },
      );

      if (response.data) {
        setDeliveryStats(response.data.stats || []);
        setTodayDeliveriesCount(response.data.todayDeliveriesCount || 0);
        setTotalDeliveriesCount(response.data.totalDeliveriesCount || 0);
      }
    } catch (err) {
      console.error("Error fetching delivery stats:", err);
    }
  }, []);

  // Refresh assignments
  const refreshAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${serverUrl}/api/order/get-assignments`,
        { withCredentials: true },
      );

      const assignments = Array.isArray(response.data)
        ? response.data
        : response.data?.formattedAssignments || [];

      setAvailableOrders(assignments);
      await Promise.allSettled([
        fetchCurrentAssignment(),
        fetchDeliveryStats(),
      ]);
    } catch (err) {
      console.error("Error in getAssignments:", err);
      const msg = err?.response?.data?.message || "Failed to load assignments";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [fetchCurrentAssignment, fetchDeliveryStats]);

  // Initial Load
  useEffect(() => {
    if (!userData) return;

    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const [assignmentsRes] = await Promise.allSettled([
          axios.get(`${serverUrl}/api/order/get-assignments`, {
            withCredentials: true,
          }),
          fetchCurrentAssignment(),
          fetchDeliveryStats(),
        ]);

        if (!isMounted) return;

        if (assignmentsRes.status === "fulfilled") {
          const data = assignmentsRes.value?.data;
          const assignments = Array.isArray(data)
            ? data
            : data?.formattedAssignments || [];
          setAvailableOrders(assignments);
        } else {
          setError(
            assignmentsRes.reason?.response?.data?.message ||
              "Failed to load assignments",
          );
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load dashboard");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [userData, fetchCurrentAssignment, fetchDeliveryStats]);

  // Accept Assignment
  const acceptAssignment = async (assignmentId) => {
    if (!assignmentId) return;

    try {
      const response = await axios.get(
        `${serverUrl}/api/order/accept-assignment/${assignmentId}`,
        { withCredentials: true },
      );

      if (response.data?.success) {
        toast.success("Delivery order accepted successfully!");
        await refreshAssignments();
      }
    } catch (err) {
      console.error("Error in acceptAssignment:", err);
      const msg = err?.response?.data?.message || "Failed to accept assignment";
      setError(msg);
      toast.error(msg);
    }
  };

  // Send delivery OTP
  const sendOTP = async (orderId, shopOrderId) => {
    try {
      const targetOrderId =
        orderId ||
        currentAssignment?.orderId?._id ||
        currentAssignment?.orderId ||
        currentAssignment?.shopOrder?.order;

      const targetShopOrderId =
        shopOrderId ||
        currentAssignment?.shopOrder?._id ||
        currentAssignment?.shopOrderId;

      const response = await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        {
          orderId: targetOrderId,
          shopOrderId: targetShopOrderId,
        },
        { withCredentials: true },
      );

      toast.success("Delivery OTP sent to the customer!");
      return response.data;
    } catch (err) {
      console.error("Error in sendOTP:", err);
      const msg = err?.response?.data?.message || "Failed to send OTP";
      setOtpError(msg);
      toast.error(msg);
    }
  };

  // Verify delivery OTP
  const verifyOTP = async (orderId, shopOrderId) => {
    try {
      setVerifyingOtp(true);
      setOtpError(null);

      const targetOrderId =
        orderId ||
        currentAssignment?.orderId?._id ||
        currentAssignment?.orderId ||
        currentAssignment?.shopOrder?.order;

      const targetShopOrderId =
        shopOrderId ||
        currentAssignment?.shopOrder?._id ||
        currentAssignment?.shopOrderId;

      const response = await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp`,
        {
          orderId: targetOrderId,
          shopOrderId: targetShopOrderId,
          otp: otp.trim(),
        },
        { withCredentials: true },
      );

      if (response.status === 200 || response.data?.success) {
        toast.success("Order marked as delivered! ₹50 added to earnings.");
        setShowOtpBox(false);
        setOtp("");
        await refreshAssignments();
      }
    } catch (err) {
      console.error("Error in verifyOTP:", err);
      const msg =
        err?.response?.data?.message || "Invalid OTP. Please try again.";
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Form submit
  const handleVerifyDeliveryOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Please enter the delivery OTP");
      return;
    }

    const orderId =
      currentAssignment?.orderId?._id ||
      currentAssignment?.orderId ||
      currentAssignment?.shopOrder?.order;

    const shopOrderId =
      currentAssignment?.shopOrder?._id || currentAssignment?.shopOrderId;

    await verifyOTP(orderId, shopOrderId);
  };

  const fullName =
    userData?.fullName || userData?.user?.fullName || "Delivery Partner";
  const displayLat =
    liveCoords.lat !== null ? liveCoords.lat.toFixed(6) : "Fetching...";
  const displayLon =
    liveCoords.lon !== null ? liveCoords.lon.toFixed(6) : "Fetching...";

  // Formatted tracking payload matching TrackOrderPage
  const trackingPayload = currentAssignment
    ? {
        deliveryBoyLocation: {
          lat:
            liveCoords?.lat ||
            userData?.location?.coordinates?.[1] ||
            userData?.user?.location?.coordinates?.[1],
          lon:
            liveCoords?.lon ||
            userData?.location?.coordinates?.[0] ||
            userData?.user?.location?.coordinates?.[0],
        },
        customerLocation: {
          lat:
            currentAssignment?.deliveryAddress?.latitude ||
            currentAssignment?.deliveryAddress?.lat ||
            currentAssignment?.deliveryAddress?.location?.coordinates?.[1] ||
            currentAssignment?.user?.location?.coordinates?.[1],
          lon:
            currentAssignment?.deliveryAddress?.longitude ||
            currentAssignment?.deliveryAddress?.lon ||
            currentAssignment?.deliveryAddress?.location?.coordinates?.[0] ||
            currentAssignment?.user?.location?.coordinates?.[0],
        },
        deliveryAddress: {
          text:
            currentAssignment?.deliveryAddress?.text ||
            currentAssignment?.deliveryAddress?.address ||
            currentAssignment?.deliveryAddress?.city ||
            "Delivery Address",
        },
      }
    : null;

  // Earnings calculations (₹50 per delivery)
  const todayEarnings = todayDeliveriesCount * 50;
  const totalEarningsTillToday = totalDeliveriesCount * 50;
  const maxVal = Math.max(...deliveryStats.map((d) => d.count), 4);

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-[#fff9f6] text-gray-800 pb-10">
      <Nav />
      <main className="w-full max-w-lg flex flex-col gap-5 px-4 pt-4">
        {/* Profile Card */}
        <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col items-center text-center border border-orange-100 gap-1.5">
          <h1 className="text-2xl font-bold text-[#ff4d2d]">
            Welcome, {fullName}
          </h1>
          <p className="text-xs text-gray-600">
            <span className="font-semibold text-gray-800">Latitude:</span>{" "}
            {displayLat} &nbsp;|&nbsp;
            <span className="font-semibold text-gray-800">Longitude:</span>{" "}
            {displayLon}
          </p>
        </section>

        {/* All-Days Deliveries Chart & Dual Earnings Card */}
        <section className="w-full bg-white rounded-2xl p-5 shadow-xs border border-orange-100 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-[#ff4d2d]">
              Deliveries Graph
            </h3>
            <span className="text-[11px] font-semibold text-gray-500 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md">
              All Days
            </span>
          </div>

          <div className="w-full h-44">
            {deliveryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={deliveryStats}
                  margin={{ top: 10, right: 10, left: -28, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="2 2"
                    stroke="#e5e7eb"
                    vertical={true}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={{ stroke: "#9ca3af" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    domain={[0, maxVal]}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={{ stroke: "#9ca3af" }}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255, 77, 45, 0.05)" }}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#fed7aa",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Deliveries"
                    fill="#ff4d2d"
                    radius={[0, 0, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No delivery history recorded yet.
              </div>
            )}
          </div>

          {/* Dual Earnings Section: Today's Earning & Earning Till Today */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-[#fbfbfb] border border-gray-100 rounded-xl py-3 px-2 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold text-gray-600">
                Today&apos;s Earning
              </span>
              <span className="text-xl font-extrabold text-[#16a34a] mt-0.5">
                ₹{todayEarnings}
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">
                ({todayDeliveriesCount} delivered today)
              </span>
            </div>

            <div className="bg-[#fbfbfb] border border-gray-100 rounded-xl py-3 px-2 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold text-gray-600">
                Earning Till Today
              </span>
              <span className="text-xl font-extrabold text-[#ff4d2d] mt-0.5">
                ₹{totalEarningsTillToday}
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">
                ({totalDeliveriesCount} total delivered)
              </span>
            </div>
          </div>
        </section>

        {/* Current Active Assignment */}
        {currentAssignment && trackingPayload && (
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100 flex flex-col gap-3.5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#ff4d2d] to-orange-400" />

            <div className="flex justify-between items-center pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff4d2d] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Active Delivery
                </span>
              </div>

              <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#fff5f2] text-[#ff4d2d] border border-orange-200 capitalize">
                {currentAssignment.shopOrder?.status ||
                  currentAssignment.status}
              </span>
            </div>

            <div className="flex justify-between items-center bg-[#fff9f6] px-4 py-3 rounded-xl border border-orange-100/80">
              <div>
                <h3 className="font-bold text-sm text-gray-900 leading-tight">
                  {currentAssignment.shop?.name || "Restaurant"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  To:{" "}
                  <span className="font-semibold text-gray-800">
                    {currentAssignment.user?.fullName || "Customer"}
                  </span>
                </p>
              </div>

              {currentAssignment.user?.mobileNumber && (
                <a
                  href={`tel:${currentAssignment.user.mobileNumber}`}
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-orange-50 active:scale-95 text-[#ff4d2d] border border-orange-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M6.62 10.79a15.053 15.053 0 006.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                  Call
                </a>
              )}
            </div>

            {/* Live Map Tracking Component */}
            <DeliveryBoyTracking data={trackingPayload} />

            <div className="bg-[#fff9f6] p-3.5 rounded-xl text-xs border border-orange-100/70 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <span className="text-[#ff4d2d] text-sm">📍</span>
                <p className="text-gray-700 leading-snug font-medium">
                  {currentAssignment.deliveryAddress?.text ||
                    "Address not provided"}
                </p>
              </div>

              {currentAssignment.shopOrder?.shopOrderItems?.length > 0 && (
                <p className="text-[11px] text-gray-500 border-t border-orange-100/80 pt-2">
                  <span className="font-semibold text-gray-700">Items: </span>
                  {currentAssignment.shopOrder.shopOrderItems
                    .map((item) => `${item.name} × ${item.quantity}`)
                    .join(", ")}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Total Bill
                </p>
                <p className="font-extrabold text-xl text-gray-900 leading-none mt-0.5">
                  ₹{currentAssignment.shopOrder?.subTotal || 0}
                </p>
              </div>

              <button
                onClick={() => {
                  setOtp("");
                  setOtpError(null);
                  setShowOtpBox(true);
                  const orderId =
                    currentAssignment?.orderId?._id ||
                    currentAssignment?.orderId ||
                    currentAssignment?.shopOrder?.order;
                  const shopOrderId =
                    currentAssignment?.shopOrder?._id ||
                    currentAssignment?.shopOrderId;
                  sendOTP(orderId, shopOrderId);
                }}
                className="flex-1 max-w-60 h-11 bg-[#ff4d2d] hover:bg-[#e03e1f] active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Mark Delivered</span>
              </button>
            </div>
          </section>
        )}

        {/* Orders Header */}
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-bold text-gray-800">Available Orders</h2>
          <button
            onClick={() => {
              refreshAssignments();
              toast.success("Assignments refreshed!");
            }}
            className="text-xs font-semibold text-[#ff4d2d] hover:underline cursor-pointer"
          >
            Refresh
          </button>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="p-8 text-center text-sm text-gray-500 bg-white rounded-2xl border border-orange-50 shadow-sm">
            Fetching available deliveries...
          </div>
        )}

        {!loading && error && (
          <div className="p-4 text-center text-xs text-red-600 bg-red-50 rounded-2xl border border-red-100">
            {error}
          </div>
        )}

        {!loading && !error && availableOrders.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500 bg-white rounded-2xl border border-orange-50 shadow-sm">
            No delivery assignments available right now. Check back soon!
          </div>
        )}

        {/* Available Orders List */}
        {!loading && !error && availableOrders.length > 0 && (
          <div className="flex flex-col gap-4">
            {availableOrders.map((assignment) => {
              const targetId = assignment.assignmentId || assignment._id;
              const totalAmount = assignment.items?.reduce(
                (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
                0,
              );

              return (
                <div
                  key={targetId || assignment.orderId}
                  className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5 flex flex-col gap-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-base text-gray-900">
                        {assignment.shopName || "Restaurant"}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Order #{assignment.orderId?.slice(-6)}
                      </p>
                    </div>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-orange-50 text-[#ff4d2d] font-semibold border border-orange-100">
                      {assignment.status || "Broadcasted"}
                    </span>
                  </div>

                  <div className="bg-[#fff9f6] p-3 rounded-xl text-xs text-gray-700 flex flex-col gap-1">
                    <span className="font-bold text-gray-800">
                      Delivery Address:
                    </span>
                    <p className="leading-relaxed text-gray-600">
                      {assignment.deliveryAddress?.text ||
                        "Address not provided"}
                    </p>
                  </div>

                  {assignment.items && assignment.items.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-gray-800">
                        Items:
                      </span>
                      <div className="border border-gray-100 rounded-xl divide-y divide-gray-50 px-3">
                        {assignment.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="py-2 flex justify-between items-center text-xs text-gray-700"
                          >
                            <span>
                              {item.name}{" "}
                              <span className="text-gray-400 font-normal">
                                × {item.quantity}
                              </span>
                            </span>
                            <span className="font-semibold text-gray-900">
                              ₹{(item.price || 0) * (item.quantity || 1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-50 flex items-center justify-between gap-3">
                    <div className="pl-1">
                      <p className="text-[11px] text-gray-400">Total Bill</p>
                      <p className="font-extrabold text-base text-gray-900">
                        ₹{totalAmount || 0}
                      </p>
                    </div>
                    <button
                      className="flex-1 py-2.5 bg-[#ff4d2d] hover:bg-[#e03e1f] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                      onClick={() => acceptAssignment(targetId)}
                    >
                      Accept Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* OTP Modal */}
      {showOtpBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-orange-100 p-6 flex flex-col gap-4 relative">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  Confirm Delivery
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Ask the customer for the verification OTP.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowOtpBox(false);
                  setOtpError(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleVerifyDeliveryOtp}
              className="flex flex-col gap-4"
            >
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  autoFocus
                  className="w-full text-center text-2xl font-bold tracking-widest py-3 border border-gray-200 rounded-xl focus:border-[#ff4d2d] focus:ring-2 focus:ring-orange-100 outline-none text-gray-900 placeholder:text-gray-300 placeholder:text-base placeholder:font-normal"
                />
                {otpError && (
                  <p className="text-xs text-red-500 mt-1.5 text-center font-medium">
                    {otpError}
                  </p>
                )}
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpBox(false);
                    setOtpError(null);
                  }}
                  className="flex-1 py-2.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!otp.trim() || verifyingOtp}
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-[#ff4d2d] hover:bg-[#e03e1f] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {verifyingOtp ? "Verifying..." : "Verify & Complete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryBoyDashBoard;
