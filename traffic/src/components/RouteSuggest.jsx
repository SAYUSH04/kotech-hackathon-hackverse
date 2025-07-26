import React, { useState } from "react";
import { getCoordinatesFromPlace } from "../assets/geodata"; // the function above
import axios from "axios";

export default function RouteSuggest({ onRouteDraw, setSelectedRouteIndex }) {
  const [fromPlace, setFromPlace] = useState("");
  const [toPlace, setToPlace] = useState("");

  const handleSuggest = async (e) => {
    e.preventDefault();

    const fromCoords = await getCoordinatesFromPlace(fromPlace);
    const toCoords = await getCoordinatesFromPlace(toPlace);

    if (!fromCoords || !toCoords) {
      alert("Couldn't find one of the places.");
      return;
    }

    try {
      const apiKey = "w2XxLALNZjSqMPhRzjNBlXB0NsG92vrf";
      const response = await axios.get(
        `https://api.tomtom.com/routing/1/calculateRoute/${fromCoords[1]},${fromCoords[0]}:${toCoords[1]},${toCoords[0]}/json`,
        {
          params: {
            key: apiKey,
            traffic: true,
            routeType: "shortest", // ➡️ Get shortest route (not fastest)
            maxAlternatives: 2, // ➕ Get multiple route suggestions
          },
        }
      );

      const allRoutes = response.data.routes.map((route) =>
        route.legs[0].points.map((p) => [p.longitude, p.latitude])
      );
      onRouteDraw(allRoutes); // pass array of routes
    } catch (err) {
      alert("Failed to get route.");
      console.error(err);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "end",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 15,
      }}
    >
      <form onSubmit={handleSuggest} style={{ marginTop: "20px" }}>
        <h3>Smart Route Suggestion</h3>
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
            width: "100px",
            padding: " 12px 6px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            marginLeft: "10px",
          }}
        >
          Suggest
        </button>
      </form>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button
          onClick={() => setSelectedRouteIndex(0)}
          style={{
            width: "150px",
            padding: " 12px 6px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Fastest Route
        </button>
        <button
          onClick={() => setSelectedRouteIndex(1)}
          style={{
            width: "150px",
            padding: " 12px 6px",
            background: "orange",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Shortest Route
        </button>
        <button
          onClick={() => setSelectedRouteIndex(2)}
          style={{
            width: "150px",
            padding: " 12px 6px",
            background: "green",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Alternative Route
        </button>
      </div>
    </div>
  );
}
