import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./styles.css";

// Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoicHRvcm5xdWlzdCIsImEiOiJjbTlzdHRhNDIwMjk5MmxzZDN0cHU1cGZuIn0.eija5tq3j-2wDB9NN651dg";

type StopData = {
  stop_name: string;
  latitude: number;
  longitude: number;
};

export default function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [stops, setStops] = useState<StopData[]>([]);

  // Fetch stops from API
  useEffect(() => {
    const fetchStops = async () => {
      const walkId = new URLSearchParams(window.location.search).get("walk_id");
      if (!walkId) {
        console.error("❌ Missing walk_id in URL");
        return;
      }

      try {
        const response = await fetch(
          `https://x66j-cuqg-y5uh.f2.xano.io/api:lU0ifxVo/stop_translations?walk_id=${walkId}`
        );
        const data = await response.json();
        console.log("✅ Fetched stops:", data);
        setStops(data);
      } catch (error) {
        console.error("❌ Failed to fetch stops:", error);
      }
    };

    fetchStops();
  }, []);

  // Initialize map after stops loaded
  useEffect(() => {
    if (!stops.length || map.current || !mapContainer.current) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      zoom: 13,
    });

    map.current = mapInstance;

    mapInstance.on("load", () => {
      const bounds = new mapboxgl.LngLatBounds();

      stops.forEach(({ latitude, longitude, stop_name }) => {
        // Create marker
        const marker = new mapboxgl.Marker({ anchor: "bottom" })
          .setLngLat([longitude, latitude])
          .addTo(mapInstance);

        // Create popup for the marker
        const popup = new mapboxgl.Popup({ offset: 25 }).setText(stop_name);

        // Attach popup to marker on click
        marker.getElement().addEventListener("click", () => {
          popup.addTo(mapInstance).setLngLat([longitude, latitude]);
        });

        // Extend map bounds
        bounds.extend([longitude, latitude]);
      });

      if (!bounds.isEmpty()) {
        mapInstance.fitBounds(bounds, { padding: 60 });
      }
    });

    return () => {
      mapInstance.remove(); // Cleanup on unmount or stops change
      map.current = null;
    };
  }, [stops]);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100vw", height: "100vh" }}
      id="map"
    />
  );
}
