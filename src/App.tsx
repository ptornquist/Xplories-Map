import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "./styles.css";

// ✅ Set your Mapbox access token here
mapboxgl.accessToken =
  "pk.eyJ1IjoicHRvcm5xdWlzdCIsImEiOiJjbTlzdHRhNDIwMjk5MmxzZDN0cHU1cGZuIn0.eija5tq3j-2wDB9NN651dg"; // Replace this

type StopData = {
  stop_name: string;
  latitude: number;
  longitude: number;
  stop_image_url: string;
  order: number;
};

export default function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [stops, setStops] = useState<StopData[]>([]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    const walkId = urlParams.get("walk_id");

    if (!walkId) {
      console.error("❌ No walk_id in URL");
      return;
    }

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [18.0686, 59.3293], // Default: Stockholm
      zoom: 2,
    });

    map.current = mapInstance;

    mapInstance.on("load", async () => {
      try {
        const response = await fetch(
          `https://x66j-cuqg-y5uh.f2.xano.io/api:lU0ifxVo/stop_translations?walk_id=${walkId}`
        );
        const data: StopData[] = await response.json();

        console.log("✅ Stops fetched:", data);
        setStops(data);

        if (data.length === 0) {
          console.warn("⚠️ No stops returned. Showing fallback.");
          mapInstance.setCenter([18.0686, 59.3293]);
          mapInstance.setZoom(14);
          return;
        }

        // Fit map to bounds of stops
        const bounds = new mapboxgl.LngLatBounds();
        data.forEach((stop) => {
          bounds.extend([stop.longitude, stop.latitude]);
        });

        mapInstance.fitBounds(bounds, { padding: 50 });

        // Add markers
        data.forEach((stop) => {
          new mapboxgl.Marker()
            .setLngLat([stop.longitude, stop.latitude])
            .setPopup(
              new mapboxgl.Popup().setHTML(`<strong>${stop.stop_name}</strong>`)
            )
            .addTo(mapInstance);
        });
      } catch (error) {
        console.error("❌ Failed to fetch or render stops:", error);
        mapInstance.setCenter([18.0686, 59.3293]);
        mapInstance.setZoom(14);
      }
    });
  }, []);

  return (
    <div>
      <h1>Xplories Map</h1>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
