import { useState, useEffect, useRef } from "react";
import questionsData from "../assets/guess_the_song.json";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GuessTheSongGame({ total = 10, secs = 15, onDone }) {
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [letterInputs, setLetterInputs] = useState([]);
  const [timeLeft, setTimeLeft] = useState(secs);
  const [questions, setQuestions] = useState(() => shuffle(questionsData).slice(0, total));
  const inputRefs = useRef([]);
  const answeredRef = useRef(false);
  const currentIdxRef = useRef(0);

  // LOG: Mount
  useEffect(() => {
    console.log('GuessTheSongGame mounted ONCE', { total });
  }, []);

  // Only reset questions if total changes (i.e., new game)
  useEffect(() => {
    setQuestions(shuffle(questionsData).slice(0, total));
    setIdx(0);
    setScore(0);
    setFeedback(null);
    setLetterInputs([]);
    setTimeLeft(secs);
    answeredRef.current = false;
    currentIdxRef.current = 0;
    console.log('Questions shuffled and idx reset for new game', { total });
  }, [total, secs]);

  const q = questions[idx];

  useEffect(() => {
    if (q && q.answer) {
      setLetterInputs(q.answer.split("").map(char => (char === " " ? " " : "")));
      inputRefs.current = [];
      setTimeLeft(secs);
      answeredRef.current = false;
      currentIdxRef.current = idx;
      console.log('New question loaded', { idx, q, secs });
    }
    // Cleanup on unmount
    return () => {
      console.log('Cleanup on unmount or question change', { idx });
    };
    // eslint-disable-next-line
  }, [q, secs]);

  // TIMER EFFECT — fires once per question
  useEffect(() => {
    // If we’re showing feedback, pause the clock.
    if (feedback) return;

    // ⚡ Start / restart interval for the current question
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t === 1) {
          clearInterval(interval);   // stop ticking
          checkAnswer(true, idx);    // auto‑submit as timeout
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    console.log('⏳ interval started for idx', idx);

    // 🔄 Clean up when the component unmounts or the question / feedback changes
    return () => clearInterval(interval);
  }, [idx, feedback]);   // <— depends on current question & phase

  // Prevent double advance: lock checkAnswer if feedback is set or already answered, and only for current question
  const checkAnswer = (timeout = false, forIdx = idx) => {
    if (feedback || answeredRef.current) {
      console.log('checkAnswer blocked', { feedback, answered: answeredRef.current, forIdx, current: currentIdxRef.current });
      return;
    }
    if (forIdx !== currentIdxRef.current) {
      console.log('checkAnswer for wrong question', { forIdx, current: currentIdxRef.current });
      return;
    }
    answeredRef.current = true;
    const userTyped = letterInputs.join("");
    const correct = userTyped.trim().toLowerCase() === q.answer.trim().toLowerCase();
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore(s => s + 1);
    console.log('checkAnswer called', { idx, correct, timeout });
    setTimeout(() => {
      // 🔄 prepare the next question
      setTimeLeft(secs); // 1️⃣ reset clock immediately
      setFeedback(null); // 2️⃣ exit "showingAnswer" phase
      setLetterInputs([]); // 3️⃣ clear input
      // only advance if this question is still current
      if (currentIdxRef.current === forIdx) {
        setIdx(prevIdx => {
          const nextIdx = prevIdx + 1;
          if (nextIdx < questions.length) {
            currentIdxRef.current = nextIdx; // keep the ref in sync
            console.log('Advancing to next question', { prevIdx, nextIdx });
            return nextIdx;
          } else {
            console.log('Game done', { score, correct });
            onDone?.(score + (correct ? 1 : 0));
            return prevIdx;
          }
        });
      } else {
        console.log('Not advancing, question changed', { current: currentIdxRef.current, forIdx });
      }
    }, 1200);
  };

  if (!questions.length || !q) return <div className="text-white">No questions found.</div>;

  function handleLetterChange(e, i) {
    const val = e.target.value;
    if (val.length > 1) return;
    const newInputs = [...letterInputs];
    newInputs[i] = val;
    setLetterInputs(newInputs);
    if (val && i < letterInputs.length - 1) {
      let next = i + 1;
      while (next < letterInputs.length && q.answer[next] === " ") next++;
      if (next < letterInputs.length && inputRefs.current[next]) {
        inputRefs.current[next].focus();
      }
    }
  }

  function handleKeyDown(e, i) {
    if (e.key === "Backspace" && !letterInputs[i] && i > 0) {
      let prev = i - 1;
      while (prev >= 0 && q.answer[prev] === " ") prev--;
      if (prev >= 0 && inputRefs.current[prev]) {
        inputRefs.current[prev].focus();
        setLetterInputs(inputs => {
          const arr = [...inputs];
          arr[prev] = "";
          return arr;
        });
      }
    }
  }

  const progress = ((idx + 1) / questions.length) * 100;

  // Responsive input size for long answers
  const inputBoxClass =
    questions.length && q.answer.length > 18
      ? "w-6 h-9 text-base"
      : "w-8 h-10 text-lg";

  return (
    <div className="flex flex-col items-center min-h-[80vh] w-full">
      {/* Top header row */}
      <div className="flex items-center justify-between w-full max-w-3xl mb-6 px-2 md:px-0">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-[#a259ff] to-[#f246a9] text-2xl">🎧</span>
          <div>
            <div className="font-semibold text-white text-lg">Guess the Song</div>
            <div className="text-sm text-slate-400">Round {idx + 1} of {questions.length}</div>
          </div>
        </div>
        <button
          className="px-5 py-2 rounded-xl bg-[#232336] text-white font-semibold hover:bg-[#2d2d45] transition border border-[#232336] text-base"
          onClick={() => onDone?.(score)}
        >
          Leave Game
        </button>
      </div>

      {/* Card */}
      <div className="bg-[#181825] rounded-2xl border border-[#232336] shadow-[0_0_24px_0_rgba(236,72,153,0.15)] px-6 py-6 max-w-3xl w-full mx-auto">
        <div className="flex items-center justify-center gap-2 text-sm text-[#a259ff] mb-2">
          <svg width="18" height="18" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="#a259ff" strokeWidth="2" fill="none"/><path d="M8 4v4l3 2" stroke="#a259ff" strokeWidth="2" strokeLinecap="round"/></svg>
          <span>Your turn - {timeLeft}s left</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-6 text-center">{q.emojiQuestion}</h1>
        {/* Dashes clue for answer length as input boxes */}
        <form
          className="flex flex-col items-center gap-4"
          onSubmit={e => {
            e.preventDefault();
            checkAnswer();
          }}
        >
          <div className="flex flex-wrap justify-center gap-1 mb-2 max-w-2xl mx-auto">
            {q.answer.split("").map((char, i) =>
              char === " " ? (
                <span key={i} className="w-4">&nbsp;</span>
              ) : (
                <input
                  key={i}
                  ref={el => (inputRefs.current[i] = el)}
                  type="text"
                  maxLength={1}
                  className={`${inputBoxClass} text-center rounded border-b-2 border-dashed border-[#a259ff] bg-[#232336] text-white mx-0.5 focus:outline-none focus:border-[#a259ff] transition-all`}
                  value={letterInputs[i] || ""}
                  onChange={e => handleLetterChange(e, i)}
                  onKeyDown={e => handleKeyDown(e, i)}
                  disabled={!!feedback}
                  autoFocus={i === 0}
                />
              )
            )}
          </div>
          <button
            type="submit"
            className={`px-6 py-2 rounded-xl font-semibold text-base transition bg-gradient-to-r from-[#a259ff] to-[#f246a9] text-white shadow-[0_4px_24px_0_rgba(236,72,153,0.15)] ${feedback ? "opacity-60" : ""}`}
            disabled={!!feedback || letterInputs.filter((c, i) => q.answer[i] !== " " && !c).length > 0}
          >
            Submit
          </button>
        </form>
        {feedback && (
          <div className={`mt-4 text-lg font-bold ${feedback === "correct" ? "text-emerald-400" : "text-rose-400"}`}>
            {feedback === "correct" ? "Correct!" : `Wrong! Answer: ${q.answer}`}
          </div>
        )}
        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-[#232336] overflow-hidden mt-6">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#a259ff] to-[#f246a9] transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Round display below progress bar, centered */}
        <div className="mt-4 text-white text-sm text-center">Round: {idx + 1} / {questions.length}</div>
      </div>
    </div>
  );
} 