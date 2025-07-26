// AmbulanceAlertForm.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { getCoordinatesFromPlace } from "../assets/geodata";

export default function AmbulanceAlertForm({ onRouteDraw }) {
  const [fromPlace, setFromPlace] = useState("");
  const [toPlace, setToPlace] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const tt = window.tt;
    if (!tt) return;

    const map = tt.map({
      key: "w2XxLALNZjSqMPhRzjNBlXB0NsG92vrf",
      container: "map",
      center: [75.989931, 10.998207],
      zoom: 15,
    });

    mapRef.current = map;

    return () => map.remove();
  }, []);

  const drawRoute = (points) => {
    const map = mapRef.current;
    if (!map) return;

    // Remove previous route
    if (map.getLayer("ambulance-route")) map.removeLayer("ambulance-route");
    if (map.getSource("ambulance-route")) map.removeSource("ambulance-route");

    // Add route source
    map.addSource("ambulance-route", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: points,
        },
      },
    });

    // Red-white dashed line
    map.addLayer({
      id: "ambulance-route",
      type: "line",
      source: "ambulance-route",
      paint: {
        "line-color": "red",
        "line-width": 5,
        "line-dasharray": [2, 2],
      },
    });
  };

  const handleSuggest = async (e) => {
    e.preventDefault();

    const from = await getCoordinatesFromPlace(fromPlace);
    const to = await getCoordinatesFromPlace(toPlace);

    if (!from || !to) {
      alert("Couldn't find one of the places.");
      return;
    }

    setFromCoords(from);
    setToCoords(to);

    try {
      const apiKey = "w2XxLALNZjSqMPhRzjNBlXB0NsG92vrf";
      const response = await axios.get(
        `https://api.tomtom.com/routing/1/calculateRoute/${from[1]},${from[0]}:${to[1]},${to[0]}/json`,
        {
          params: {
            key: apiKey,
            traffic: true,
            routeType: "shortest",
          },
        }
      );

      const points = response.data.routes[0].legs[0].points.map((p) => [
        p.longitude,
        p.latitude,
      ]);

      setRouteCoords(points);
      drawRoute(points); // 🎯 show red-white line
      if (onRouteDraw) onRouteDraw(points);
    } catch (err) {
      console.error("Failed to get route:", err);
      alert("Failed to suggest route.");
    }
  };

  const handleSubmit = async () => {
    if (!fromCoords || !toCoords || routeCoords.length === 0) {
      alert("Please suggest route first.");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/ambulance-alerts/", {
        from_place: fromPlace,
        to_place: toPlace,
        from_lat: fromCoords[0],
        from_lng: fromCoords[1],
        to_lat: toCoords[0],
        to_lng: toCoords[1],
        route: routeCoords, // if backend accepts this
      });

      alert("🚨 Ambulance alert submitted!");
      setFromPlace("");
      setToPlace("");
      setRouteCoords([]);
    } catch (err) {
      console.error("Error submitting alert:", err);
      alert("Failed to submit alert.");
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "auto" }}>
      <h2>🚑 Ambulance Alert</h2>
      <form onSubmit={handleSuggest}>
        <input
          style={{
            outline: "none",
            border: "2px solid #111",
            padding: 10,
            borderRadius: 6,
          }}
          value={fromPlace}
          onChange={(e) => setFromPlace(e.target.value)}
          placeholder="From (e.g. MIMS Hospital)"
          required
        />
        <input
          style={{
            outline: "none",
            border: "2px solid #111",
            padding: 10,
            borderRadius: 6,
            marginLeft: "10px",
          }}
          value={toPlace}
          onChange={(e) => setToPlace(e.target.value)}
          placeholder="To (e.g. Almas Hospital)"
          required
        />
        <button
          type="submit"
          style={{
            marginLeft: "10px",
            padding: " 12px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            marginLeft: "10px",
          }}
        >
          Suggest Route
        </button>
      </form>

      <div
        id="map"
        style={{
          height: "400px",
          marginTop: "20px",
          borderRadius: "8px",
        }}
      ></div>

      <button
        onClick={handleSubmit}
        style={{
          marginTop: "20px",
          backgroundColor: "red",
          color: "white",
          padding: "10px",
          border: "none",
          borderRadius: "5px",
          position: "relative",
          left: "35%",
        }}
      >
        Submit Ambulance Alert
      </button>
    </div>
  );
}
