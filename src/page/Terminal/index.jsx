// src/page/Terminal/index.jsx
import React, { useState } from "react";
import "./terminal.css";

const commands = {
  help: "List of available commands. Type 'help' to see all commands.",
  ls: "home  mappage  videochat  resources  ghostnet",
  whoami: "Kacee J - VP of Sacred Space Foundation, trans rights advocate, survivor.",
  date: () => new Date().toLocaleDateString(),
  time: () => new Date().toLocaleTimeString(),
  autobio: `
Kacee J is a transgender woman navigating a world that often misunderstands her existence.
She has faced systemic challenges, societal bias, and personal battles, including navigating life
during politically hostile times like the Trump administration.
Her journey embodies resilience, self-love, and advocacy for trans and marginalized communities.
  `,
  ghostship: `
GhostShip is envisioned as a safe haven, a space for recovery, empowerment, and community.
It stands as a legacy for those who are invisible yet powerful, creating a sanctuary where
voices are heard, knowledge is shared, and connections are forged.
  `,
  legacy: "Your actions today shape GhostShip and the impact it will leave on future generations.",
  clear: "clear",
  about: "This terminal is a simulation interface for GhostShip operations.",
};

// Generate 100+ dummy commands
for (let i = 1; i <= 100; i++) {
  commands[`cmd${i}`] = `This is the response for command ${i}`;
}

export default function Terminal() {
  const [output, setOutput] = useState(["Welcome to GhostShip Terminal. Type 'help' for commands."]);
  const [input, setInput] = useState("");

  const handleCommand = (e) => {
    if (e.key === "Enter") {
      let trimmed = input.trim();
      if (!trimmed) return;
      let newOutput = [...output, `$ ${trimmed}`];

      if (commands[trimmed]) {
        if (typeof commands[trimmed] === "function") {
          newOutput.push(commands[trimmed]());
        } else if (commands[trimmed] === "clear") {
          setOutput([]);
          setInput("");
          return;
        } else {
          newOutput.push(commands[trimmed]);
        }
      } else {
        newOutput.push(`Command not found: ${trimmed}`);
      }

      setOutput(newOutput);
      setInput("");
    }
  };

  return (
    <div className="terminal-container">
      <div className="terminal-output">
        {output.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>
      <div className="terminal-input">
        <span>$ </span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          autoFocus
        />
      </div>
    </div>
  );
}
