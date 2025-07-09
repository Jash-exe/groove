import { useState, useEffect, useMemo } from "react";

// Placeholder participant list
const allParticipants = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Heidi"];

const questions = [
  "Who is most likely to become a billionaire? 💰👑",
  "Who is most likely to survive a zombie apocalypse? 🧟‍♂️🔫",
  "Who is most likely to go viral on the internet? 🌐🔥",
  "Who is most likely to get lost in their own neighborhood? 🗺️😵",
  "Who is most likely to forget an important birthday? 🎂🙈",
  "Who is most likely to travel the world? ✈️🌍",
  "Who is most likely to invent something genius? 💡🧠",
  "Who is most likely to run a marathon without training? 🏃‍♂️😅",
  "Who is most likely to own 10 cats? 🐱🐱🐱",
  "Who is most likely to move to a different country? 🌎📦",
  "Who is most likely to cry at a movie? 🎥😭",
  "Who is most likely to show up late to their own wedding? ⏰💒",
  "Who is most likely to win a reality TV show? 📺🏆",
  "Who is most likely to become a stand-up comedian? 🎤😂",
  "Who is most likely to have a secret talent? 🤫🎨",
  "Who is most likely to sleep through an earthquake? 🛏️🌍",
  "Who is most likely to get arrested for a funny reason? 🚓😆",
  "Who is most likely to accidentally text the wrong person? 📱🙃",
  "Who is most likely to win an Olympic medal? 🥇🏅",
  "Who is most likely to start a cult? 🕯️👀",
  "Who is most likely to become a professional gamer? 🎮💻",
  "Who is most likely to befriend a wild animal? 🐻🤝",
  "Who is most likely to go skydiving without hesitation? 🪂😎",
  "Who is most likely to become a famous chef? 👨‍🍳🌟",
  "Who is most likely to forget their passport at the airport? ✈️🛂🙄",
  "Who would you vote off the island? 🏝️🚫",
  "Who would you choose to lead the group in a crisis? 🚨🧭",
  "Who would you trust to keep a big secret? 🤐🔒",
  "Who would you choose to cook for the whole group? 🍽️👨‍🍳",
  "Who would you pick to sing karaoke with? 🎤🎶",
  "Who would you NOT want to be stuck with on a desert island? 🏝️😬",
  "Who would you choose to plan your birthday party? 🎉🎈",
  "Who would you pick to design your dream house? 🏠🎨",
  "Who would you trust to manage your finances? 💸📊",
  "Who would you pick to babysit your pet? 🐶🐾",
  "Who would you choose as your partner in a heist? 🕵️‍♂️💼",
  "Who would you vote for as class president? 🏫🗳️",
  "Who would you choose to be stranded on Mars with? 🚀🪐",
  "Who would you trust to deliver a public speech for you? 🗣️🎤",
  "Who would you choose to play in a trivia game? 🧠❓",
  "Who would you pick to survive in the wild for a week? 🌲🛖",
  "Who would you NOT trust with your phone unlocked? 📱🙈",
  "Who would you pick to give relationship advice? 💌🧠",
  "Who would you choose to be your teammate in a video game? 🎮🤝",
  "Who would you trust to solve a mystery? 🔍🕵️",
  "Who would you pick to go on a reality dating show? 💘📺",
  "Who would you choose to prank someone with? 😈🎭",
  "Who would you vote as most dramatic? 🎭😱",
  "Who would you choose to bring to a job interview? 💼🧑‍💼",
  "Who would you nominate for 'most chaotic energy'? ⚡😜"
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PickWhoGame({ total = 10, secs = 15, onFinish }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [time, setTime] = useState(secs);

  // Shuffle questions and pick random participants for each question
  const qSet = useMemo(() => shuffle(questions).slice(0, total), [total]);
  const participantOptions = useMemo(
    () =>
      Array.from({ length: total }, () =>
        shuffle(allParticipants).slice(0, 4)
      ),
    [total]
  );

  const q = qSet[idx];
  const options = participantOptions[idx];

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
      onFinish?.();
    }
  }

  // Progress bar percent for question number
  const progress = ((idx + 1) / qSet.length) * 100;

  return (
    <div className="flex flex-col items-center min-h-[80vh] w-full">
      {/* Top header row */}
      <div className="flex items-center justify-between w-full max-w-3xl mb-6 px-2 md:px-0">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-[#a259ff] to-[#f246a9] text-2xl">🥳</span>
          <div>
            <div className="font-semibold text-white text-lg">Pick Who Game</div>
            <div className="text-sm text-slate-400">Round {idx + 1} of {qSet.length}</div>
          </div>
        </div>
        <button
          className="px-5 py-2 rounded-xl bg-[#232336] text-white font-semibold hover:bg-[#2d2d45] transition border border-[#232336] text-base"
          onClick={onFinish}
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
        <h1 className="text-xl font-bold text-white mb-6 text-center">{q}</h1>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {options.map((opt, i) => {
            const state =
              picked === null
                ? "idle"
                : opt === picked
                ? "right"
                : "other";
            const colour =
              state === "idle"
                ? "bg-[#232336] text-white hover:bg-gradient-to-r hover:from-[#a259ff] hover:to-[#f246a9] hover:text-white"
                : state === "right"
                ? "bg-emerald-500 text-white"
                : "bg-[#232336] text-white";
            return (
              <button
                key={opt}
                onClick={() => choose(opt)}
                className={`flex items-center gap-3 w-full h-14 px-6 rounded-xl font-semibold text-base transition shadow-[0_4px_24px_0_rgba(236,72,153,0.15)] text-left ${colour}`}
              >
                <span className="font-bold text-base mr-2 opacity-80">{String.fromCharCode(65 + i)}.</span>
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
        {/* Round display below progress bar, centered */}
        <div className="mt-4 text-white text-sm text-center">Round: {idx + 1} / {qSet.length}</div>
      </div>
    </div>
  );
} 