import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "./styles.css";

// 🔐 Use your own Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoicHRvcm5xdWlzdCIsImEiOiJjbTlzdHRhNDIwMjk5MmxzZDN0cHU1cGZuIn0.eija5tq3j-2wDB9NN651dg";

// Define stop structure
type StopData = {
  stop_name: string;
  latitude: number;
  longitude: number;
};

export default function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [stops, setStops] = useState<StopData[]>([]);

  // Replace with your actual walk_id
  const walkId = 4611;

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [18.06324, 59.334591], // Stockholm
      zoom: 12,
    });

    map.current = mapInstance;

    mapInstance.on("load", () => {
      console.log("🗺️ Map loaded. Fetching stops...");

      // Fetch from Xano API
      fetch(
        `https://x66j-cuug-y5uh.f2.xano.io/api:lu0ifxVo/stop_translations?walk_id=${walkId}`
      )
        .then((res) => res.json())
        .then((data) => {
          console.log("✅ Stops loaded:", data);
          setStops(data);

          // Add markers
          data.forEach((stop: StopData) => {
            new mapboxgl.Marker()
              .setLngLat([stop.longitude, stop.latitude])
              .setPopup(new mapboxgl.Popup().setText(stop.stop_name))
              .addTo(mapInstance);
          });
        })
        .catch((err) => console.error("❌ Failed to load stops:", err));
    });
  }, []);

  return (
    <div>
      <h2>Xplories Map Test</h2>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
