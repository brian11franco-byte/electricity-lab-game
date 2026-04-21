"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { generationImages, type GenerationKey } from "@/lib/assets";
import { useXP } from "@/context/XPContext";
import { Feedback } from "@/components/Feedback";

interface Step {
  id: GenerationKey;
  title: string;
  description: string;
}

const CORRECT_ORDER: GenerationKey[] = [
  "powerStation",
  "transmissionLines",
  "distributionLines",
  "house",
];

const STEPS: Record<GenerationKey, Step> = {
  powerStation: {
    id: "powerStation",
    title: "Power station",
    description:
      "It makes electricity by burning fuels to heat water. The water turns into steam to move turbines.",
  },
  transmissionLines: {
    id: "transmissionLines",
    title: "Transmission lines",
    description:
      "Electricity travels through very long wires, high in the air so that we are safe.",
  },
  distributionLines: {
    id: "distributionLines",
    title: "Distribution lines",
    description:
      "Electricity travels from transmission lines to more electrical posts to our houses.",
  },
  house: {
    id: "house",
    title: "Our house",
    description: "Electricity arrives at home so we can use it every day.",
  },
};

function shuffle<T>(arr: T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function SequencingGame() {
  const { stars, setStars } = useXP();
  const [order, setOrder] = useState<GenerationKey[]>(() =>
    shuffle(CORRECT_ORDER)
  );
  const [feedback, setFeedback] = useState<{
    kind: "correct" | "retry";
    message: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 6 },
    })
  );

  const isCorrect = useMemo(
    () => order.every((id, idx) => id === CORRECT_ORDER[idx]),
    [order]
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id as GenerationKey);
    const newIndex = order.indexOf(over.id as GenerationKey);
    setOrder((o) => arrayMove(o, oldIndex, newIndex));
  }

  function check() {
    if (isCorrect) {
      // Award 4 stars for completing the journey (cap one pass)
      setStars("sequencing", Math.max(stars.sequencing, 4));
      setFeedback({
        kind: "correct",
        message: "Perfect journey! ⭐⭐⭐⭐",
      });
    } else {
      setFeedback({
        kind: "retry",
        message: "Keep moving the pictures. Power station comes first.",
      });
    }
  }

  function shuffleAgain() {
    setOrder(shuffle(CORRECT_ORDER));
  }

  return (
    <div className="space-y-6">
      <header className="glass-strong p-5 sm:p-6">
        <h1 className="text-xl font-extrabold text-slate-800 sm:text-2xl">
          The Electricity Journey ⚡
        </h1>
        <p className="mt-1 text-slate-600">
          Drag the pictures left or right to put them in the right order.
        </p>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={order}
          strategy={horizontalListSortingStrategy}
        >
          <div className="glass p-3 sm:p-5">
            <div className="flex snap-x gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:gap-4">
              {order.map((id, idx) => (
                <SortableCard key={id} id={id} step={STEPS[id]} index={idx} />
              ))}
            </div>
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-primary" onClick={check}>
          Check my journey
        </button>
        <button className="btn-ghost" onClick={shuffleAgain}>
          Shuffle again
        </button>
        <span className="pill">
          <span className="text-sun-500" aria-hidden>
            ★
          </span>
          {stars.sequencing} for this game
        </span>
      </div>

      {isCorrect && (
        <div className="glass-strong p-5">
          <h2 className="text-lg font-bold text-slate-800">
            The whole story
          </h2>
          <ol className="mt-2 space-y-2 text-slate-700">
            {CORRECT_ORDER.map((id, i) => (
              <li key={id} className="flex gap-3">
                <span className="pill">{i + 1}</span>
                <span>
                  <span className="font-semibold">{STEPS[id].title}.</span>{" "}
                  {STEPS[id].description}
                </span>
              </li>
            ))}
          </ol>
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

function SortableCard({
  id,
  step,
  index,
}: {
  id: GenerationKey;
  step: Step;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const src = generationImages[id];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass-strong p-3 w-56 shrink-0 snap-start sm:w-auto"
    >
      <div className="flex items-center justify-between">
        <span className="pill">Step {index + 1}</span>
        <button
          {...listeners}
          {...attributes}
          className="btn-ghost px-2 py-1 text-xs"
          aria-label={`Move ${step.title}`}
        >
          ↔ Drag
        </button>
      </div>
      <div className="relative mx-auto mt-2 h-28 w-full sm:h-32">
        <Image
          src={src}
          alt={step.title}
          fill
          sizes="180px"
          className="object-contain"
        />
      </div>
      <h3 className="mt-2 font-bold text-slate-800">{step.title}</h3>
      <p className="text-xs text-slate-600 sm:text-sm">{step.description}</p>
    </div>
  );
}
