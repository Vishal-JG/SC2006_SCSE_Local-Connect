import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import './MapUI.css'
import { FaArrowLeft } from "react-icons/fa";
//need to replace with API 
const SERVICE_LOCATION = {
  lat: 1.3521,     // Replace with actual latitude
  lng: 103.8198,   // Replace with actual longitude
  name: "Elco Plumber Co."
};

const mapUrl = `https://www.onemap.gov.sg/minimap/mm.html?latLng=${SERVICE_LOCATION.lat},${SERVICE_LOCATION.lng}&zoomLevel=17&ewt=${encodeURIComponent(SERVICE_LOCATION.name)}&showPopup=true&popupWidth=200`;

const MapUI = () => {
  // state for user coor 
  const [userCoor, setUserCoor] = useState(null)
  // state for location status 
  const [locationStatus, setLocationStatus] = useState("Getting location...")
  // state for iframe loading status
  const [iframeSrc, setIframeSrc] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    if (!navigator.geolocation){
      setLocationStatus("Geolocation not supported by your browser")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoor({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      })
      setLocationStatus("Location detected.")
    },
    (err) => {
      setLocationStatus("Unable to access location. Showing only service location...")
      setUserCoor(null)
    }
    )
  }, [])
  useEffect(() => {
    if (userCoor) {
      setIframeSrc(
        `https://www.onemap.gov.sg/amm/amm.html?mapStyle=Default&zoomLevel=15` +
        `&marker=latLng:${userCoor.lat},${userCoor.lng}!icon:fa-user!colour:blue!popup:You%20are%20here` +
        `&marker=latLng:${SERVICE_LOCATION.lat},${SERVICE_LOCATION.lng}!icon:fa-star!colour:red!popup:${encodeURIComponent(SERVICE_LOCATION.name)}`
      );
    } else {
      setIframeSrc(
        `https://www.onemap.gov.sg/minimap/mm.html?latLng=${SERVICE_LOCATION.lat},${SERVICE_LOCATION.lng}&zoomLevel=17&ewt=${encodeURIComponent(SERVICE_LOCATION.name)}&showPopup=true&popupWidth=200`
      );
    }
  }, [userCoor]);
  
  const handleRecenter = () => {
    if (!userCoor) return;
    setIframeSrc(
      `https://www.onemap.gov.sg/amm/amm.html?mapStyle=Default&zoomLevel=15&latLng=${userCoor.lat},${userCoor.lng}` +
      `&marker=latLng:${userCoor.lat},${userCoor.lng}!icon:fa-user!colour:blue!popup:You%20are%20here` +
      `&marker=latLng:${SERVICE_LOCATION.lat},${SERVICE_LOCATION.lng}!icon:fa-star!colour:red!popup:${encodeURIComponent(SERVICE_LOCATION.name)}`
    );
  };
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
        <div>
          <strong>Service:</strong> {SERVICE_LOCATION.name}
        </div>
        <div>
          <strong>Your Address: </strong> 
          <span>
            {userCoor ? (
              <span>
                Lat: {userCoor.lat.toFixed(4)}, 
                Lng: {userCoor.lng.toFixed(4)}
              </span>
            ) : (
              <span>Not available</span>
            )}
          </span>
        </div>
        {userCoor && (
          <button className="recenter-btn" onClick={handleRecenter}>Recenter to My Location</button>
        )}
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
        {!iframeSrc && (
          <div className="mapui-loader">Loading map…</div>
        )}
      </div>
      <div className="mapui-hint">
        {userCoor
          ? "Both your location (blue) and the service (red) are pinned."
          : "Enable location to see your own position on the map."}
      </div>
      <button className='book-btn'>Book now!</button>
    </div>
  </>
  )
}

export default MapUI
