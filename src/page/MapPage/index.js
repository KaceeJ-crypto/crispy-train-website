// src/page/MapPage/index.jsx
import React, { useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import peopleData from "../../public/people25.geojson";
import drugsData from "../../public/drugs25.geojson";

export default function MapPage() {
  const [layer, setLayer] = useState("none");

  return (
    <div style={{ height: "100vh" }}>
      <div style={{ padding: "10px", textAlign: "center" }}>
        <button onClick={() => setLayer("none")}>Resources</button>
        <button onClick={() => setLayer("people")}>Crimes Against People</button>
        <button onClick={() => setLayer("drugs")}>Drug Crimes</button>
      </div>

      <MapContainer center={[33.749, -84.388]} zoom={12} style={{ height: "90%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {layer === "people" && <GeoJSON data={peopleData} style={{ color: "red" }} />}
        {layer === "drugs" && <GeoJSON data={drugsData} style={{ color: "blue" }} />}
      </MapContainer>
    </div>
  );
}
