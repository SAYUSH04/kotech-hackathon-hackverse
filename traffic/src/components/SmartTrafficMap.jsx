import React, { useEffect, useRef } from "react";
import axios from "axios";

const SmartTrafficMap = ({ routeCoords, congestionData, selectedRouteIndex }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    const tt = window.tt;

    const map = tt.map({
      key: "w2XxLALNZjSqMPhRzjNBlXB0NsG92vrf",
      container: "map",
      center: [75.989931, 10.998207],
      zoom: 16,
    });

    mapRef.current = map;

    const getRadius = (level) => {
      switch (level) {
        case "High":
          return 80;
        case "Medium":
          return 60;
        case "Low":
          return 40;
        default:
          return 50;
      }
    };

    const getColor = (level, type) => {
      if (type === "Pothole") return "brown";
      if (type === "Accident") return "purple";
      switch (level) {
        case "High":
          return "red";
        case "Medium":
          return "orange";
        case "Low":
          return "green";
        default:
          return "gray";
      }
    };

    map.on("load", () => {
      congestionData.forEach((spot) => {
        const popup = new tt.Popup({ offset: 30 }).setHTML(`
          <strong>${spot.location}</strong><br/>
          ${spot.level ? `Congestion: <span style="color:${getColor(spot.level, spot.type)}">${spot.level}</span>` : ''}
        `);

        const markerElement = document.createElement("div");
        markerElement.style.backgroundColor = getColor(spot.level, spot.type);
        markerElement.style.width = "24px";
        markerElement.style.height = "24px";
        markerElement.style.borderRadius = "50%";
        markerElement.style.border = "2px solid white";
        markerElement.style.color = "white";
        markerElement.style.fontWeight = "bold";
        markerElement.style.display = "flex";
        markerElement.style.alignItems = "center";
        markerElement.style.justifyContent = "center";
        markerElement.innerText = (spot.type === "Pothole" || spot.type === "Accident") ? "!" : "";

        new tt.Marker({ element: markerElement })
          .setLngLat(spot.coords)
          .setPopup(popup)
          .addTo(map);

        map.addSource(`circle-source-${spot.id}`, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: spot.coords,
            },
          },
        });

        map.addLayer({
          id: `circle-layer-${spot.id}`,
          type: "circle",
          source: `circle-source-${spot.id}`,
          paint: {
            "circle-radius": getRadius(spot.level),
            "circle-color": getColor(spot.level, spot.type),
            "circle-opacity": 0.3,
          },
        });
      });
    });

    return () => map.remove();
  }, [congestionData]);

useEffect(() => {
  const map = mapRef.current;
  const tt = window.tt;

  if (!map || !routeCoords || routeCoords.length === 0) return;

  // 🧹 Clean up old route layers
  for (let i = 0; i < 3; i++) {
    const id = `route-${i}`;
    if (map.getLayer(id)) map.removeLayer(id);
    if (map.getSource(id)) map.removeSource(id);
  }

  // 🎯 Only draw the selected route
  const coords = routeCoords[selectedRouteIndex];
  if (!coords) return;

  const color = selectedRouteIndex === 0 ? "#007bff" : selectedRouteIndex === 1 ? "orange" : "green";

  const geojson = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: coords,
    },
  };

  const id = `route-${selectedRouteIndex}`;

  map.addSource(id, {
    type: "geojson",
    data: geojson,
  });

  map.addLayer({
    id,
    type: "line",
    source: id,
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": color,
      "line-width": 5,
    },
  });
}, [routeCoords, selectedRouteIndex]);


  const addAlertMarker = (map, item) => {
  const markerEl = document.createElement("div");
  markerEl.style.width = "28px";
  markerEl.style.height = "28px";
  markerEl.style.borderRadius = "50%";
  markerEl.style.backgroundColor = item.issue_type === "Accident" ? "red" : "#8B4513"; 
  markerEl.style.color = "white";
  markerEl.style.display = "flex";
  markerEl.style.justifyContent = "center";
  markerEl.style.alignItems = "center";
  markerEl.style.fontWeight = "bold";
  markerEl.style.fontSize = "18px";
  markerEl.innerText = "!";

  const popup = new window.tt.Popup({ offset: 30 }).setHTML(`
    <strong>${item.issue_type}</strong><br/>
    ${item.description || "No description"}
  `);

  new window.tt.Marker({ element: markerEl })
    .setLngLat([item.longitude, item.latitude])
    .setPopup(popup)
    .addTo(map);
};

useEffect(() => {
  const fetchAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/all-issues/");
      const alerts = res.data.filter(item =>
        item.issue_type === "Pothole" || item.issue_type === "Accident"
      );
      alerts.forEach(item => addAlertMarker(mapRef.current, item));
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    }
  };

  const map = mapRef.current;
  if (map) {
    map.on("load", fetchAlerts);
  }
}, []);

useEffect(() => {
  const fetchAmbulanceAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/ambulance-alerts/");
      const alerts = res.data;

      for (const alert of alerts) {
        const apiKey = "w2XxLALNZjSqMPhRzjNBlXB0NsG92vrf";

        // ✅ Fix: Correct lat/lng order for TomTom API
        const start = [alert.from_lng, alert.from_lat];
        const end = [alert.to_lng, alert.to_lat];

        const response = await axios.get(
          `https://api.tomtom.com/routing/1/calculateRoute/${start[0]},${start[1]}:${end[0]},${end[1]}/json`,
          {
            params: {
              key: apiKey,
              routeType: "shortest",
              traffic: false,
            },
          }
        );

        const points = response.data.routes[0].legs[0].points.map((p) => [
          p.longitude,
          p.latitude,
        ]);

        const map = mapRef.current;
        if (!map) return;

        const routeId = `ambulance-route-${alert.id}`;

        if (map.getLayer(routeId)) map.removeLayer(routeId);
        if (map.getSource(routeId)) map.removeSource(routeId);

        map.addSource(routeId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: points,
            },
          },
        });

        map.addLayer({
          id: routeId,
          type: "line",
          source: routeId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "red",
            "line-dasharray": [2, 2],
            "line-width": 4,
          },
        });
      }
    } catch (err) {
      console.error("Ambulance render error:", err);
    }
  };

  const map = mapRef.current;
  if (map && map.isStyleLoaded()) {
    fetchAmbulanceAlerts();
  } else {
    map?.on("load", fetchAmbulanceAlerts);
  }
}, []);

  return (
    <div>
      <div
        id="map"
        style={{ height: "600px", width: "100%", borderRadius: "10px" }}
      ></div>
    </div>
  );
};

export default SmartTrafficMap;
