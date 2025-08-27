import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

// Pages
import Home from "./page/Home";
import MapPage from "./AtlantaMap"; // Leaflet map
import VideoChatPage from "./page/videochatpage";
import ResourcesPage from "./page/resourcespage";
import GhostNetPage from "./page/ghostnetpage";
import TerminalPage from "./page/Terminal";

// CSS
import "./App.css";
import "leaflet/dist/leaflet.css"; // <-- Leaflet CSS import

export default function App() {
  return (
    <BrowserRouter>
      <div className="dashboard">
        {/* Matrix Background */}
        <canvas id="matrix"></canvas>

        {/* Top Header */}
        <header className="topbar">
          <h1 className="neon-title">GhostShip Atlanta</h1>
          <p className="neon-subtitle">Kacee J Bulletin</p>
          <nav className="nav">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/map">Map</NavLink>
            <NavLink to="/call">Video Call</NavLink>
            <NavLink to="/resources">Resources</NavLink>
            <NavLink to="/ghostnet">GhostNet</NavLink>
            <NavLink to="/terminal">Terminal</NavLink>
          </nav>
        </header>

        {/* Page Content */}
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/call" element={<VideoChatPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/ghostnet" element={<GhostNetPage />} />
            <Route path="/terminal" element={<TerminalPage />} />
          </Routes>
        </main>

        {/* PayPal Donation Button */}
        <footer className="footer">
          <a
            href="https://www.paypal.me/KaceeJL"
            target="_blank"
            rel="noopener noreferrer"
            className="paypal-button"
          >
            ☕ Buy me a coffee / Donate
          </a>
        </footer>
      </div>
    </BrowserRouter>
  );
}
