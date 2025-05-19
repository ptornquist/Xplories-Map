import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "./styles.css"; // Make sure this file contains .map-container CSS

// 🔐 Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoicHRvcm5xdWlzdCIsImEiOiJjbTlzdHRhNDIwMjk5MmxzZDN0cHU1cGZuIn0.eija5tq3j-2wDB9NN651dg";

// 🧱 Define structure for stop data
type StopData = {
  stop_name: string;
  latitude: number;
  longitude: number;
};

export default function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [stops, setStops] = useState<StopData[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    const walkId = urlParams.get("walk_id");

    if (!walkId) {
      console.error("❌ No walk_id in URL");
      return;
    }

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [0, 0],
      zoom: 2,
    });

    map.current = mapInstance;

    mapInstance.on("load", async () => {
      try {
        const response = await fetch(
          `https://x66j-cuqq-y5uh.f2.xano.io/api:LU0ifxVo/stop_translations?walk_id=${walkId}`
        );
        const data: StopData[] = await response.json();
        console.log("✅ Stops fetched:", data);
        setStops(data);

        if (!data || data.length === 0) {
          console.warn("⚠️ No stops returned. Showing fallback.");
          mapInstance.setCenter([18.0686, 59.3293]); // Stockholm
          mapInstance.setZoom(14);
          return;
        }

        const bounds = new mapboxgl.LngLatBounds();
        let hasValidCoords = false;

        data.forEach((stop) => {
          if (
            typeof stop.latitude === "number" &&
            typeof stop.longitude === "number"
          ) {
            console.log(
              `📍 Adding marker: ${stop.stop_name}`,
              stop.latitude,
              stop.longitude
            );
            bounds.extend([stop.longitude, stop.latitude]);
            hasValidCoords = true;

            new mapboxgl.Marker()
              .setLngLat([stop.longitude, stop.latitude])
              .setPopup(new mapboxgl.Popup().setText(stop.stop_name))
              .addTo(mapInstance);
          } else {
            console.warn("🚫 Invalid coordinates for stop:", stop);
          }
        });

        if (hasValidCoords) {
          mapInstance.fitBounds(bounds, { padding: 50 });
        } else {
          console.warn("⚠️ No valid coordinates found. Showing fallback.");
          mapInstance.setCenter([18.0686, 59.3293]);
          mapInstance.setZoom(14);
        }
      } catch (error) {
        console.error("❌ Failed to fetch or render stops:", error);
        mapInstance.setCenter([18.0686, 59.3293]);
        mapInstance.setZoom(14);
      }
    });

    return () => {
      mapInstance.remove();
    };
  }, []);

  return (
    <div>
      <h2>Xplories Map</h2>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
