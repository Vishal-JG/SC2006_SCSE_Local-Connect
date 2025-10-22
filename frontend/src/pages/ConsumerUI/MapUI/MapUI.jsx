import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './MapUI.css';
import { FaArrowLeft } from "react-icons/fa";

const DEFAULT_LOCATION = { lat: 1.3521, lng: 103.8198 }; // fallback Singapore location

const MapUI = () => {
  const { id } = useParams(); // service ID
  const navigate = useNavigate();

  const [serviceLocation, setServiceLocation] = useState(null);
  const [userCoor, setUserCoor] = useState(null);
  const [locationStatus, setLocationStatus] = useState("Getting location...");
  const [iframeSrc, setIframeSrc] = useState("");

  // Fetch service details
  useEffect(() => {
    fetch(`http://localhost:5000/api/services/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data || !data.title) {
          console.log("Fetched data:", data);
          setServiceLocation(null);
          return;
        }

        setServiceLocation({
          lat: data.latitude ?? DEFAULT_LOCATION.lat,
          lng: data.longitude ?? DEFAULT_LOCATION.lng,
          name: data.title
        });
      })
      .catch(err => {
        console.error("Failed to fetch service:", err);
        setServiceLocation(null);
      });
  }, [id]);

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoor({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("Location detected.");
      },
      () => {
        setLocationStatus("Unable to access location. Showing only service location...");
        setUserCoor(null);
      }
    );
  }, []);

  // Update iframe URL
  useEffect(() => {
    if (!serviceLocation) return;

    let url = serviceLocation
      ? userCoor
        ? `https://www.onemap.gov.sg/amm/amm.html?mapStyle=Default&zoomLevel=15` +
          `&marker=latLng:${userCoor.lat},${userCoor.lng}!icon:fa-user!colour:blue!popup:You%20are%20here` +
          `&marker=latLng:${serviceLocation.lat},${serviceLocation.lng}!icon:fa-star!colour:red!popup:${encodeURIComponent(serviceLocation.name)}`
        : `https://www.onemap.gov.sg/minimap/mm.html?latLng=${serviceLocation.lat},${serviceLocation.lng}&zoomLevel=17&ewt=${encodeURIComponent(serviceLocation.name)}&showPopup=true&popupWidth=200`
      : "";

    setIframeSrc(url);
  }, [serviceLocation, userCoor]);

  const handleRecenter = () => {
  if (!userCoor || !serviceLocation) return;
    const url = `https://www.onemap.gov.sg/amm/amm.html?mapStyle=Default&zoomLevel=15` +
                `&marker=latLng:${userCoor.lat},${userCoor.lng}!icon:fa-user!colour:blue!popup:You%20are%20here` +
                `&marker=latLng:${serviceLocation.lat},${serviceLocation.lng}!icon:fa-star!colour:red!popup:${encodeURIComponent(serviceLocation.name)}` +
                `&_=${Date.now()}`;
    console.log("Recenter URL:", url);
    setIframeSrc(url);
  };

  if (!serviceLocation) return <p>Service not found or location unavailable.</p>;

  return (
    <>
      <button onClick={() => navigate("/service")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "transparent",
          border: "none",
          color: "#4a90e2",
          fontSize: "16px",
          cursor: "pointer",
        }}><FaArrowLeft /> Back</button> 

      <div className="mapui-container">
        <div className="mapui-header">
          <h2>Find Us Easily</h2>
          <span className='mapui-status'>{locationStatus}</span>
        </div>

        <div className="mapui-info">
          <div><strong>Service:</strong> {serviceLocation.name}</div>
          <div>
            <strong>My Location: </strong> 
            {userCoor ? `Lat: ${userCoor.lat.toFixed(4)}, Lng: ${userCoor.lng.toFixed(4)}` : "Not available"}
          </div>
          {userCoor && <button className="recenter-btn" onClick={handleRecenter}>Recenter to My Location</button>}
        </div>

        <div className="mapui-frame">
          <iframe
            src={iframeSrc}
            width="100%"
            height="500"
            style={{ border: 0, borderRadius: "18px" }}
            allowFullScreen
            title="OneMap Singapore with Service & User Location"
          />
          {!iframeSrc && <div className="mapui-loader">Loading map…</div>}
        </div>

        <div className="mapui-hint">
          {userCoor
            ? "Both your location (blue) and the service (red) are pinned."
            : "Enable location to see your own position on the map."}
        </div>
        <button className='book-btn'>Book now!</button>
      </div>
    </>
  );
};

export default MapUI;

