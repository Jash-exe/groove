import { useEffect, useState, useMemo } from "react";
import questions from "../assets/questions.json";

function parseQuestion(str) {
  const q = str.trim();
  const lastOr = q.toLowerCase().lastIndexOf(" or ");
  if (lastOr === -1) return { text: q, optionA: "Option A", optionB: "Option B" };
  return {
    text: q,
    optionA: q.slice(q.indexOf("rather") + 7, lastOr).trim(),
    optionB: q.slice(lastOr + 4).replace(/\?$/, "").trim()
  };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function WyrGame({ total = 10, secs = 15, onFinish }) {
  const deck = useMemo(() => shuffle(questions.map(parseQuestion)), []);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(secs);

  const q = deck[idx];

  useEffect(() => {
    if (timeLeft === 0) next();
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft]);

  function choose(letter) {
    if (selected) return;
    setSelected(letter);
    setTimeout(next, 500); // half-second flash
  }

  function next() {
    if (idx + 1 < Math.min(deck.length, total)) {
      setIdx(idx + 1);
      setSelected(null);
      setTimeLeft(secs);
    } else {
      onFinish?.();
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-[#181825] rounded-2xl border border-[#232336] shadow-[0_0_24px_0_rgba(236,72,153,0.15)] px-8 py-10 max-w-xl w-full mx-auto">
        <div className="text-sm text-[#a259ff] text-center mb-4">
          Q {idx + 1}/{Math.min(deck.length, total)} • {timeLeft}s
        </div>
        <h1 className="text-2xl font-bold text-white mb-8 text-center">Would you rather</h1>
        <button
          onClick={() => choose("A")}
          className={`w-full py-4 rounded-xl font-semibold text-lg mb-4 transition shadow-[0_4px_24px_0_rgba(236,72,153,0.15)]
            ${
              selected === "A"
                ? "bg-gradient-to-r from-[#a259ff] to-[#f246a9] text-white"
                : "bg-[#232336] text-white hover:bg-gradient-to-r hover:from-[#a259ff] hover:to-[#f246a9] hover:text-white"
            }`}
        >
          {q.optionA}
        </button>
        <div className="text-center text-slate-400 font-bold mb-4 text-lg">OR</div>
        <button
          onClick={() => choose("B")}
          className={`w-full py-4 rounded-xl font-semibold text-lg mb-2 transition shadow-[0_4px_24px_0_rgba(236,72,153,0.15)]
            ${
              selected === "B"
                ? "bg-gradient-to-r from-[#a259ff] to-[#f246a9] text-white"
                : "bg-[#232336] text-white hover:bg-gradient-to-r hover:from-[#a259ff] hover:to-[#f246a9] hover:text-white"
            }`}
        >
          {q.optionB}
        </button>
      </div>
    </div>
  );
} 