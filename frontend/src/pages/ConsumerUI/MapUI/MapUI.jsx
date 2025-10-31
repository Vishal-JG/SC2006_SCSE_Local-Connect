import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "./MapUI.css";
import { FaArrowLeft, FaCar, FaTrashAlt, FaTruck } from "react-icons/fa";
import service_marker from "../../../assets/service_marker.png";
import user_marker from "../../../assets/user_marker.png";
import carpark_marker from "../../../assets/carpark_marker.jpg";
import waste_marker from "../../../assets/carpark_marker.jpg"; 
import camera_icon from "../../../assets/camera_icon.png"; 
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import RoutingControl from "../../../components/RoutingControl";
import BookingOverlay from "../BookingUI/BookingOverlay";
import {jwtDecode} from "jwt-decode";
const DEFAULT_LOCATION = { lat: 1.3521, lng: 103.8198 };

const serviceIcon = new L.Icon({ iconUrl: service_marker, iconSize: [40, 40] });
const carparkIcon = new L.Icon({ iconUrl: carpark_marker, iconSize: [38, 38] });
const userIcon = new L.Icon({ iconUrl: user_marker, iconSize: [35, 35]});
const wasteIcon = new L.Icon({ iconUrl: waste_marker, iconSize: [38, 38] });
const deliveryIcon  = new L.Icon({ iconUrl: camera_icon, iconSize: [20, 20] }); 
const MapUI = () => {
  const { type, id } = useParams();
  console.log("Service Type:", type);
  const navigate = useNavigate();

  const [serviceLocation, setServiceLocation] = useState(null);
  const [serviceType, setServiceType] = useState(type ? type.toLowerCase() : "");
  const [userCoor, setUserCoor] = useState(null);
  const [locationStatus, setLocationStatus] = useState("Locating...");

  const [showCarparks, setShowCarparks] = useState(false);
  const [carparks, setCarparks] = useState([]);
  const [filteredCarparks, setFilteredCarparks] = useState([]);
  const [selectedInfo, setSelectedInfo] = useState(null);

  const [showWaste, setShowWaste] = useState(false);
  const [wasteLocations, setWasteLocations] = useState([]);

  const [showDelivery, setShowDelivery] = useState(false);
  const [deliveryPoints, setDeliveryPoints] = useState([]);

  const [showRoute, setShowRoute] = useState(false);

  const [listingId, setListingId] = useState(null);

  const [showBooking, setShowBooking] = useState(false);
  const token = localStorage.getItem("token");
  let userId = null;

  //user auth 
  if (token) {
    const decoded = jwtDecode(token);
    userId = decoded.user_id;
  }
  const handleBookNow = () => {
    if (!token) {
      alert("Please log in to make a booking");
      navigate("/login");
      return;
    }
    setShowBooking(true);
  };


  useEffect(() => {
    if (showDelivery && serviceLocation && userCoor) {
      axios
        .get("https://api.data.gov.sg/v1/transport/traffic-images")
        .then((res) => {
          const items = res.data.items?.[0]?.cameras || [];

          // helper: compute distance (meters) between two lat/lng points
          const haversine = (lat1, lon1, lat2, lon2) => {
            const R = 6371000;
            const dLat = ((lat2 - lat1) * Math.PI) / 180;
            const dLon = ((lon2 - lon1) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) ** 2 +
              Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) ** 2;
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          };

          // helper: shortest distance from a point to the straight line between user and service
          const distanceToLine = (p, a, b) => {
            const toRad = (deg) => (deg * Math.PI) / 180;
            const lat1 = toRad(a.lat);
            const lon1 = toRad(a.lng);
            const lat2 = toRad(b.lat);
            const lon2 = toRad(b.lng);
            const lat3 = toRad(p.lat);
            const lon3 = toRad(p.lng);

            // Vector projection math
            const A = { x: Math.cos(lat1) * Math.cos(lon1), y: Math.cos(lat1) * Math.sin(lon1), z: Math.sin(lat1) };
            const B = { x: Math.cos(lat2) * Math.cos(lon2), y: Math.cos(lat2) * Math.sin(lon2), z: Math.sin(lat2) };
            const P = { x: Math.cos(lat3) * Math.cos(lon3), y: Math.cos(lat3) * Math.sin(lon3), z: Math.sin(lat3) };

            const AB = { x: B.x - A.x, y: B.y - A.y, z: B.z - A.z };
            const AP = { x: P.x - A.x, y: P.y - A.y, z: P.z - A.z };
            const t = Math.max(0, Math.min(1, (AP.x * AB.x + AP.y * AB.y + AP.z * AB.z) / (AB.x ** 2 + AB.y ** 2 + AB.z ** 2)));
            const closest = { x: A.x + AB.x * t, y: A.y + AB.y * t, z: A.z + AB.z * t };

            const d = haversine(
              (Math.asin(P.z) * 180) / Math.PI,
              Math.atan2(P.y, P.x) * 180 / Math.PI,
              (Math.asin(closest.z) * 180) / Math.PI,
              Math.atan2(closest.y, closest.x) * 180 / Math.PI
            );

            return d;
          };

          // filter only those roughly along the path (within 500 m of the line)
          const filtered = items.filter((cam) => {
            const p = { lat: cam.location.latitude, lng: cam.location.longitude };
            const dist = distanceToLine(p, userCoor, serviceLocation);
            return dist <= 500; // within 500 m corridor
          });

          const points = filtered.map((cam) => ({
            id: cam.camera_id,
            name: `Delivery Point ${cam.camera_id}`,
            lat: cam.location.latitude,
            lng: cam.location.longitude,
            image: cam.image,
          }));

          setDeliveryPoints(points);
        })
        .catch(() => setDeliveryPoints([]));
    }
  }, [showDelivery, serviceLocation, userCoor]);


  // Fetch service details
  useEffect(() => {
    fetch(`http://localhost:5000/api/services/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setListingId(data.listing_id);
        if (data && data.latitude && data.longitude) {
          setServiceLocation({ lat: data.latitude, lng: data.longitude, name: data.title });
          setServiceType((data.type || "").toLowerCase());
        } else {
          setServiceLocation(DEFAULT_LOCATION);
          setServiceType("");
        }
      })
      .catch(() => {
        setServiceLocation(DEFAULT_LOCATION);
        setServiceType("");
      });
  }, [id]);

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation not supported by browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setUserCoor({ lat: 1.3521, lng: 103.8198 }); // fallback location
        setLocationStatus("Location detected");
      },
      () => setLocationStatus("Unable to detect location.")
    );
  }, []);

  // Fetch carparks
  useEffect(() => {
    if (showCarparks) {
      axios
        .get("http://localhost:5000/api/govsg/hdb-carpark-info")
        .then(res => {
          const lots = res.data
            .map(c => {
              if (!c.lat || !c.lng) return null;
              return { id: c.car_park_no, name: c.address || "Carpark", lat: parseFloat(c.lat), lng: parseFloat(c.lng) };
            })
            .filter(Boolean);
          setCarparks(lots);
        })
        .catch(() => setCarparks([]));
    }
  }, [showCarparks]);

  // Filter carparks by radius
  useEffect(() => {
    if (!userCoor) return;
    const radiusMeters = 2000;
    if (showCarparks) {
      const filtered = carparks.filter((cp) => {
        const R = 6371000;
        const dLat = ((cp.lat - userCoor.lat) * Math.PI) / 180;
        const dLng = ((cp.lng - userCoor.lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((userCoor.lat * Math.PI) / 180) *
            Math.cos((cp.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c <= radiusMeters;
      });
      setFilteredCarparks(filtered);
    } else {
      setFilteredCarparks([]);
    }
  }, [showCarparks, carparks, userCoor]);

  // Fetch waste collection locations
  useEffect(() => {
    if (showWaste) {
      axios
        .get("http://localhost:5000/api/govsg/general-waste")
        .then(res => {
          const locations = res.data.map((w) => ({
            id: w.id,
            name: w.address || "Waste Point",
            lat: parseFloat(w.lat),
            lng: parseFloat(w.lng),
          }));
          setWasteLocations(locations);
        })
        .catch(() => setWasteLocations([]));
    }
  }, [showWaste]);

  const fetchAvailability = async (car_park_no) => {
    try {
      const res = await axios.get("https://api.data.gov.sg/v1/transport/carpark-availability");
      const lot = res.data.items[0].carpark_data.find(i => i.carpark_number === car_park_no);
      setSelectedInfo(
        lot ? { car_park_no, available: lot.carpark_info[0].lots_available, total: lot.carpark_info[0].total_lots } :
        { car_park_no, error: "No availability found." }
      );
    } catch {
      setSelectedInfo({ car_park_no, error: "Failed to fetch availability" });
    }
  };

  if (!serviceLocation) return <p>Loading...</p>;

  const showCarparkToggle = type == "auto mechanic";
  const showWasteToggle = type == "home cleaning";
  const showCameraToggle = type == "package delivery";

  return (
    <>
    <div className="mapui-container">
      <button onClick={() => navigate("/service")} className="back-btn">
        <FaArrowLeft /> Back
      </button>

      <div className="mapui-header">
        <h2>Find Us Easily</h2>
        <span>{locationStatus}</span>
      </div>

      <div className="mapui-frame">
        {showCarparkToggle && (
          <button
            className={`carpark-toggle side ${showCarparks ? "active" : ""}`}
            onClick={() => setShowCarparks((p) => !p)}
          >
            <FaCar /> {showCarparks ? "Hide Carparks" : "Show Nearby Carparks"}
          </button>
        )}

        {showWasteToggle && (
          <button
            className={`carpark-toggle side ${showWaste ? "active" : ""}`}
            onClick={() => setShowWaste((p) => !p)}
          >
            <FaTrashAlt /> {showWaste ? "Hide Waste Collection" : "Show Waste Collection"}
          </button>
        )}
        {showCameraToggle && (
        <button
          className={`carpark-toggle side ${showDelivery ? "active" : ""}`}
          onClick={() => {setShowDelivery((p) => !p); setShowRoute((r) => !r);}
          }
        >
          <FaTruck /> {showDelivery ? "Hide Deliveries" : "Show Delivery Points"}
        </button>
        )}
        {serviceLocation?.lat && serviceLocation?.lng && (
          <MapContainer
            center={[serviceLocation.lat, serviceLocation.lng]}
            zoom={14}
            style={{ height: "500px", width: "100%", borderRadius: "18px" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={[serviceLocation.lat, serviceLocation.lng]} icon={serviceIcon}>
              <Popup>
                <b>{serviceLocation.name}</b>
                <p>Service Location</p>
              </Popup>
            </Marker>

            {userCoor && (
              <>
                <Marker position={[userCoor.lat, userCoor.lng]} icon={userIcon}>
                  <Popup>You are here</Popup>
                </Marker>
                {showCarparks && <Circle center={[userCoor.lat, userCoor.lng]} radius={2000} color="red" />}
              </>
            )}


            {showRoute && userCoor && serviceLocation && (
              <RoutingControl from={serviceLocation} to={userCoor} />
            )}

            {showCarparks &&
              filteredCarparks.map((c) => (
                <Marker
                  key={c.id}
                  position={[c.lat, c.lng]}
                  icon={carparkIcon}
                  eventHandlers={{ click: () => fetchAvailability(c.id) }}
                >
                  <Popup>
                    <b>{c.name}</b>
                    {selectedInfo && selectedInfo.car_park_no === c.id ? (
                      selectedInfo.error ? <p>{selectedInfo.error}</p> : <>
                        <p>Available: {selectedInfo.available}</p>
                        <p>Total: {selectedInfo.total}</p>
                      </>
                    ) : <i>Click marker for availability</i>}
                  </Popup>
                </Marker>
              ))}

            {showWaste &&
              wasteLocations.map((w) => (
                <Marker key={w.id} position={[w.lat, w.lng]} icon={wasteIcon}>
                  <Popup>
                    <b>{w.name}</b>
                    <p>Waste Collection Point</p>
                  </Popup>
                </Marker>
              ))}

            {showDelivery &&
            deliveryPoints.map((d) => (
              <Marker key={d.id} position={[d.lat, d.lng]} icon={deliveryIcon}>
                <Popup>
                  <b>{d.name}</b>
                  <p>Package Delivery Location</p>
                  {d.image && (
                    <img
                      src={d.image}
                      alt="Camera"
                      style={{ width: "100px", borderRadius: "8px", marginTop: "5px" }}
                    />
                  )}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      <div className="mapui-hint">
        <p>Red: Radius | Blue: Service | Green: Carparks, Waste</p>
      </div>

      <button onClick={handleBookNow} className="book-btn bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">Book now!</button>
    </div>
      <BookingOverlay
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
        listingId={listingId}
        userId={userId}
      />
    </>
  );
};

export default MapUI;
