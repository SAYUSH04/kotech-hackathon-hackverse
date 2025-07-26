import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import SmartTrafficMap from "./components/SmartTrafficMap";
import RouteSuggest from "./components/RouteSuggest";
import TrafficDashboard from "./components/TrafficDashboard";
import ReportForm from "./components/ReportForm";
import AmbulanceForm from "./components/Ambulance";

function App() {
  const [routeCoords, setRouteCoords] = useState([]);
  const [congestionData, setCongestionData] = useState([]);
  const [menuopen, setmenuopen] = useState(false)

  // const [routeCoords, setRouteCoords] = useState([]); // All 3 routes
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0); // Index of selected
useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 820) {
        setmenuopen(true);
      } else {
        setmenuopen(false);
      }
    };

    handleResize(); // run once on load
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    const dummyData = [
      {
        id: 9991,
        location: "Changuvetty Junction",
        coords: [75.9904, 10.9989],
        level: "High",
      },
      {
        id: 9992,
        location: "Almas Hospital",
        coords: [75.9885, 10.9983],
        level: "Medium",
      },
      {
        id: 9993,
        location: "Kottakkal Bus Stop",
        coords: [75.9916, 10.9985],
        level: "High",
      },
      {
        id: 9994,
        location: "Kolakkadan Road",
        coords: [75.993, 10.9982],
        level: "Medium",
      },
    ];

    axios
      .get("http://localhost:8000/api/congestion-blocks/")
      .then((res) => {
        const combined = [...res.data, ...dummyData];
        setCongestionData(combined);
      })
      .catch((err) => {
        console.error("Failed to fetch congestion data:", err);
        // fallback to dummy data only
        setCongestionData(dummyData);
      });
  }, []);

  console.log(congestionData);

  return (
    <Router>
      <div style={{ padding: " 0 20px 20px 20px" }}>
        <div
          style={{
            display: "flex",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ width: "fit-content" }}>
            KOT<strong>TRAFFIC</strong>X. <br />{" "}
            <span style={{ fontSize: "16px" }}>Smart Traffic Monitor</span>{" "}
          </h2>
          <button
          className="menu-open"
          style={{
            padding: " 12px 20px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
          onClick={() => setmenuopen(!menuopen)}
          >{menuopen ? "CLOSE" : "MENU"}</button>
          <nav style={{ marginBottom: "20px", display: menuopen ? "flex" : "none" }}>
            <Link to="/" style={{ marginRight: "20px" }}>
              Home
            </Link>
            <Link to="/dashboard" style={{ marginRight: "20px" }}>
              Dashboard
            </Link>
            <Link to="/report-issue" style={{ marginRight: "20px" }}>
              Report Issue
            </Link>
            <Link to="/ambulance" style={{ marginRight: "20px" }}>
              Ambulance Alert
            </Link>
          </nav>
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <>
                <RouteSuggest
                  setSelectedRouteIndex={setSelectedRouteIndex}
                  onRouteDraw={setRouteCoords}
                />
                <SmartTrafficMap
                  selectedRouteIndex={selectedRouteIndex}
                  routeCoords={routeCoords}
                  congestionData={congestionData}
                />
              </>
            }
          />
          <Route
            path="/dashboard"
            element={<TrafficDashboard data={congestionData} />}
          />
          <Route path="/ambulance" element={<AmbulanceForm />} />
          <Route path="/report-issue" element={<ReportForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
