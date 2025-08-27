// src/page/Home/index.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

export default function Home() {
  const navigate = useNavigate();
  const [bulletin, setBulletin] = useState([
    { type: "text", content: "γράφω τὸν νόμον σου." },
    { type: "text", content: "Stay sharp, stay free." },
  ]);
  const [editing, setEditing] = useState(false);
  const [newEntry, setNewEntry] = useState("");

  // Matrix rain effect
  useEffect(() => {
    const c = document.getElementById("matrix");
    const ctx = c.getContext("2d");

    const resize = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const letters = "01";
    const fontSize = 18;
    const columns = Math.floor(c.width / fontSize);
    const drops = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, c.width, c.height);

      ctx.fillStyle = "#9d4edd";
      ctx.font = `${fontSize}px monospace`;

      drops.forEach((y, i) => {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, y * fontSize);

        if (y * fontSize > c.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      });
    };

    const id = setInterval(draw, 50);
    return () => {
      clearInterval(id);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleRedPill = () => {
    const elem = document.getElementById("matrix");
    if (elem.requestFullscreen) elem.requestFullscreen();
  };

  const addEntry = () => {
    if (newEntry.trim()) {
      setBulletin([...bulletin, { type: "text", content: newEntry }]);
      setNewEntry("");
      setEditing(false);
    }
  };

  return (
    <div className="home-wrap">
      <canvas id="matrix"></canvas>

      {/* Hero Section */}
      <div className="hero">
        <h1 className="ghostship-title">Navis populi mei</h1>
        <p className="ghostship-quote">
          "True freedom awakens when you stop seeking permission to exist as yourself.The world bends not for the timid, but for those who stand unbroken, and the fiercest triumphs are often whispered in silence." – Kacee J
        </p>

        {/* Pills */}
        <div className="pill-choices">
          <button className="pill blue" onClick={() => navigate("/terminal")}>
            💊 Blue Pill
          </button>
          <button className="pill red" onClick={handleRedPill}>
            💊 Red Pill
          </button>
        </div>
      </div>

      {/* Video */}
      <section className="video-section">
        <iframe
          title="Creators Chanel"
          src="https://www.youtube.com/embed/sdZMJfmwIY8?autoplay=1&mute=1&playsinline=1"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </section>

      {/* Scrollable Bulletin */}
      <section className="panel bulletin">
        <div className="bulletin-header">
          <h2 className="panel-title">Updates4Gh👻sts</h2>
          <button className="edit-btn" onClick={() => setEditing(!editing)}>
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="bulletin-feed">
          {bulletin.map((entry, idx) => (
            <div key={idx} className="bulletin-item">
              {entry.type === "text" ? entry.content : null}
            </div>
          ))}
        </div>

        {editing && (
          <div className="bulletin-editor">
            <textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="👻write..."
            />
            <button onClick={addEntry}>Post</button>
          </div>
        )}
      </section>
    </div>
  );
}
