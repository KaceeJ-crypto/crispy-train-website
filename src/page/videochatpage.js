
// src/pages/MiroTalkPage.jsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Video, Mic, MicOff, ScreenShare, Users, MessageCircle, Server, PhoneOff } from "lucide-react";

export default function VideoChatPage() {
  useEffect(() => {
    // Inject MiroTalk IFrame
    const frame = document.getElementById("mirotalk-frame");
    if (frame) {
      frame.src = "https://mirotalk.up.railway.app/newroom"; // your MiroTalk server URL
    }
  }, []);

  return (
    <div className="w-screen h-screen bg-black relative overflow-hidden text-green-400 font-mono">
      {/* Matrix background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.2),transparent)] animate-pulse"></div>
      
      {/* Animated falling matrix rain */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ repeat: Infinity, duration: 6 }}
      >
        <pre className="text-green-600 opacity-30 whitespace-pre-wrap text-xs">
          {"01 10 11 00 10 01 11 00 ".repeat(500)}
        </pre>
      </motion.div>

      {/* Video Chat Frame */}
      <iframe
        id="mirotalk-frame"
        title="MiroTalk"
        className="w-full h-full rounded-2xl shadow-2xl border border-green-700"
        allow="camera; microphone; fullscreen; display-capture"
      ></iframe>

      {/* Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-6 bg-black/60 px-6 py-3 rounded-2xl border border-green-600 shadow-xl">
        <button className="hover:text-green-200"><Mic size={28}/></button>
        <button className="hover:text-green-200"><Video size={28}/></button>
        <button className="hover:text-green-200"><ScreenShare size={28}/></button>
        <button className="hover:text-green-200"><Users size={28}/></button>
        <button className="hover:text-green-200"><MessageCircle size={28}/></button>
        <button className="hover:text-green-200"><Server size={28}/></button>
        <button className="hover:text-red-500"><PhoneOff size={28}/></button>
      </div>

      {/* Side Panel */}
      <div className="absolute right-0 top-0 w-80 h-full bg-black/80 border-l border-green-700 flex flex-col">
        <div className="p-3 border-b border-green-700 font-bold">Chat & Participants</div>
        <div className="flex-1 overflow-y-auto p-3 text-sm">
          <p className="text-green-300">System: Welcome Gh😱stFace.</p>
        </div>
        <div className="p-3 border-t border-green-700">
          <input
            type="text"
            placeholder="Spit your game..."
            className="w-full bg-black text-green-400 border border-green-600 rounded px-2 py-1"
          />
        </div>
      </div>
    </div>
  );
}
