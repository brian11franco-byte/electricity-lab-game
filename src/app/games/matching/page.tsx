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
import { conceptIcons, deviceImages, type ConceptKey, type DeviceKey } from "@/lib/assets";
import { useXP } from "@/context/XPContext";
import { Feedback } from "@/components/Feedback";

type SwitchId = "press" | "rocker" | "slide";

interface SwitchCard {
  id: SwitchId;
  label: string;
  image: ConceptKey; // image key
  examples: string;
}

const SWITCHES: SwitchCard[] = [
  {
    id: "rocker",
    label: "Rocker switch",
    image: "rockerSwitch",
    examples: "You flip it up or down — like for ceiling lights.",
  },
  {
    id: "press",
    label: "Press switch",
    image: "pressSwitch",
    examples:
      "You push a button — like for whiteboards, computers, TVs, remotes, and calculators.",
  },
  {
    id: "slide",
    label: "Slide switch",
    image: "slideSwitch",
    examples: "You slide it across — like on a small toy robot.",
  },
];

interface DeviceItem {
  id: DeviceKey;
  label: string;
  answers: SwitchId[];
}

const DEVICE_ITEMS: DeviceItem[] = [
  { id: "ceilingLight", label: "Ceiling light", answers: ["rocker"] },
  { id: "interactiveWhiteboard", label: "Interactive whiteboard", answers: ["press"] },
  { id: "desktopComputer", label: "Desktop computer", answers: ["press"] },
  { id: "television", label: "Television", answers: ["press"] },
  { id: "electricFan", label: "Electric fan", answers: ["press", "slide"] },
  { id: "flashlight", label: "Torch", answers: ["slide", "press"] },
  { id: "remote", label: "Remote control", answers: ["press"] },
  { id: "smallToyRobot", label: "Small toy robot", answers: ["slide"] },
  { id: "digitalCalculator", label: "Digital calculator", answers: ["press"] },
];

function shuffle<T>(arr: T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function MatchingGame() {
  const { stars, setStars } = useXP();
  
  // --- Phase 1: Matching ---
  const [pickedImage, setPickedImage] = useState<SwitchId | null>(null);
  const [matched, setMatched] = useState<Set<SwitchId>>(new Set());
  const [labels] = useState(() => shuffle(SWITCHES.map((s) => s.id)));

  // --- Phase 2: Sorting ---
  const [deviceOrder, setDeviceOrder] = useState<DeviceItem[]>(() => shuffle(DEVICE_ITEMS));
  const [placedDevices, setPlacedDevices] = useState<Record<DeviceKey, SwitchId | null>>(() => 
    Object.fromEntries(DEVICE_ITEMS.map(i => [i.id, null])) as Record<DeviceKey, SwitchId | null>
  );
  const [activeId, setActiveId] = useState<DeviceKey | null>(null);

  const [feedback, setFeedback] = useState<{
    kind: "correct" | "retry";
    message: string;
  } | null>(null);

  const phase1Done = matched.size === SWITCHES.length;
  const phase2Done = DEVICE_ITEMS.every((i) => placedDevices[i.id] !== null);

  const byId = useMemo(
    () => Object.fromEntries(SWITCHES.map((s) => [s.id, s])) as Record<SwitchId, SwitchCard>,
    []
  );

  const tray = useMemo(
    () => deviceOrder.filter((i) => placedDevices[i.id] === null),
    [placedDevices, deviceOrder]
  );

  // Drag Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 80, tolerance: 10 } })
  );

  // -- Phase 1 logic --
  function tapImage(id: SwitchId) {
    if (matched.has(id)) return;
    setPickedImage(id);
  }

  function tapLabel(id: SwitchId) {
    if (matched.has(id)) return;
    if (!pickedImage) {
      setFeedback({
        kind: "retry",
        message: "Tap a switch picture first.",
      });
      return;
    }
    if (pickedImage === id) {
      const next = new Set(matched);
      next.add(id);
      setMatched(next);
      setPickedImage(null);
      setStars("matching", next.size + Object.values(placedDevices).filter(v => v !== null).length);
      setFeedback({ kind: "correct", message: "Great match!" });
    } else {
      setFeedback({
        kind: "retry",
        message: "Not this one. Look at the picture again.",
      });
      setPickedImage(null);
    }
  }

  // -- Phase 2 logic --
  function onDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as DeviceKey);
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const id = e.active.id as DeviceKey;
    const zone = e.over?.id as SwitchId | undefined;
    if (!zone) return;

    const item = DEVICE_ITEMS.find((x) => x.id === id)!;
    if (item.answers.includes(zone)) {
      setPlacedDevices((p) => ({ ...p, [id]: zone }));
      const newMatchedSize = matched.size;
      const newPlacedCount = Object.values(placedDevices).filter(v => v !== null).length + 1;
      setStars("matching", newMatchedSize + newPlacedCount);
      setFeedback({ kind: "correct", message: "Good job!" });
    } else {
      setFeedback({ kind: "retry", message: "That device doesn't use this switch. Try again!" });
    }
  }

  function shuffleTray() {
    setDeviceOrder((prev) => shuffle(prev));
  }

  function reset() {
    setMatched(new Set());
    setPickedImage(null);
    setPlacedDevices(Object.fromEntries(DEVICE_ITEMS.map((i) => [i.id, null])) as Record<DeviceKey, SwitchId | null>);
    setDeviceOrder(shuffle(DEVICE_ITEMS));
    setStars("matching", 0);
  }

  const active = activeId ? DEVICE_ITEMS.find((i) => i.id === activeId)! : null;

  return (
    <div className="space-y-6">
      <header className="glass-strong p-5 sm:p-6">
        <h1 className="text-xl font-extrabold text-slate-800 sm:text-2xl">
          Switch Match 🔘
        </h1>
        <p className="mt-1 text-slate-600">
          Match the switch names, then sort the devices!
        </p>
      </header>

      {/* --- PHASE 1 --- */}
      <section className="glass p-4 sm:p-5">
        <h2 className="mb-3 font-bold text-slate-800">Part 1: Switch pictures</h2>
        <div className="grid grid-cols-3 gap-3">
          {SWITCHES.map((s) => {
            const isPicked = pickedImage === s.id;
            const isMatched = matched.has(s.id);
            return (
              <button
                key={s.id}
                onClick={() => tapImage(s.id)}
                disabled={isMatched}
                aria-pressed={isPicked}
                className={[
                  "glass-strong p-3 text-center transition",
                  isMatched
                    ? "opacity-60"
                    : isPicked
                    ? "ring-4 ring-spark-400 bg-spark-50"
                    : "hover:-translate-y-0.5",
                ].join(" ")}
              >
                <div className="relative mx-auto h-20 w-20 sm:h-24 sm:w-24">
                  <Image
                    src={conceptIcons[s.image]}
                    alt={s.label}
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                </div>
                {isMatched && (
                  <div className="mt-1 text-xs font-bold text-spark-700">
                    {s.label} ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="glass p-4 sm:p-5">
        <h2 className="mb-3 font-bold text-slate-800">Switch names</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {labels.map((id) => {
            const s = byId[id];
            const isMatched = matched.has(id);
            return (
              <button
                key={id}
                onClick={() => tapLabel(id)}
                disabled={isMatched}
                className={[
                  "glass-strong p-4 text-left transition",
                  isMatched
                    ? "opacity-60"
                    : "hover:-translate-y-0.5",
                ].join(" ")}
              >
                <div className="text-lg font-bold text-slate-800">
                  {s.label}
                </div>
                <p className="mt-1 text-sm text-slate-600">{s.examples}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* --- PHASE 2 --- */}
      {phase1Done && (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <section className="mt-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-800">
              Part 2: Sort devices into their switches
            </h2>
            
            <div className="grid gap-3 sm:grid-cols-3">
              {SWITCHES.map((s) => (
                <DropZone
                  key={s.id}
                  switchCard={s}
                  items={DEVICE_ITEMS.filter((i) => placedDevices[i.id] === s.id)}
                />
              ))}
            </div>

            <div className="glass p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
                <h3 className="font-bold text-slate-800">Devices to sort</h3>
                <div className="flex items-center gap-2">
                  <span className="pill">
                    <span aria-hidden>📦</span>
                    {tray.length} left
                  </span>
                  {tray.length > 0 && (
                    <button
                      className="btn-ghost text-sm py-1.5 px-3"
                      onClick={shuffleTray}
                      aria-label="Shuffle the devices"
                    >
                      🔀 Shuffle
                    </button>
                  )}
                </div>
              </div>

              {tray.length === 0 ? (
                <div className="rounded-xl bg-spark-50 p-5 text-center text-spark-700">
                  <p className="font-bold text-lg">All devices sorted! ⭐</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {tray.map((i) => (
                    <DraggableItem key={i.id} item={i} />
                  ))}
                </div>
              )}
            </div>
          </section>

          <DragOverlay dropAnimation={null}>
            {active ? (
              <div className="glass-strong p-3 dragging shadow-2xl">
                <ItemCard item={active} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-6">
        <span className="pill">
          <span className="text-sun-500" aria-hidden>
            ★
          </span>
          {stars.matching} for this game
        </span>
        <button className="btn-ghost" onClick={reset}>
          Start again
        </button>
      </div>

      {phase1Done && phase2Done && (
        <div className="glass-strong p-5 text-center mt-6">
          <p className="text-lg font-bold text-slate-800">
            Amazing! You mastered the switches. ⭐⭐⭐
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

/* ---------- helpers ---------- */

function DropZone({
  switchCard,
  items,
}: {
  switchCard: SwitchCard;
  items: DeviceItem[];
}) {
  const { isOver, setNodeRef } = useDroppable({ id: switchCard.id });
  return (
    <div
      ref={setNodeRef}
      className={[
        "glass p-4 min-h-[200px] transition-all flex flex-col",
        isOver ? "ring-4 ring-spark-300 bg-spark-50/70 scale-[1.02]" : "",
      ].join(" ")}
    >
      <header className="mb-4 flex flex-col items-center gap-2">
        <div className="relative h-12 w-12">
          <Image
            src={conceptIcons[switchCard.image]}
            alt={switchCard.label}
            fill
            sizes="48px"
            className="object-contain"
          />
        </div>
        <h3 className="font-bold text-slate-800 text-sm text-center">{switchCard.label}</h3>
      </header>

      <div className="grid grid-cols-2 gap-2 flex-grow">
        {items.map((i) => (
          <div
            key={i.id}
            className="animate-pop rounded-xl bg-white/90 border border-white p-2 text-center shadow-glass flex items-center justify-center"
          >
            <ItemCard item={i} small />
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="mt-2 flex items-center justify-center h-16 rounded-xl border-2 border-dashed border-slate-200 text-slate-300 text-sm flex-grow">
          drop here
        </div>
      )}
    </div>
  );
}

function DraggableItem({ item }: { item: DeviceItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      role="button"
      aria-label={`Drag ${item.label}`}
      className={[
        "glass p-3 text-center select-none touch-none cursor-grab active:cursor-grabbing",
        "active:scale-[0.97] transition-all flex flex-col items-center justify-center",
        isDragging ? "opacity-30" : "hover:shadow-lg",
      ].join(" ")}
      style={{ minHeight: 110 }}
    >
      <ItemCard item={item} />
    </div>
  );
}

function ItemCard({ item, small = false }: { item: DeviceItem; small?: boolean }) {
  const src = deviceImages[item.id];
  const size = small ? 48 : 80;
  return (
    <div className="flex flex-col items-center gap-1.5 w-full">
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
          "font-semibold text-slate-700 leading-tight text-center break-words w-full",
          small ? "text-[10px]" : "text-xs",
        ].join(" ")}
      >
        {item.label}
      </span>
    </div>
  );
}
