import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const RoutingControl = ({ from, to }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !from || !to) return;

    // Create routing control only once per from/to pair
    const routingControl = L.Routing.control({
        waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
        lineOptions: {
        styles: [{ color: "#007bff", weight: 5, opacity: 0.8 }],
        },
        createMarker: () => null, // prevents extra default markers
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: false, // no UI panel
    });

    // Add to map after render cycle
    const timer = setTimeout(() => {
        routingControl.addTo(map);

        // Hide routing panel DOM if plugin still adds it
        const panels = document.querySelectorAll(".leaflet-routing-container");
        panels.forEach((panel) => {
        panel.style.display = "none";
        });
    }, 300);

    // Cleanup
    return () => {
        clearTimeout(timer);
        if (map && routingControl) {
        try {
            map.removeControl(routingControl);
        } catch (e) {
            console.warn("RoutingControl cleanup error:", e);
        }
        }
    };
    }, [map, from, to]);
  return null;
};

export default RoutingControl;
