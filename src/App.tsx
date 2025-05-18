import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "./styles.css";

// 🔐 Mapbox token
mapboxgl.accessToken = "pk.eyJ1IjoicHRvcm5xdWlzdCIsImEiOiJjbTIzdHRhRHN..."; // Replace with your full key

// 🧱 Type definition
type StopData = {
  stop_name: string;
  latitude: number;
  longitude: number;
};

export default function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [stops, setStops] = useState<StopData[]>([]);

  // ⬇️ Set walk ID manually or read from URL
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

    mapInstance.on("load", async () => {
      console.log("🗺️ Map loaded");

      try {
        const response = await fetch(
          `https://https://x66j-cuqg-y5uh.f2.xano.io/api:lU0ifxVo/stop_translations?walk_id=${walkId}`
        );
        const data = await response.json();
        setStops(data);

        // 📍 Add markers
        data.forEach((stop: StopData) => {
          new mapboxgl.Marker()
            .setLngLat([stop.longitude, stop.latitude])
            .setPopup(new mapboxgl.Popup().setText(stop.stop_name))
            .addTo(mapInstance);
        });
      } catch (err) {
        console.error("❌ Error fetching stops", err);
      }
    });
  }, [walkId]);

  return (
    <div>
      <h2>Xplories Map Test</h2>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
