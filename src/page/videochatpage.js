import React from "react";

export default function VideoChatPage() {
  return (
    <section className="panel">
      <h2 className="panel-title">MiroTalk P2P Call</h2>
      <div className="video-frame">
        <iframe
          title="MiroTalk P2P"
          allow="camera; microphone; display-capture; fullscreen; autoplay; clipboard-read; clipboard-write"
          src="https://p2p.mirotalk.com/newcall?room=ghostship&autoplay=1"
          style={{ width: "100%", height: "100%", border: 0 }}
        />
      </div>
      <p className="panel-content" style={{ marginTop: 10 }}>
        Tip: Mobile browsers often mute autoplay audio. Tap inside the call to unmute the speaker/mic.
      </p>
    </section>
  );
}
