"use client";

import Image from "next/image";
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
import { deviceImages, type DeviceKey } from "@/lib/assets";
import { useXP } from "@/context/XPContext";
import { Feedback } from "@/components/Feedback";

type Zone = "mains" | "cells" | "non-electrical";

interface Item {
  id: DeviceKey;
  label: string;
  answer: Zone;
}

const ITEMS: Item[] = [
  // Mains
  { id: "ceilingLight", label: "Ceiling light", answer: "mains" },
  { id: "interactiveWhiteboard", label: "Interactive whiteboard", answer: "mains" },
  { id: "desktopComputer", label: "Desktop computer", answer: "mains" },
  { id: "television", label: "Television", answer: "mains" },
  { id: "electricFan", label: "Electric fan", answer: "mains" },
  // Cells
  { id: "flashlight", label: "Torch", answer: "cells" },
  { id: "remote", label: "Remote control", answer: "cells" },
  { id: "smallToyRobot", label: "Small toy robot", answer: "cells" },
  { id: "digitalCalculator", label: "Digital calculator", answer: "cells" },
  // Non-electrical
  { id: "whiteboard", label: "Whiteboard", answer: "non-electrical" },
  { id: "stapler", label: "Stapler", answer: "non-electrical" },
  { id: "broom", label: "Broom", answer: "non-electrical" },
  { id: "manualPencilSharpener", label: "Pencil sharpener", answer: "non-electrical" },
  { id: "diningTable", label: "Dining table", answer: "non-electrical" },
  { id: "scissors", label: "Scissors", answer: "non-electrical" },
];

const ZONES: { id: Zone; title: string; hint: string; emoji: string }[] = [
  { id: "mains", title: "Mains", hint: "Plugs into the wall.", emoji: "🔌" },
  { id: "cells", title: "Cells", hint: "Uses batteries.", emoji: "🔋" },
  { id: "non-electrical", title: "Non-electrical", hint: "Needs no power.", emoji: "🪑" },
];

/* Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SortingGame() {
  const { stars, setStars } = useXP();

  // Items always start in a random order
  const [order, setOrder] = useState<Item[]>(() => shuffle(ITEMS));
  const [placed, setPlaced] = useState<Record<DeviceKey, Zone | null>>(
    () => Object.fromEntries(ITEMS.map((i) => [i.id, null])) as Record<DeviceKey, Zone | null>
  );
  const [activeId, setActiveId] = useState<DeviceKey | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "correct" | "retry"; message: string } | null>(null);

  // Larger distance for pointer, shorter delay for touch so the whole card responds immediately
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 80, tolerance: 10 } })
  );

  const tray = useMemo(
    () => order.filter((i) => placed[i.id] === null),
    [placed, order]
  );

  function onDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as DeviceKey);
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const id = e.active.id as DeviceKey;
    const zone = e.over?.id as Zone | undefined;
    if (!zone) return;

    const item = ITEMS.find((x) => x.id === id)!;
    if (item.answer === zone) {
      setPlaced((p) => ({ ...p, [id]: zone }));
      const newCount = Math.min(stars.sorting + 1, ITEMS.length);
      setStars("sorting", newCount);
      setFeedback({ kind: "correct", message: "Nice sorting!" });
    } else {
      setFeedback({ kind: "retry", message: "Almost! Try another box." });
    }
  }

  const completed = ITEMS.every((i) => placed[i.id] !== null);

  function resetBoard() {
    setPlaced(Object.fromEntries(ITEMS.map((i) => [i.id, null])) as Record<DeviceKey, Zone | null>);
    setStars("sorting", 0);
    setOrder(shuffle(ITEMS));
  }

  function shuffleTray() {
    setOrder((prev) => shuffle(prev));
  }

  const active = activeId ? ITEMS.find((i) => i.id === activeId)! : null;

  return (
    <div className="space-y-5">
      <header className="glass-strong p-5 sm:p-6">
        <h1 className="text-xl font-extrabold text-slate-800 sm:text-2xl">
          Sort the Power 🔌
        </h1>
        <p className="mt-1 text-slate-600">
          Drag each thing into the right box.
        </p>
      </header>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        {/* Drop zones */}
        <section className="grid gap-3 sm:grid-cols-3">
          {ZONES.map((z) => (
            <DropZone
              key={z.id}
              zone={z}
              items={ITEMS.filter((i) => placed[i.id] === z.id)}
            />
          ))}
        </section>

        {/* Tray */}
        <section className="glass p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
            <h2 className="font-bold text-slate-800">Things to sort</h2>
            <div className="flex items-center gap-2">
              <span className="pill">
                <span aria-hidden>📦</span>
                {tray.length} left
              </span>
              {tray.length > 0 && (
                <button
                  className="btn-ghost text-sm py-1.5 px-3"
                  onClick={shuffleTray}
                  aria-label="Shuffle the items"
                >
                  🔀 Shuffle
                </button>
              )}
            </div>
          </div>

          {tray.length === 0 ? (
            <div className="rounded-xl bg-spark-50 p-5 text-center text-spark-700">
              <p className="font-bold text-lg">All sorted! ⭐</p>
              <p className="text-sm mt-1">You finished with {stars.sorting} stars.</p>
              <button className="btn-primary mt-4" onClick={resetBoard}>
                Play again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {tray.map((i) => (
                <DraggableItem key={i.id} item={i} />
              ))}
            </div>
          )}
        </section>

        <DragOverlay dropAnimation={null}>
          {active ? (
            <div className="glass-strong p-3 dragging shadow-2xl">
              <ItemCard item={active} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {completed && (
        <div className="glass-strong p-4 text-center">
          <p className="text-lg font-bold text-slate-800">
            Well done! You earned {stars.sorting} stars. 🌟
          </p>
        </div>
      )}

      {feedback && (
        <Feedback kind={feedback.kind} message={feedback.message} onDone={() => setFeedback(null)} />
      )}
    </div>
  );
}

/* ---------- helpers ---------- */

function DropZone({
  zone,
  items,
}: {
  zone: { id: Zone; title: string; hint: string; emoji: string };
  items: Item[];
}) {
  const { isOver, setNodeRef } = useDroppable({ id: zone.id });
  return (
    <div
      ref={setNodeRef}
      className={[
        "glass p-4 min-h-[200px] transition-all",
        isOver ? "ring-4 ring-spark-300 bg-spark-50/70 scale-[1.02]" : "",
      ].join(" ")}
    >
      <header className="mb-2 flex items-center gap-2">
        <span className="text-2xl" aria-hidden>{zone.emoji}</span>
        <h3 className="font-bold text-slate-800 text-base">{zone.title}</h3>
      </header>
      <p className="text-xs text-slate-500 mb-3">{zone.hint}</p>

      <div className="grid grid-cols-2 gap-2">
        {items.map((i) => (
          <div
            key={i.id}
            className="animate-pop rounded-xl bg-white/90 border border-white p-2 text-center shadow-glass"
          >
            <ItemCard item={i} small />
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="mt-2 flex items-center justify-center h-16 rounded-xl border-2 border-dashed border-slate-200 text-slate-300 text-sm">
          drop here
        </div>
      )}
    </div>
  );
}

function DraggableItem({ item }: { item: Item }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id });
  return (
    /*
     * The entire card — image + label — is the drag handle.
     * touch-none prevents the browser from intercepting scroll gestures
     * so the TouchSensor can fire reliably anywhere on the card.
     * min-h ensures a fat enough touch target for young fingers.
     */
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      role="button"
      aria-label={`Drag ${item.label}`}
      className={[
        "glass p-3 text-center select-none touch-none cursor-grab active:cursor-grabbing",
        "active:scale-[0.97] transition-all",
        isDragging ? "opacity-30" : "hover:shadow-lg",
      ].join(" ")}
      style={{ minHeight: 110 }}
    >
      <ItemCard item={item} />
    </div>
  );
}

function ItemCard({ item, small = false }: { item: Item; small?: boolean }) {
  const src = deviceImages[item.id];
  const size = small ? 56 : 88;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <Image
          src={src}
          alt={item.label}
          fill
          sizes={`${size}px`}
          className="object-contain pointer-events-none"
          draggable={false}
        />
      </div>
      <span
        className={[
          "font-semibold text-slate-700 leading-tight text-center",
          small ? "text-xs" : "text-sm",
        ].join(" ")}
      >
        {item.label}
      </span>
    </div>
  );
}
