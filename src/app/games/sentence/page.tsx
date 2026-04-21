"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useXP } from "@/context/XPContext";
import { Feedback } from "@/components/Feedback";

/**
 * Fill-in-the-blank with a drag-and-drop word bank.
 *
 * Mobile UX improvements:
 * - Word bank is sticky at the top so words are always in reach.
 * - autoScroll is enabled: when dragging near the bottom edge, the page
 *   scrolls automatically so students can reach sentences further down.
 * - Touch chips are bigger (px-4 py-3) for Grade 2 fingers.
 * - Drop zones are taller with a clear dashed outline.
 */

const BANK = [
  "cells",
  "distribution",
  "mains",
  "non-electrical",
  "power station",
  "press",
  "rocker",
  "steam",
  "transmission",
] as const;

type Word = (typeof BANK)[number];

interface Sentence {
  id: string;
  before: string;
  after: string;
  answer: Word;
}

const SENTENCES: Sentence[] = [
  {
    id: "s1",
    before: "A television needs to be plugged into the wall. It gets power from the",
    after: ".",
    answer: "mains",
  },
  {
    id: "s2",
    before: "A flashlight does not have a plug. It uses",
    after: "to work.",
    answer: "cells",
  },
  {
    id: "s3",
    before: "A scissors does not need power to cut paper. It is a",
    after: "tool.",
    answer: "non-electrical",
  },
  {
    id: "s4",
    before: "To turn on the ceiling light in the classroom, you push a",
    after: "switch.",
    answer: "rocker",
  },
  {
    id: "s5",
    before: "When you turn on a television using a remote control, you use a",
    after: "switch.",
    answer: "press",
  },
  {
    id: "s6",
    before: "A",
    after: "makes electricity by burning fuels to heat water.",
    answer: "power station",
  },
  {
    id: "s7",
    before: "Inside the power plant, the hot water turns into",
    after: "to move the turbines.",
    answer: "steam",
  },
  {
    id: "s8",
    before: "Electricity travels safely high in the air through long wires called",
    after: "lines.",
    answer: "transmission",
  },
  {
    id: "s9",
    before: "Finally, electricity travels through",
    after: "lines on wooden posts to reach our houses.",
    answer: "distribution",
  },
];

export default function SentenceGame() {
  const { stars, setStars } = useXP();
  const [placed, setPlaced] = useState<Record<string, Word | null>>(() =>
    Object.fromEntries(SENTENCES.map((s) => [s.id, null]))
  );
  const [activeWord, setActiveWord] = useState<Word | null>(null);
  const [feedback, setFeedback] = useState<{
    kind: "correct" | "retry";
    message: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    // Shorter delay + larger tolerance = word starts moving faster on fat-finger touch
    useSensor(TouchSensor, { activationConstraint: { delay: 60, tolerance: 12 } })
  );

  const correctCount = useMemo(
    () => SENTENCES.filter((s) => placed[s.id] === s.answer).length,
    [placed]
  );
  const done = correctCount === SENTENCES.length;

  function onDragStart(e: DragStartEvent) {
    setActiveWord(e.active.id as Word);
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveWord(null);
    const word = e.active.id as Word;
    const sentenceId = e.over?.id as string | undefined;
    if (!sentenceId) return;

    const sentence = SENTENCES.find((s) => s.id === sentenceId);
    if (!sentence) return;

    if (word === sentence.answer) {
      setPlaced((p) => ({ ...p, [sentenceId]: word }));
      const newCount = Math.min(correctCount + 1, SENTENCES.length);
      setStars("sentence", newCount);
      setFeedback({ kind: "correct", message: "That word fits!" });
    } else {
      setFeedback({ kind: "retry", message: "Try a different word." });
    }
  }

  function reset() {
    setPlaced(Object.fromEntries(SENTENCES.map((s) => [s.id, null])));
    setStars("sentence", 0);
  }

  return (
    <div className="space-y-4">
      <header className="glass-strong p-5 sm:p-6">
        <h1 className="text-xl font-extrabold text-slate-800 sm:text-2xl">
          Finish the Sentence ✍️
        </h1>
        <p className="mt-1 text-slate-600">
          Drag a word from the word bank into the blank space.
        </p>
      </header>

      {/*
        autoScroll: when the user drags near the top/bottom edge of the
        viewport, the page scrolls automatically — essential for reaching
        sentences below the fold on a small phone screen.
      */}
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        autoScroll={{ threshold: { x: 0.15, y: 0.15 }, acceleration: 20 }}
      >
        {/*
          Sticky word bank — always visible at the top while the student
          scrolls down to find the right sentence. This removes the need to
          drag from off-screen up to a sentence, which is very hard on mobile.
        */}
        <div className="sticky top-0 z-20">
          <section className="glass-strong p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                Word bank
              </h2>
              <span className="pill text-xs">
                <span className="text-sun-500" aria-hidden>★</span>
                {stars.sentence} / {SENTENCES.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {BANK.map((w) => (
                <DraggableWord key={w} word={w} isPlaced={Object.values(placed).includes(w)} />
              ))}
            </div>
          </section>
        </div>

        {/* Sentences */}
        <section className="space-y-3 pb-4">
          {SENTENCES.map((s, idx) => (
            <SentenceRow
              key={s.id}
              index={idx + 1}
              sentence={s}
              placed={placed[s.id]}
            />
          ))}
        </section>

        <DragOverlay dropAnimation={null}>
          {activeWord ? (
            <span className="inline-flex items-center justify-center rounded-xl bg-spark-500 text-white px-4 py-3 text-base font-bold shadow-2xl dragging">
              {activeWord}
            </span>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="flex flex-wrap items-center gap-3 pb-6">
        <button className="btn-ghost" onClick={reset}>
          Start again
        </button>
      </div>

      {done && (
        <div className="glass-strong p-5 text-center">
          <p className="text-lg font-bold text-slate-800">
            Great writing! You finished all {SENTENCES.length} sentences. 🌟
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

function DraggableWord({ word, isPlaced }: { word: Word; isPlaced: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: word });
  return (
    /*
     * touch-none: prevents the browser hijacking the touch for page scroll
     *             so the drag initiates reliably anywhere on the chip.
     * min-w + py-3: fat touch target for young users.
     */
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={[
        "touch-none select-none",
        "inline-flex items-center justify-center rounded-xl",
        "px-4 py-3 text-sm font-bold shadow-glass",
        "active:scale-[0.96] transition-all",
        isDragging
          ? "opacity-30 scale-95"
          : isPlaced
          ? "bg-spark-50 border border-spark-200 text-spark-400 cursor-default"
          : "bg-white border border-white text-slate-700 cursor-grab hover:bg-spark-50 hover:border-spark-200",
      ].join(" ")}
      aria-label={`Drag the word ${word}`}
    >
      {word}
    </button>
  );
}

function SentenceRow({
  index,
  sentence,
  placed,
}: {
  index: number;
  sentence: Sentence;
  placed: Word | null;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: sentence.id });
  const isDone = placed === sentence.answer;

  return (
    <div
      className={[
        "glass-strong p-4 sm:p-5 transition-all",
        isDone ? "border-spark-300 bg-spark-50/60" : "",
        isOver && !isDone ? "ring-2 ring-spark-300" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span className="pill shrink-0 mt-0.5">Q{index}</span>
        {/* Wrap text + drop zone together so the sentence reads naturally */}
        <p className="text-slate-800 leading-loose text-base">
          {sentence.before}{" "}
          {/* Drop zone — min-w and py make it easy to land on */}
          <span
            ref={setNodeRef}
            className={[
              "inline-flex min-w-[120px] min-h-[40px] items-center justify-center",
              "rounded-xl px-3 py-2 mx-1 align-middle font-semibold transition-all",
              isDone
                ? "bg-spark-500 text-white"
                : isOver
                ? "bg-spark-100 text-spark-700 border-2 border-spark-400 border-dashed scale-105"
                : "bg-white/80 text-slate-400 border-2 border-dashed border-slate-300",
            ].join(" ")}
          >
            {isDone ? placed : isOver ? "✓ drop!" : "drop here"}
          </span>{" "}
          {sentence.after}
        </p>
      </div>
    </div>
  );
}
