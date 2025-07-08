import { useMemo } from "react";
import deck from "../assets/music_recent.json";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function useRecentMusicQuestions(count) {
  return useMemo(() => shuffle(deck).slice(0, count), [count]);
} 