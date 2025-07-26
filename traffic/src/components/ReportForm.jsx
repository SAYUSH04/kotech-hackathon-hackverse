import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const issueTypes = ["Block", "Accident", "Pothole", "Other"];

export default function ReportForm() {
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [place, setPlace] = useState("");
  const [level, setLevel] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const tt = window.tt;

    const map = tt.map({
      key: "w2XxLALNZjSqMPhRzjNBlXB0NsG92vrf",
      container: "map",
      center: [75.989931, 10.998207],
      zoom: 15,
    });

    mapRef.current = map;

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      setCoords({ lat, lng });

      // Remove existing marker if present
      if (markerRef.current) {
        markerRef.current.remove();
      }

      const newMarker = new tt.Marker().setLngLat([lng, lat]).addTo(map);
      markerRef.current = newMarker;
    });

    return () => map.remove();
  }, []);

  const handleLocationClick = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setCoords({ lat: latitude, lng: longitude });

      mapRef.current.flyTo({ center: [longitude, latitude], zoom: 16 });

      // Remove existing marker if present
      if (markerRef.current) {
        markerRef.current.remove();
      }

      const newMarker = new window.tt.Marker()
        .setLngLat([longitude, latitude])
        .addTo(mapRef.current);
      markerRef.current = newMarker;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!issueType || !coords.lat || !coords.lng) {
      alert("Please select issue and location.");
      return;
    }

    try {
      const postData = {
        issue_type: issueType,
        latitude: coords.lat,
        longitude: coords.lng,
      };

      if (issueType === "Block") {
        postData.location = place;
        postData.level = level;
      } else {
        postData.description = description;
      }
      console.log(postData);

      await axios.post("http://localhost:8000/api/reports/", postData);

      alert("Issue reported successfully!");
      setIssueType("");
      setPlace("");
      setLevel("");
      setDescription("");
      setCoords({ lat: null, lng: null });
    } catch (err) {
      console.error(err);
      alert("Error submitting report.");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    setImagePreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/analyze-image/",
        formData
      );
      setLevel(res.data.congestion_level);
    } catch (err) {
      console.error("Image analysis failed:", err);
      alert("Failed to analyze image.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>🚧 Report Traffic Issue</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ fontSize: 18, marginRight: 8 }}>Issue Type:</label>
        {/* <br /> */}
        <select
          style={{
            padding: "6px",
          }}
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
          required
        >
          <option value="">Select an issue</option>
          {issueTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <br />
        <br />

        {issueType === "Block" ? (
          <>
            <label>Place Name:</label>
            <br />
            <input
              style={{
                outline: "none",
                border: "2px solid #111",
                padding: 10,
                borderRadius: 6,
                marginLeft: "10px",
              }}
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              required
            />
            <br />
            <br />

            <label>Upload Image for Congestion Analysis:</label>
            <br />
            <input
              style={{
                outline: "none",
                border: "2px solid #111",
                padding: 10,
                borderRadius: 6,
              }}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              required
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Selected"
                style={{
                  width: "100%",
                  maxHeight: "300px",
                  marginTop: "10px",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
              />
            )}

            <br />
            {level && (
              <>
                <p>
                  🧠 Detected Congestion Level: <strong>{level}</strong>
                </p>
                <input type="hidden" value={level} />
              </>
            )}
            <br />

            <br />
          </>
        ) : (
          <>
            <label style={{ marginBottom: 10, fontSize: 18 }}>
              Description (optional):
            </label>
            <br />
            <textarea
              style={{
                outline: "none",
                border: "2px solid #111",
                padding: 10,
                borderRadius: 6,
                marginTop: 10
              }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            />
            <br />
            <br />
          </>
        )}

        <br />
        <br />

        <button
          style={{
            padding: " 12px 10px 12px 6px",
            background: "#07783bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            marginLeft: "10px",
          }}
          type="button"
          onClick={handleLocationClick}
        >
          📍 Use My Location
        </button>
        <br />
        <br />

        <div
          id="map"
          style={{
            height: "400px",
            marginBottom: "10px",
            borderRadius: "10px",
          }}
        ></div>

        <button style={{
          width: 200,
            padding: " 12px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            marginLeft: "10px",
            margin:"auto",
            position: "relative",
            left: "32%"
          }} type="submit">Submit Report</button>
      </form>
    </div>
  );
}
