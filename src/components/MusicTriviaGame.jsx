import { useState, useEffect } from "react";
import useRecentMusicQuestions from "../lib/useRecentMusicQuestions";

const optionLetters = ["A", "B", "C", "D"];

export default function MusicTriviaGame({ total, secs, onDone }) {
  const qSet = useRecentMusicQuestions(total);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [time, setTime] = useState(secs);

  const q = qSet[idx];

  useEffect(() => {
    if (time === 0) next();
    const t = setTimeout(() => setTime(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [time]);

  function choose(opt) {
    if (picked) return;
    setPicked(opt);
    setTimeout(next, 700);
  }

  function next() {
    if (idx + 1 < qSet.length) {
      setIdx(idx + 1);
      setPicked(null);
      setTime(secs);
    } else {
      onDone?.();
    }
  }

  // Progress bar percent for question number
  const progress = ((idx + 1) / qSet.length) * 100;

  return (
    <div className="flex flex-col items-center min-h-[80vh] w-full">
      {/* Top header row */}
      <div className="flex items-center justify-between w-full max-w-3xl mb-6 px-2 md:px-0">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-[#a259ff] to-[#f246a9] text-2xl">🎵</span>
          <div>
            <div className="font-semibold text-white text-lg">Music Trivia</div>
            <div className="text-sm text-slate-400">Round {idx + 1} of {qSet.length}</div>
          </div>
        </div>
        <button
          className="px-5 py-2 rounded-xl bg-[#232336] text-white font-semibold hover:bg-[#2d2d45] transition border border-[#232336] text-base"
          onClick={onDone}
        >
          Leave Game
        </button>
      </div>

      {/* Card */}
      <div className="bg-[#181825] rounded-2xl border border-[#232336] shadow-[0_0_24px_0_rgba(236,72,153,0.15)] px-6 py-6 max-w-3xl w-full mx-auto">
        <div className="flex items-center justify-center gap-2 text-sm text-[#a259ff] mb-2">
          <svg width="18" height="18" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="#a259ff" strokeWidth="2" fill="none"/><path d="M8 4v4l3 2" stroke="#a259ff" strokeWidth="2" strokeLinecap="round"/></svg>
          <span>Your turn - {time}s left</span>
        </div>
        <h1 className="text-xl font-bold text-white mb-6 text-center">{q.question}</h1>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {q.choices.map((opt, i) => {
            const state =
              picked === null
                ? "idle"
                : opt === q.answer
                ? "right"
                : opt === picked
                ? "wrong"
                : "other";
            const colour =
              state === "idle"
                ? "bg-[#232336] text-white hover:bg-gradient-to-r hover:from-[#a259ff] hover:to-[#f246a9] hover:text-white"
                : state === "right"
                ? "bg-emerald-500 text-white"
                : state === "wrong"
                ? "bg-rose-600 text-white"
                : "bg-[#232336] text-white";
            return (
              <button
                key={opt}
                onClick={() => choose(opt)}
                className={`flex items-center gap-3 w-full h-14 px-6 rounded-xl font-semibold text-base transition shadow-[0_4px_24px_0_rgba(236,72,153,0.15)] text-left ${colour}`}
              >
                <span className="font-bold text-base mr-2 opacity-80">{optionLetters[i] || String.fromCharCode(65 + i)}.</span>
                <span className="text-left">{opt}</span>
              </button>
            );
          })}
        </div>
        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-[#232336] overflow-hidden mt-4">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#a259ff] to-[#f246a9] transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
} 