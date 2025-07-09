import { useState } from "react";
import SettingsDialog from "./SettingsDialog";
import WyrGame from "./WyrGame";
import MusicTriviaGame from "./MusicTriviaGame";
import GuessTheSongGame from "./GuessTheSongGame";
import PickWhoGame from "./PickWhoGame";

const games = [
  {
    id: "trivia",
    name: "Music Trivia",
    description: "Test your music knowledge with questions about artists, songs, and albums",
    icon: <span className="text-2xl text-[#a259ff]">🎵</span>,
    difficulty: "Medium",
    players: "2-8",
    duration: "10-15 min",
    badgeColor: "bg-[#a259ff] bg-opacity-20",
    enabled: true // Enable Music Trivia
  },
  {
    id: "would-you-rather",
    name: "Would You Rather",
    description: "Choose between two music-related scenarios and see what others pick",
    icon: <span className="text-2xl">🤔</span>,
    difficulty: "Easy",
    players: "2-10",
    duration: "5-10 min",
    badgeColor: "bg-green-600 bg-opacity-20",
    enabled: true
  },
  {
    id: "guess-the-song",
    name: "Guess the Song",
    description: "Guess the song title from emoji clues!",
    icon: <span className="text-2xl text-[#a259ff]">🎧</span>,
    difficulty: "Hard",
    players: "1 player",
    duration: "15-20 min",
    badgeColor: "bg-pink-600 bg-opacity-20",
    enabled: true // Enable Guess the Song
  },
  {
    id: "pick-who-game",
    name: "Pick Who Game",
    description: "A fun party game where players vote on who best fits the scenario or who they would choose in a given situation 🤔👥",
    icon: <span className="text-2xl text-[#a259ff]">🥳</span>,
    difficulty: "Easy",
    players: "2-8 players",
    duration: "10-15 min",
    badgeColor: "bg-green-600 bg-opacity-20",
    enabled: true // Enable Pick Who Game
  }
];

function PlayIcon({ enabled }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`mr-2 ${enabled ? '' : 'opacity-60'}`}>
      <polygon points="6,4 15,10 6,16" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

export default function GamePanel() {
  const [stage, setStage] = useState("menu");
  const [config, setConfig] = useState(null);
  const [activeGame, setActiveGame] = useState(null); // 'trivia' | 'would-you-rather'

  if (stage === "game" && config && activeGame === "trivia")
    return (
      <MusicTriviaGame total={config.total} secs={config.secs} onDone={() => setStage("menu")} />
    );
  if (stage === "game" && config && activeGame === "would-you-rather")
    return (
      <WyrGame total={config.total} secs={config.secs} onFinish={() => setStage("menu")} />
    );
  if (stage === "game" && config && activeGame === "guess-the-song")
    return (
      <GuessTheSongGame total={config.total} secs={config.secs} onDone={() => setStage("menu")} />
    );
  if (stage === "game" && config && activeGame === "pick-who-game")
    return (
      <PickWhoGame total={config.total} secs={config.secs} onFinish={() => setStage("menu")} />
    );

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h3 className="text-2xl font-bold mb-2 text-white text-center">Game Room</h3>
      <p className="mb-8 text-slate-300 text-center">Play interactive games with your friends while listening to music</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {games.map((game) => (
          <div
            key={game.id}
            className="rounded-2xl bg-[#181825] border border-[#232336] shadow-[0_0_24px_0_rgba(236,72,153,0.15)] p-8 flex flex-col min-h-[260px]"
          >
            <div className="flex items-center gap-3 mb-2">
              {game.icon}
              <span className="font-bold text-white text-lg">{game.name}</span>
              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold text-white ${game.badgeColor}`}>{game.difficulty}</span>
            </div>
            <p className="text-slate-200 mb-4">{game.description}</p>
            <div className="flex items-center justify-between text-xs text-[#a259ff] mb-8">
              <span className="flex items-center gap-1"><span className="text-base">👥</span> {game.players} players</span>
              <span className="flex items-center gap-1"><span className="text-base">⏱</span> {game.duration}</span>
            </div>
            <button
              className={`w-full h-10 min-h-[40px] mt-auto rounded-xl font-bold text-base flex items-center justify-center gap-2 bg-gradient-to-r from-[#a259ff] to-[#f246a9] text-white shadow-[0_4px_24px_0_rgba(236,72,153,0.25)] transition border-none ${
                game.enabled ? "hover:opacity-90" : "opacity-60 cursor-not-allowed"
              }`}
              onClick={() => {
                if (game.enabled) {
                  setActiveGame(game.id);
                  setStage("settings");
                }
              }}
              disabled={!game.enabled}
            >
              <PlayIcon enabled={game.enabled} />
              Start Game
            </button>
          </div>
        ))}
      </div>
      {stage === "settings" && (
        <SettingsDialog
          onStart={(cfg) => {
            setConfig(cfg);
            setStage("game");
          }}
          onClose={() => setStage("menu")}
        />
      )}
    </div>
  );
}