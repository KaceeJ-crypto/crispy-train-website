import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "../../AtlantaMap.css"; // optional styling if you have custom map CSS
import "leaflet/dist/leaflet.css";

// ICONS
const dangerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1828/1828843.png",
  iconSize: [30, 30],
});
const drugIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/615/615075.png",
  iconSize: [30, 30],
});

export default function MapPage() {
  const [peopleData, setPeopleData] = useState(null);
  const [drugsData, setDrugsData] = useState(null);

  // Fetch GeoJSON data
  useEffect(() => {
    fetch("/people25.geojson")
      .then((r) => r.json())
      .then(setPeopleData)
      .catch(() => setPeopleData(null));

    fetch("/drugs25.geojson")
      .then((r) => r.json())
      .then(setDrugsData)
      .catch(() => setDrugsData(null));
  }, []);

  // Example static points
  const dangerAreas = [
    { name: "English Avenue / Vine City", lat: 33.753, lng: -84.423 },
    { name: "Southwest Atlanta", lat: 33.710, lng: -84.420 },
  ];

  return (
    <div className="map-page">
      <MapContainer
        center={[33.75, -84.39]}
        zoom={12}
        scrollWheelZoom
        style={{ height: "80vh", width: "100%" }}
      >
        {/* Base Tiles */}
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Static Danger Markers */}
        {dangerAreas.map((a, i) => (
          <Marker key={`d-${i}`} position={[a.lat, a.lng]} icon={dangerIcon}>
            <Popup>⚠️ {a.name} – High crime area</Popup>
          </Marker>
        ))}

        {/* People Data Layer */}
        {peopleData && (
          <GeoJSON
            data={peopleData}
            pointToLayer={(feature, latlng) =>
              L.circleMarker(latlng, {
                radius: 6,
                fillColor: "red",
                color: "darkred",
                weight: 1,
                fillOpacity: 0.7,
              })
            }
            onEachFeature={(feature, layer) => {
              const desc = feature.properties?.description || "Incident";
              layer.bindPopup(`🛑 ${desc}`);
            }}
          />
        )}

        {/* Drugs Data Layer */}
        {drugsData && (
          <GeoJSON
            data={drugsData}
            pointToLayer={(feature, latlng) =>
              L.circleMarker(latlng, {
                radius: 6,
                fillColor: "yellow",
                color: "orange",
                weight: 1,
                fillOpacity: 0.7,
              })
            }
            onEachFeature={(feature, layer) => {
              const desc = feature.properties?.description || "Drug Arrest";
              layer.bindPopup(`💊 ${desc}`);
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
