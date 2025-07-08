import { useState } from "react";

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="11" fill="white" fillOpacity="0.12"/>
      <path d="M9.5 8.5L14 11L9.5 13.5V8.5Z" fill="white"/>
    </svg>
  );
}

export default function SettingsDialog({ onStart, onClose }) {
  const [total, setTotal] = useState(10);
  const [secs, setSecs] = useState(15);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
      <div className="bg-[#181825] rounded-2xl border border-[#232336] shadow-[0_0_24px_0_rgba(236,72,153,0.15)] p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-white mb-6">Game settings</h2>

        <label className="block text-slate-300 font-medium mb-2">Number of questions</label>
        <input
          type="number"
          min="3"
          max="30"
          value={total}
          onChange={(e) => setTotal(+e.target.value)}
          className="w-full rounded-lg bg-[#232336] text-white px-3 py-2 border-none focus:ring-2 focus:ring-[#a259ff] placeholder:text-slate-500 mb-4"
        />

        <label className="block text-slate-300 font-medium mb-2">Seconds per question</label>
        <input
          type="number"
          min="5"
          max="60"
          value={secs}
          onChange={(e) => setSecs(+e.target.value)}
          className="w-full rounded-lg bg-[#232336] text-white px-3 py-2 border-none focus:ring-2 focus:ring-[#a259ff] placeholder:text-slate-500 mb-4"
        />

        <button
          className="w-full py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-[#a259ff] to-[#f246a9] text-white shadow-[0_4px_24px_0_rgba(236,72,153,0.25)] hover:opacity-90 transition border-2 border-[#a259ff] mb-3"
          onClick={() => onStart({ total, secs })}
        >
          <PlayIcon />
          Start Game
        </button>
        <button
          className="w-full py-3 rounded-xl font-bold text-lg bg-[#232336] text-slate-300 hover:bg-[#232346] transition"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
} 