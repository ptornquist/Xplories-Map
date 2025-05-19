import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "./styles.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZXhwbG9yaWVzIiwiYSI6ImNseWk1amZmeTA0cTIycnM1aGU3dHRlcjEifQ.aPKxTw6FCHeu1sfIKM2WNg";

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
    const params = new URLSearchParams(window.location.search);
    const walk_id = params.get("walk_id") || "4611";

    const fetchStops = async () => {
      try {
        const response = await fetch(
          `https://x66j-cuqg-y5uh.f2.xano.io/api:lU0ifxVo/stop_translations?walk_id=${walk_id}`
        );
        const data: StopData[] = await response.json();
        setStops(data);
      } catch (error) {
        console.error("Failed to fetch stops:", error);
      }
    };

    fetchStops();
  }, []);

  useEffect(() => {
    if (map.current || stops.length === 0) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [18.0686, 59.3293], // fallback center
      zoom: 14,
    });

    stops.forEach((stop) => {
      new mapboxgl.Marker({ anchor: "bottom" }) // This fixes "floating" problem
        .setLngLat([stop.longitude, stop.latitude])
        .addTo(map.current!);
    });

    const bounds = new mapboxgl.LngLatBounds();
    stops.forEach((stop) => bounds.extend([stop.longitude, stop.latitude]));
    map.current.fitBounds(bounds, { padding: 60 });
  }, [stops]);

  return (
    <div>
      <h1>Xplories Map</h1>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
