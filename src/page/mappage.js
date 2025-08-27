import React, { useMemo } from "react";
import AtlantaMap from "../AtlantaMap";

export default function MapPage() {
  return (
    <>
      <section className="panel">
        <h2 className="panel-title">Atlanta Safety & Nightlife Map</h2>
        <div className="map-container">
          <AtlantaMap />
        </div>
      </section>

      <CrimeStats />
    </>
  );
}

function CrimeStats() {
  const [stats, setStats] = React.useState(null);
  React.useEffect(() => {
    fetch("/people25.geojson")
      .then(r => r.json())
      .then(data => {
        const total = data.features?.length || 0;
        const byType = {};
        data.features?.forEach(f => {
          const t = f.properties?.type || "Unknown";
          byType[t] = (byType[t] || 0) + 1;
        });
        setStats({ total, byType });
      })
      .catch(() => setStats({ total: 0, byType: {} }));
  }, []);

  return (
    <section className="panel">
      <h2 className="panel-title">Crime Statistics</h2>
      {!stats ? (
        <p>Loading crime data...</p>
      ) : (
        <div className="panel-content">
          <p>Total incidents (2020–2025): <strong>{stats.total}</strong></p>
          <ul>
            {Object.entries(stats.byType).map(([k, v]) => (
              <li key={k}>{k}: {v}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
