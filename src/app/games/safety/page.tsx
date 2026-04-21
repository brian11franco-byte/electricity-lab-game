"use client";

import { useMemo, useState } from "react";
import { useXP } from "@/context/XPContext";
import { Feedback } from "@/components/Feedback";

interface Question {
  id: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: "q1",
    statement: "Children should move or touch mains appliances, wires, or plugs.",
    isTrue: false,
    explanation: "Mains electricity is very strong and can cause a severe electric shock. Only adults should handle these items to stay safe.",
  },
  {
    id: "q2",
    statement: "Children should not touch mains wall sockets.",
    isTrue: true,
    explanation: "Wall sockets connect directly to strong mains electricity. Poking fingers or toys inside will give you a dangerous shock.",
  },
  {
    id: "q3",
    statement: "You must keep water away from electrical appliances.",
    isTrue: true,
    explanation: "Water easily carries electricity. If water touches a plugged-in item, the electricity can travel through the water and shock you.",
  },
  {
    id: "q4",
    statement: "Dirt and dust are safe to have near electrical appliances.",
    isTrue: false,
    explanation: "Dirt and dust can block the cooling vents on machines. This makes the appliance overheat and can start a fire.",
  },
  {
    id: "q5",
    statement: "You must stay away from damaged wires and damaged electrical appliances.",
    isTrue: true,
    explanation: "The plastic cover on a wire protects you. If the cover is broken, the exposed electricity inside can burn or shock you.",
  },
  {
    id: "q6",
    statement: "It is safe to open or burn electrical cells (batteries).",
    isTrue: false,
    explanation: "Batteries contain harmful chemicals. Opening or burning them can cause them to leak or explode, which can hurt your skin and eyes.",
  },
  {
    id: "q7",
    statement: "You must dry your hands first before you touch a light switch, plug, or tablet charger.",
    isTrue: true,
    explanation: "Wet skin lets electricity pass into your body much easier than dry skin. Drying your hands keeps you safe from shocks.",
  },
  {
    id: "q8",
    statement: "When taking a plug out of the wall, you should pull the wire.",
    isTrue: false,
    explanation: "You must hold the hard plastic plug. Tugging on the cord damages the wires inside the plastic cover. This damage can cause sparks or a fire later.",
  },
  {
    id: "q9",
    statement: "You should never put forks, keys, or any metal objects into a toaster or a wall socket.",
    isTrue: true,
    explanation: "Metal carries electricity very well. If a metal fork touches the electricity inside a toaster, the electricity will travel up the fork and shock you.",
  },
  {
    id: "q10",
    statement: "You must tell an adult immediately if a fan, computer, or charger smells like burning plastic or makes a popping sound.",
    isTrue: true,
    explanation: "Strange smells or popping noises mean the appliance is breaking and might start an electrical fire.",
  },
  {
    id: "q11",
    statement: "It is safe to keep your water bottle next to keyboards, tablets, or power strips on your desk.",
    isTrue: false,
    explanation: "Spilling a drink on electronics will break the machine and can cause a dangerous spark.",
  },
  {
    id: "q12",
    statement: "You must look up and check for overhead power lines before you fly a kite or climb a tree.",
    isTrue: true,
    explanation: "If a kite string or tree branch touches a power line, the strong electricity can travel down to you.",
  },
  {
    id: "q13",
    statement: "If a storm knocks down a power line in your neighborhood, you should stay away from it.",
    isTrue: true,
    explanation: "Fallen wires can still have live electricity flowing through them. Touching the wire or the ground nearby can cause a fatal shock.",
  },
  {
    id: "q14",
    statement: "You must get out of the swimming pool immediately if you hear thunder or see lightning.",
    isTrue: true,
    explanation: "Lightning is natural electricity. If it strikes the water, the electricity travels quickly through the pool and will shock anyone inside.",
  },
];

export default function SafetyGame() {
  const { stars, setStars } = useXP();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<{ kind: "correct" | "retry"; message: string } | null>(null);

  const correctCount = useMemo(() => {
    return QUESTIONS.filter((q) => answers[q.id] === q.isTrue).length;
  }, [answers]);

  const done = correctCount === QUESTIONS.length;

  function handleAnswer(qId: string, answer: boolean) {
    const question = QUESTIONS.find((q) => q.id === qId);
    if (!question) return;

    if (question.isTrue === answer) {
      setAnswers((prev) => ({ ...prev, [qId]: answer }));
      const newCount = Math.min(correctCount + 1, QUESTIONS.length);
      setStars("safety", newCount);
      setFeedback({ kind: "correct", message: "Correct! " + question.explanation });
    } else {
      setFeedback({ kind: "retry", message: "Not quite. Try thinking about why that might be dangerous or safe." });
    }
  }

  function reset() {
    setAnswers({});
    setStars("safety", 0);
  }

  return (
    <div className="space-y-4 pb-10">
      <header className="glass-strong p-5 sm:p-6 sticky top-0 z-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 sm:text-2xl">
              Working Safely with Electricity 🛡️
            </h1>
            <p className="mt-1 text-slate-600 text-sm sm:text-base">
              Read the rule and decide if it is True or False.
            </p>
          </div>
          <div className="shrink-0">
            <span className="pill text-sm">
              <span className="text-sun-500 text-lg" aria-hidden>★</span>
              {stars.safety} / {QUESTIONS.length}
            </span>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        {QUESTIONS.map((q, idx) => {
          const isAnsweredCorrectly = answers[q.id] !== undefined && answers[q.id] === q.isTrue;

          return (
            <div
              key={q.id}
              className={[
                "glass-strong p-5 transition-all duration-300",
                isAnsweredCorrectly ? "border-spark-300 bg-spark-50/60" : "border-transparent bg-white/70",
              ].join(" ")}
            >
              <div className="flex gap-3">
                <span className="pill shrink-0 self-start mt-0.5">Q{idx + 1}</span>
                <div className="space-y-4 w-full">
                  <p className="text-slate-800 font-medium text-base sm:text-lg">
                    {q.statement}
                  </p>
                  
                  {!isAnsweredCorrectly ? (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleAnswer(q.id, true)}
                        className="btn-primary bg-emerald-500 hover:bg-emerald-600 text-white flex-1 py-3"
                      >
                        True
                      </button>
                      <button
                        onClick={() => handleAnswer(q.id, false)}
                        className="btn-primary bg-rose-500 hover:bg-rose-600 text-white flex-1 py-3"
                      >
                        False
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800">
                      <p className="font-bold mb-1">
                        {q.isTrue ? "True!" : "False!"}
                      </p>
                      <p className="text-sm">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <div className="flex flex-wrap items-center gap-3 pt-6">
        <button className="btn-ghost" onClick={reset}>
          Start again
        </button>
      </div>

      {done && (
        <div className="glass-strong p-5 text-center mt-6">
          <p className="text-lg font-bold text-slate-800">
            Fantastic job! You know how to stay safe with electricity. 🌟
          </p>
        </div>
      )}

      {feedback && (
        <Feedback
          kind={feedback.kind}
          message={feedback.message}
          onDone={() => setFeedback(null)}
        />
      )}
    </div>
  );
}
