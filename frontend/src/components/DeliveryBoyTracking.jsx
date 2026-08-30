import React, { useEffect, useRef } from "react";
import scooter from "../assets/scooter.png";
import home from "../assets/home.png";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

// Custom Leaflet Icons
const deliveryBoyIcon = new L.Icon({
  iconUrl: scooter,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const customerIcon = new L.Icon({
  iconUrl: home,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Helper component to auto-zoom and center both markers
const AutoFitBounds = ({ path }) => {
  const map = useMap();

  useEffect(() => {
    if (path.length === 2 && path[0][0] && path[1][0]) {
      const bounds = L.latLngBounds(path);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [map, path]);

  return null;
};

const DeliveryBoyTracking = ({ data }) => {
  const deliveryBoyLat = data?.deliveryBoyLocation?.lat;
  const deliveryBoyLon = data?.deliveryBoyLocation?.lon;
  const customerLat = data?.customerLocation?.lat;
  const customerLon = data?.customerLocation?.lon;

  const hasShownMissingToast = useRef(false);
  const hasShownLiveToast = useRef(false);

  const areCoordsValid =
    deliveryBoyLat && deliveryBoyLon && customerLat && customerLon;

  useEffect(() => {
    if (!areCoordsValid && !hasShownMissingToast.current) {
      toast.error("Live tracking coordinates are unavailable for this route.", {
        id: "tracking-unavailable",
      });
      hasShownMissingToast.current = true;
    } else if (areCoordsValid && !hasShownLiveToast.current) {
      toast.success("Live route loaded successfully!", {
        id: "tracking-loaded",
      });
      hasShownLiveToast.current = true;
    }
  }, [areCoordsValid]);


  if (!areCoordsValid) {
    return (
      <div className="w-full h-80 mt-3 rounded-2xl bg-white border border-orange-100 flex items-center justify-center text-xs text-gray-400">
        Tracking coordinates unavailable
      </div>
    );
  }

  const path = [
    [deliveryBoyLat, deliveryBoyLon],
    [customerLat, customerLon],
  ];

  const center = [deliveryBoyLat, deliveryBoyLon];

  return (
    <div className="w-full h-80 mt-3 rounded-2xl overflow-hidden shadow-sm border border-orange-100 relative z-0">
      <MapContainer
        className="w-full h-full"
        center={center}
        zoom={14}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AutoFitBounds path={path} />
        <Polyline
          positions={path}
          pathOptions={{
            color: "#2563eb",
            weight: 5,
            opacity: 1,
          }}
        />

        <Marker
          position={[deliveryBoyLat, deliveryBoyLon]}
          icon={deliveryBoyIcon}
        >
          <Popup>
            <div className="text-xs font-semibold">Delivery Boy</div>
          </Popup>
        </Marker>

        <Marker position={[customerLat, customerLon]} icon={customerIcon}>
          <Popup>
            <div className="text-xs">
              <span className="font-bold">Customer</span>
              <br />
              {data?.deliveryAddress?.text}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default DeliveryBoyTracking;
