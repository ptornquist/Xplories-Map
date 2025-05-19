import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "./styles.css";

// ✅ Set your Mapbox access token
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
  const [containerReady, setContainerReady] = useState(false);

  // ✅ Detect container mount
  useEffect(() => {
    if (mapContainer.current) setContainerReady(true);
  }, []);

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
          `https://x66j-cuqq-y5uh.f2.xano.io/api:lU0ifxVo/stop_translations?walk_id=${walkId}`
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

  // ✅ Initialize map
  useEffect(() => {
    if (!containerReady || !stops.length || map.current) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [18.0686, 59.3293],
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
  }, [containerReady, stops]);

  return <div ref={mapContainer} className="map-container" />;
}
