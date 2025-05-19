import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./styles.css";

// ✅ Your Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoicHRvcm5xdWlzdCIsImEiOiJjbTlzdHRhNDIwMjk5MmxzZDN0cHU1cGZuIn0.eija5tq3j-2wDB9NN651dg";

type StopData = {
  stop_name: string;
  latitude: number;
  longitude: number;
};

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [stops, setStops] = useState<StopData[]>([]);

  // ✅ Fetch stops from Xano
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

  // ✅ Initialize map and render pins when stops are ready
  useEffect(() => {
    if (!stops.length || map.current || !mapContainer.current) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current as HTMLElement,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [18.0686, 59.3293], // Default to Stockholm
      zoom: 13,
    });

    map.current = mapInstance;

    mapInstance.on("load", () => {
      const bounds = new mapboxgl.LngLatBounds();

      stops.forEach(({ latitude, longitude }) => {
        new mapboxgl.Marker({ anchor: "bottom" })
          .setLngLat([longitude, latitude])
          .addTo(mapInstance);
        bounds.extend([longitude, latitude]);
      });

      if (!bounds.isEmpty()) {
        mapInstance.fitBounds(bounds, { padding: 60 });
      }
    });
  }, [stops]);

  return <div ref={mapContainer} className="map-container" />;
}
