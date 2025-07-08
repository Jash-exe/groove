import fs from "fs/promises";
import fetch from "node-fetch";

const res = await fetch(
  "https://the-trivia-api.com/api/questions?categories=music&limit=1000"
);
let data = await res.json();

const recents = [
  "Taylor Swift","Billie Eilish","Blinding Lights","Adele",
  "Drake","Olivia Rodrigo","Dua Lipa","Harry Styles","The Weeknd",
  "Post Malone","Justin Bieber","Ariana Grande","Kendrick Lamar",
  "Cardi B","Shawn Mendes","Ed Sheeran","Khalid","Lizzo"
];

function keep(q) {
  const txt = q.question.toLowerCase();
  return recents.some(k => txt.includes(k.toLowerCase()));
}

data = data.filter(keep);

await fs.writeFile(
  "src/assets/music_recent.json",
  JSON.stringify(data.map(q => ({
     question: q.question,
     choices: [ ...q.incorrectAnswers, q.correctAnswer ].sort(() => 0.5 - Math.random()),
     answer: q.correctAnswer
  })), null, 2)
);
console.log(`✅ Added ${data.length} post‑2010 questions to music_recent.json`); 