// src/AtlantaMap.js
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  LayersControl,
  LayerGroup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ICONS
const dangerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1828/1828843.png",
  iconSize: [25, 25],
});
const barIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/615/615075.png",
  iconSize: [25, 25],
});
const resourceIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
  iconSize: [25, 25],
});
const healthIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965567.png",
  iconSize: [25, 25],
});

export default function AtlantaMap() {
  const [peopleData, setPeopleData] = useState(null);
  const [drugsData, setDrugsData] = useState(null);

  // Fetch GeoJSON layers
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

  // STATIC POINTS
  const dangerAreas = [
    { name: "English Avenue / Vine City", lat: 33.753, lng: -84.423 },
    { name: "Southwest Atlanta", lat: 33.710, lng: -84.420 },
  ];

  const nightlife = [
    { name: "Midtown Nightclub", lat: 33.771, lng: -84.384 },
    { name: "Edgewood Bar", lat: 33.749, lng: -84.370 },
    { name: "The Basement", lat: 33.774, lng: -84.382 },
    { name: "MJQ Concourse", lat: 33.767, lng: -84.374 },
    { name: "Opera Nightclub", lat: 33.768, lng: -84.384 },
    { name: "Tongue & Groove", lat: 33.771, lng: -84.391 },
  ];

  const transResources = [
    { name: "Lost-n-Found Youth Center", lat: 33.772, lng: -84.380 },
    { name: "Atlanta LGBTQ Center", lat: 33.761, lng: -84.389 },
    { name: "Trans Wellness Center", lat: 33.767, lng: -84.377 },
    { name: "Pride Resource Center", lat: 33.769, lng: -84.380 },
  ];

  const healthCenters = [
    { name: "Positive Impact Health Center - Decatur", lat: 33.774, lng: -84.295 },
    { name: "Emory Trans Care", lat: 33.792, lng: -84.323 },
    { name: "Atlanta Community Health", lat: 33.754, lng: -84.386 },
    { name: "CHOA Health Center", lat: 33.772, lng: -84.383 },
    { name: "Grady Health System", lat: 33.755, lng: -84.387 },
    { name: "Open Arms Health Clinic", lat: 33.765, lng: -84.372 },
    { name: "Decatur Health Center", lat: 33.774, lng: -84.296 },
  ];

  const aaClubhouses = [
    { name: "AA Midtown Clubhouse", lat: 33.777, lng: -84.384 },
    { name: "AA Edgewood Clubhouse", lat: 33.749, lng: -84.370 },
    { name: "AA Buckhead Clubhouse", lat: 33.840, lng: -84.370 },
    { name: "AA West End Clubhouse", lat: 33.745, lng: -84.425 },
  ];

  return (
    <div className="map-wrap" style={{ height: "80vh", width: "100%" }}>
      <MapContainer center={[33.75, -84.39]} zoom={12} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <LayersControl position="topright">
          {/* Base Layers */}
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
          </LayersControl.BaseLayer>

          {/* Static Overlay Layers */}
          <LayersControl.Overlay checked name="Danger Areas">
            <LayerGroup>
              {dangerAreas.map((a, i) => (
                <Marker key={i} position={[a.lat, a.lng]} icon={dangerIcon}>
                  <Popup>⚠️ {a.name} – High crime area</Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Nightlife">
            <LayerGroup>
              {nightlife.map((n, i) => (
                <Marker key={i} position={[n.lat, n.lng]} icon={barIcon}>
                  <Popup>🍸 {n.name} – Nightlife venue</Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Trans Resources">
            <LayerGroup>
              {transResources.map((t, i) => (
                <Marker key={i} position={[t.lat, t.lng]} icon={resourceIcon}>
                  <Popup>🏳️‍🌈 {t.name} – Trans-friendly resource</Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Health Centers">
            <LayerGroup>
              {healthCenters.map((h, i) => (
                <Marker key={i} position={[h.lat, h.lng]} icon={healthIcon}>
                  <Popup>🏥 {h.name}</Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="AA Clubhouses">
            <LayerGroup>
              {aaClubhouses.map((c, i) => (
                <Marker key={i} position={[c.lat, c.lng]} icon={barIcon}>
                  <Popup>💚 {c.name}</Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          {/* GeoJSON Layers */}
          {peopleData && (
            <LayersControl.Overlay checked name="People Incidents">
              <GeoJSON
                data={peopleData}
                pointToLayer={(f, latlng) =>
                  L.circleMarker(latlng, { radius: 5, fillColor: "red", color: "darkred", weight: 1 })
                }
                onEachFeature={(f, layer) => {
                  const desc = f.properties?.description || "Incident";
                  layer.bindPopup(`🛑 ${desc}`);
                }}
              />
            </LayersControl.Overlay>
          )}

          {drugsData && (
            <LayersControl.Overlay checked name="Drug Arrests">
              <GeoJSON
                data={drugsData}
                pointToLayer={(f, latlng) =>
                  L.circleMarker(latlng, { radius: 5, fillColor: "blue", color: "darkblue", weight: 1 })
                }
                onEachFeature={(f, layer) => {
                  const desc = f.properties?.description || "Drug Arrest";
                  layer.bindPopup(`💊 ${desc}`);
                }}
              />
            </LayersControl.Overlay>
          )}
        </LayersControl>
      </MapContainer>
    </div>
  );
}
