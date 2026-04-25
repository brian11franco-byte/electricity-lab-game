"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { BatteryIcon, BulbIcon, BuzzerIcon, SwitchIcon, WireIcon } from "./CircuitComponents";
import { useXP } from "@/context/XPContext";

import { ComponentType, CircuitComponentLogic, defaultComponents, analyzeSeriesCircuit, calculateComponentPower } from "@/lib/circuitSolver";

interface CircuitComponent extends CircuitComponentLogic {
  x: number;
  y: number;
  active?: boolean;
  intensity?: number; // For bulb brightness
}

interface WireEnd {
  compId: string;
  term: number;
}

interface CircuitWire {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  startNode: WireEnd | null;
  endNode: WireEnd | null;
  active?: boolean;
}

const TERMINAL_OFFSET: Record<ComponentType, { x: number, y: number }[]> = {
  battery: [
    { x: 15, y: 30 }, // Negative
    { x: 85, y: 30 }, // Positive
  ],
  bulb: [
    { x: 30, y: 92 }, // Terminal A
    { x: 50, y: 92 }, // Terminal B
  ],
  buzzer: [
    { x: 20, y: 65 }, // Terminal A
    { x: 60, y: 65 }, // Terminal B
  ],
  switch: [
    { x: 20, y: 46 }, // Terminal A
    { x: 80, y: 46 }, // Terminal B
  ],
  wire: [], // Wires don't have component terminals in this context
};

const MISSIONS = [
  { id: 1, text: "Mission 1: Make the light bulb turn on!" },
  { id: 2, text: "Mission 2: Add a switch to control the light." },
  { id: 3, text: "Mission 3: Make the light super bright by using 2 batteries!" },
  { id: 4, text: "Mission 4: Connect two components directly together without a wire!" },
  { id: 5, text: "Mission 5: Add a Buzzer to your circuit to make some noise!" },
];

export default function CircuitBuilder() {
  const { addStars } = useXP();
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [wires, setWires] = useState<CircuitWire[]>([]);
  const [draggingComp, setDraggingComp] = useState<string | null>(null);
  const [draggingWire, setDraggingWire] = useState<{ id: string, end: 'start' | 'end' | 'both' } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showCurrent, setShowCurrent] = useState(true);
  const [missionIndex, setMissionIndex] = useState(0);
  const [circuitStatus, setCircuitStatus] = useState<"working" | "broken" | "idle" | "short" | "overload">("idle");
  const [hasDirectConnection, setHasDirectConnection] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [longPressCompId, setLongPressCompId] = useState<string | null>(null);

  // Helper to get actual coordinates of a terminal
  const getTermPos = useCallback((compId: string, term: number) => {
    const comp = components.find(c => c.id === compId);
    if (!comp) return { x: 0, y: 0 };
    const offset = TERMINAL_OFFSET[comp.type][term];
    return { x: comp.x + offset.x, y: comp.y + offset.y };
  }, [components]);

  // Handle adding components
  const addComponent = (type: ComponentType | 'wire') => {
    const id = Math.random().toString(36).substr(2, 9);
    const scrollLeft = canvasRef.current?.scrollLeft || 0;
    const scrollTop = canvasRef.current?.scrollTop || 0;
    const spawnX = (200 + scrollLeft) / zoom;
    const spawnY = (200 + scrollTop) / zoom;

    if (type === 'wire') {
      setWires([...wires, { 
        id, 
        x1: spawnX, y1: spawnY, 
        x2: spawnX + 80, y2: spawnY,
        startNode: null, endNode: null
      }]);
    } else {
      const logicDefaults = defaultComponents[type as ComponentType];
      setComponents([...components, { 
        ...logicDefaults,
        id, 
        type, 
        x: spawnX, 
        y: spawnY,
        isOpen: type === "switch" ? true : undefined
      }]);
    }
  };

  const toggleSwitch = (id: string) => {
    setComponents(prev => prev.map(c => 
      c.id === id && c.type === "switch" ? { ...c, isOpen: !c.isOpen } : c
    ));
  };

  const deleteWire = (id: string) => {
    setWires(prev => prev.filter(w => w.id !== id));
    setSelectedWireId(null);
  };

  const deleteComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
    // Disconnect wires attached to this component
    setWires(prev => prev.map(w => ({
      ...w,
      startNode: w.startNode?.compId === id ? null : w.startNode,
      endNode: w.endNode?.compId === id ? null : w.endNode,
    })));
  };

  // Circuit Solver
  useEffect(() => {
    if (components.length === 0) {
      setCircuitStatus("idle");
      return;
    }

    const adj: Record<string, { to: string; term: number; fromTerm: number; wireId: string }[]> = {};
    components.forEach((c) => { adj[c.id] = []; });

    wires.forEach((wire) => {
      if (wire.startNode && wire.endNode) {
        adj[wire.startNode.compId].push({ to: wire.endNode.compId, term: wire.endNode.term, fromTerm: wire.startNode.term, wireId: wire.id });
        adj[wire.endNode.compId].push({ to: wire.startNode.compId, term: wire.startNode.term, fromTerm: wire.endNode.term, wireId: wire.id });
      }
    });

    // Direct Component connections (Magnetic Snap)
    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const c1 = components[i];
        const c2 = components[j];
        for (let t1 = 0; t1 < TERMINAL_OFFSET[c1.type].length; t1++) {
          for (let t2 = 0; t2 < TERMINAL_OFFSET[c2.type].length; t2++) {
             const p1 = { x: c1.x + TERMINAL_OFFSET[c1.type][t1].x, y: c1.y + TERMINAL_OFFSET[c1.type][t1].y };
             const p2 = { x: c2.x + TERMINAL_OFFSET[c2.type][t2].x, y: c2.y + TERMINAL_OFFSET[c2.type][t2].y };
             if (Math.hypot(p1.x - p2.x, p1.y - p2.y) < 20) {
                adj[c1.id].push({ to: c2.id, term: t2, fromTerm: t1, wireId: 'direct' });
                adj[c2.id].push({ to: c1.id, term: t1, fromTerm: t2, wireId: 'direct' });
             }
          }
        }
      }
    }

    const newActiveComps = new Set<string>();
    const newActiveWires = new Set<string>();
    const batteries = components.filter((c) => c.type === "battery" && !c.isBroken);

    batteries.forEach((bat) => {
      const visited = new Set<string>();
      
      const dfs = (currId: string, currTerm: number, targetId: string, targetTerm: number, pathComps: string[], pathWires: string[]): boolean => {
        const comp = components.find(c => c.id === currId);
        if (!comp) return false;

        if (comp.type === "switch" && comp.isOpen) return false;
        if (comp.isBroken) return false;

        const stateKey = `${currId}-${currTerm}`;
        if (visited.has(stateKey)) return false;
        visited.add(stateKey);

        const connectionsFromThisTerm = adj[currId].filter(n => n.fromTerm === currTerm);
        let foundLoop = false;
        
        for (const conn of connectionsFromThisTerm) {
          if (conn.to === targetId && conn.term === targetTerm) {
            [...pathComps, conn.to].forEach(id => newActiveComps.add(id));
            [...pathWires, conn.wireId].forEach(id => newActiveWires.add(id));
            foundLoop = true;
          } else {
            const neighborOtherTerm = conn.term === 0 ? 1 : 0;
            if (dfs(conn.to, neighborOtherTerm, targetId, targetTerm, [...pathComps, conn.to], [...pathWires, conn.wireId])) {
              foundLoop = true;
            }
          }
        }
        
        visited.delete(stateKey); // Allow other paths to visit this node
        return foundLoop;
      };

      dfs(bat.id, 1, bat.id, 0, [bat.id], []);
    });

    // --- PHYSICS SOLVER INTEGRATION ---
    let simResult: ReturnType<typeof analyzeSeriesCircuit> | null = null;
    const newBrokenComps = new Set<string>();

    if (newActiveComps.size > 0) {
      const activeCompsData = Array.from(newActiveComps)
        .map(id => components.find(c => c.id === id))
        .filter(Boolean) as CircuitComponent[];
        
      const activeWiresData = Array.from(newActiveWires)
        .filter(id => id !== 'direct')
        .map(id => ({ ...defaultComponents.wire, id })) as unknown as CircuitComponent[];

      const loopComponents = [...activeCompsData, ...activeWiresData];
      simResult = analyzeSeriesCircuit(loopComponents);

      simResult.brokenComponents.forEach(id => newBrokenComps.add(id));
    }

    // Determine status
    if (simResult?.isShortCircuit) {
      setCircuitStatus("short");
    } else if (newBrokenComps.size > 0 || Array.from(newActiveComps).some(id => components.find(c => c.id === id)?.isBroken)) {
      setCircuitStatus("overload");
    } else if (newActiveComps.size > 1) {
      setCircuitStatus("working");
    } else {
      const hasDirectConnectionCheck = Object.values(adj).some(edges => edges.length > 0);
      const hasAttemptedConnection = wires.some(w => w.startNode || w.endNode) || hasDirectConnectionCheck;
      setCircuitStatus(hasAttemptedConnection ? "broken" : "idle");
    }

    // Update Components
    setComponents(prev => {
      let changed = false;
      const next = prev.map(c => {
        let isBroken = c.isBroken || newBrokenComps.has(c.id);
        const isActive = newActiveComps.has(c.id) && !isBroken && (simResult ? simResult.current > 0 : false);
        
        let nextIntensity = undefined;
        if (isActive && simResult) {
          const power = calculateComponentPower(simResult.current, c);
          if (c.type === 'bulb') {
            nextIntensity = power > 10 ? (power > 20 ? 3 : 2) : 1;
          } else if (c.type === 'buzzer') {
            nextIntensity = power > 2 ? 2 : 1;
          }
        }

        if (c.active !== isActive || c.intensity !== nextIntensity || c.isBroken !== isBroken) {
          changed = true;
        }
        return { ...c, active: isActive, intensity: nextIntensity, isBroken };
      });
      return changed ? next : prev;
    });

    // Update Wires
    setWires(prev => {
      let changed = false;
      const next = prev.map(w => {
        const isActive = newActiveWires.has(w.id) && (simResult ? simResult.current > 0 : false) && !simResult?.isShortCircuit;
        if (w.active !== isActive) changed = true;
        return { ...w, active: isActive };
      });
      return changed ? next : prev;
    });

    // Set state for mission 4
    const directConnectionFound = Object.values(adj).some(edges => edges.some(e => e.wireId === 'direct'));
    setHasDirectConnection(directConnectionFound);

  }, [wires, components.length, components.map(c => c.isOpen).join(",")]);

  // Gamification logic
  useEffect(() => {
    if (missionIndex === 0) {
      // Mission 1: Light the bulb
      const bulbOn = components.some(c => c.type === 'bulb' && c.active);
      if (bulbOn) {
        setMissionIndex(1);
        addStars("builder", 1);
      }
    } else if (missionIndex === 1) {
      // Mission 2: Switch controls light
      const hasSwitch = components.some(c => c.type === 'switch');
      const bulbOn = components.some(c => c.type === 'bulb' && c.active);
      if (hasSwitch && bulbOn) {
        setMissionIndex(2);
        addStars("builder", 1);
      }
    } else if (missionIndex === 2) {
      // Mission 3: 2 batteries
      const activeBatteries = components.filter(c => c.type === 'battery' && c.active).length;
      const bulbOn = components.some(c => c.type === 'bulb' && c.active);
      if (activeBatteries >= 2 && bulbOn) {
        setMissionIndex(3); 
        addStars("builder", 1);
      }
    } else if (missionIndex === 3) {
      // Mission 4: direct connection
      if (hasDirectConnection && circuitStatus === 'working') {
        setMissionIndex(4);
        addStars("builder", 1);
      }
    } else if (missionIndex === 4) {
      // Mission 5: buzzer
      const buzzerOn = components.some(c => c.type === 'buzzer' && c.active);
      if (buzzerOn) {
        setMissionIndex(5);
        addStars("builder", 1);
      }
    }
  }, [components, circuitStatus, hasDirectConnection]);


  // Mouse Handlers
  const handleCompMouseDown = (id: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDraggingComp(id);
    setSelectedWireId(null);
  };

  const handleWireMouseDown = (id: string, end: 'start' | 'end' | 'both', e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setDraggingWire({ id, end });
    setSelectedWireId(id);
    
    // If we grab an end, disconnect it
    if (end !== 'both') {
      setWires(prev => prev.map(w => {
        if (w.id === id) {
          const nodeToClear = end === 'start' ? 'startNode' : 'endNode';
          return { ...w, [nodeToClear]: null };
        }
        return w;
      }));
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setMousePos({ x, y });

    if (draggingComp) {
      let newX = x - 40;
      let newY = y - 30;
      let snapped = false;

      const draggedComp = components.find(c => c.id === draggingComp);
      if (draggedComp) {
        const terms = TERMINAL_OFFSET[draggedComp.type];
        
        // Check all other components to see if we can snap
        for (const other of components) {
          if (other.id === draggingComp) continue;
          
          const otherTerms = TERMINAL_OFFSET[other.type];
          for (let i = 0; i < terms.length; i++) {
            for (let j = 0; j < otherTerms.length; j++) {
               const myTermPos = { x: newX + terms[i].x, y: newY + terms[i].y };
               const otherTermPos = { x: other.x + otherTerms[j].x, y: other.y + otherTerms[j].y };
               
               if (Math.hypot(myTermPos.x - otherTermPos.x, myTermPos.y - otherTermPos.y) < 30) {
                 // Snap!
                 newX = otherTermPos.x - terms[i].x;
                 newY = otherTermPos.y - terms[i].y;
                 snapped = true;
                 break;
               }
            }
            if (snapped) break;
          }
          if (snapped) break;
        }
      }

      setComponents((prev) =>
        prev.map((c) => (c.id === draggingComp ? { ...c, x: newX, y: newY } : c))
      );
    } else if (draggingWire) {
      setWires((prev) =>
        prev.map((w) => {
          if (w.id !== draggingWire.id) return w;
          if (draggingWire.end === 'start') {
            return { ...w, x1: x, y1: y };
          } else if (draggingWire.end === 'end') {
            return { ...w, x2: x, y2: y };
          } else {
            // Drag the whole wire (rough approximation, keeping length)
            const dx = x - (w.x1 + w.x2) / 2;
            const dy = y - (w.y1 + w.y2) / 2;
            return { ...w, x1: w.x1 + dx, y1: w.y1 + dy, x2: w.x2 + dx, y2: w.y2 + dy };
          }
        })
      );
    }
  }, [draggingComp, draggingWire, zoom, components]);

  const handleMouseUp = () => {
    if (draggingWire && draggingWire.end !== 'both') {
      // Check for snapping
      const wire = wires.find(w => w.id === draggingWire.id);
      if (wire) {
        const x = draggingWire.end === 'start' ? wire.x1 : wire.x2;
        const y = draggingWire.end === 'start' ? wire.y1 : wire.y2;
        
        let snappedNode: WireEnd | null = null;
        
        // Find nearest terminal
        for (const comp of components) {
          const terms = TERMINAL_OFFSET[comp.type];
          for (let i = 0; i < terms.length; i++) {
            const termPos = getTermPos(comp.id, i);
            const dist = Math.sqrt(Math.pow(termPos.x - x, 2) + Math.pow(termPos.y - y, 2));
            if (dist < 30) {
              snappedNode = { compId: comp.id, term: i };
              break;
            }
          }
          if (snappedNode) break;
        }

        if (snappedNode) {
          setWires(prev => prev.map(w => {
            if (w.id === draggingWire.id) {
              const nodeToSet = draggingWire.end === 'start' ? 'startNode' : 'endNode';
              return { ...w, [nodeToSet]: snappedNode };
            }
            return w;
          }));
        }
      }
    }

    setDraggingComp(null);
    setDraggingWire(null);
  };

  // ── Touch Helpers ──────────────────────────────────────────
  const getTouchCanvasPos = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0] || e.changedTouches[0];
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (touch.clientX - rect.left) / zoom,
      y: (touch.clientY - rect.top) / zoom,
    };
  }, [zoom]);

  const handleCompTouchStart = (id: string, e: React.TouchEvent) => {
    e.stopPropagation();
    setSelectedWireId(null);
    setLongPressCompId(null);
    // Start long-press timer — 500ms hold reveals delete badge
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      setLongPressCompId(id);
      setDraggingComp(null);
    }, 500);
    setDraggingComp(id);
  };

  const handleCanvasTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // prevent page scrolling while dragging
    const { x, y } = getTouchCanvasPos(e);
    setMousePos({ x, y });

    // Cancel long press if finger moved
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setLongPressCompId(null);

    if (draggingComp) {
      let newX = x - 40;
      let newY = y - 30;
      let snapped = false;

      const draggedComp = components.find(c => c.id === draggingComp);
      if (draggedComp) {
        const terms = TERMINAL_OFFSET[draggedComp.type];
        for (const other of components) {
          if (other.id === draggingComp) continue;
          const otherTerms = TERMINAL_OFFSET[other.type];
          for (let i = 0; i < terms.length; i++) {
            for (let j = 0; j < otherTerms.length; j++) {
              const myTermPos = { x: newX + terms[i].x, y: newY + terms[i].y };
              const otherTermPos = { x: other.x + otherTerms[j].x, y: other.y + otherTerms[j].y };
              if (Math.hypot(myTermPos.x - otherTermPos.x, myTermPos.y - otherTermPos.y) < 30) {
                newX = otherTermPos.x - terms[i].x;
                newY = otherTermPos.y - terms[i].y;
                snapped = true;
                break;
              }
            }
            if (snapped) break;
          }
          if (snapped) break;
        }
      }
      setComponents(prev => prev.map(c => c.id === draggingComp ? { ...c, x: newX, y: newY } : c));
    } else if (draggingWire) {
      setWires(prev => prev.map(w => {
        if (w.id !== draggingWire.id) return w;
        if (draggingWire.end === 'start') return { ...w, x1: x, y1: y };
        if (draggingWire.end === 'end') return { ...w, x2: x, y2: y };
        const dx = x - (w.x1 + w.x2) / 2;
        const dy = y - (w.y1 + w.y2) / 2;
        return { ...w, x1: w.x1 + dx, y1: w.y1 + dy, x2: w.x2 + dx, y2: w.y2 + dy };
      }));
    }
  }, [draggingComp, draggingWire, zoom, components, getTouchCanvasPos]);

  const handleCanvasTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    handleMouseUp(); // reuse snap-to-terminal logic
  };

  const handleWireTouchStart = (id: string, end: 'start' | 'end' | 'both', e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingWire({ id, end });
    setSelectedWireId(id);
    if (end !== 'both') {
      setWires(prev => prev.map(w => {
        if (w.id === id) {
          const nodeToClear = end === 'start' ? 'startNode' : 'endNode';
          return { ...w, [nodeToClear]: null };
        }
        return w;
      }));
    }
  };


  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 font-sans">
      {/* Sidebar Toolbar */}
      <div className="w-full lg:w-24 flex lg:flex-col gap-1.5 glass-strong p-3 items-center overflow-x-auto lg:overflow-y-auto shrink-0 z-10">
        <h3 className="hidden lg:block text-[10px] uppercase font-bold text-slate-500 mb-1">Tools</h3>
        <button onClick={() => addComponent("battery")} className="tool-btn group">
          <div className="tool-icon"><BatteryIcon /></div>
          <span className="tool-label">Battery</span>
        </button>
        <button onClick={() => addComponent("bulb")} className="tool-btn group">
          <div className="tool-icon"><BulbIcon /></div>
          <span className="tool-label">Bulb</span>
        </button>
        <button onClick={() => addComponent("switch")} className="tool-btn group">
          <div className="tool-icon"><SwitchIcon isOpen={true} /></div>
          <span className="tool-label">Switch</span>
        </button>
        <button onClick={() => addComponent("buzzer")} className="tool-btn group">
          <div className="tool-icon"><BuzzerIcon /></div>
          <span className="tool-label">Buzzer</span>
        </button>
        <button onClick={() => addComponent("wire")} className="tool-btn group">
          <div className="tool-icon"><WireIcon /></div>
          <span className="tool-label">Wire</span>
        </button>
        <div className="lg:mt-auto ml-auto lg:ml-0 lg:pt-4 lg:border-t w-16 lg:w-full flex flex-col gap-2 shrink-0">
           <button onClick={() => { setComponents([]); setWires([]); setMissionIndex(0); setCircuitStatus("idle"); }} className="tool-btn text-red-500 hover:bg-red-50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span className="text-[10px]">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col relative min-w-0 min-h-0 bg-sky-50/30 rounded-2xl border-2 border-sky-100 shadow-inner overflow-hidden">
        <div 
          ref={canvasRef}
          className="flex-1 relative overflow-auto cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleCanvasTouchMove}
          onTouchEnd={handleCanvasTouchEnd}
          onClick={() => setSelectedWireId(null)}
        >
          <div 
            style={{ 
              width: "3000px", 
              height: "3000px", 
              transform: `scale(${zoom})`, 
              transformOrigin: "top left" 
            }}
            className="relative"
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <pattern id="grid-thick" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(14, 165, 233, 0.1)" strokeWidth="1"/>
                </pattern>
                <pattern id="grid-thin" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(14, 165, 233, 0.05)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-thin)" />
              <rect width="100%" height="100%" fill="url(#grid-thick)" />

              {/* Wires */}
              {wires.map((wire) => {
                const p1 = wire.startNode ? getTermPos(wire.startNode.compId, wire.startNode.term) : { x: wire.x1, y: wire.y1 };
                const p2 = wire.endNode ? getTermPos(wire.endNode.compId, wire.endNode.term) : { x: wire.x2, y: wire.y2 };
                const isSelected = selectedWireId === wire.id;
                
                return (
                  <g key={wire.id} className="pointer-events-auto">
                    {/* Hit area for selecting the wire */}
                    <path
                      d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
                      stroke="transparent"
                      strokeWidth="20"
                      fill="none"
                      cursor="pointer"
                      onClick={(e) => { e.stopPropagation(); setSelectedWireId(wire.id); }}
                      onMouseDown={(e) => handleWireMouseDown(wire.id, 'both', e)}
                    />
                    {/* Main wire visual */}
                    <path
                      d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
                      stroke={isSelected ? "#3b82f6" : (wire.active ? "#f59e0b" : "#475569")}
                      strokeWidth={isSelected ? "8" : "6"}
                      strokeLinecap="round"
                      fill="none"
                      className="transition-colors duration-300 pointer-events-none"
                    />
                    {/* Electrons */}
                    {wire.active && showCurrent && (
                      <path
                        d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
                        stroke="#fff"
                        strokeWidth="2"
                        strokeDasharray="4 12"
                        fill="none"
                        className="animate-[dash_1s_linear_infinite] pointer-events-none"
                      />
                    )}
                    
                    {/* Draggable Endpoints — larger touch hit areas */}
                    {/* Visual endpoint p1 */}
                    <circle 
                      cx={p1.x} cy={p1.y} r="12" 
                      fill={wire.startNode ? "#fcd34d" : "#60a5fa"} 
                      stroke={wire.startNode ? "#d97706" : "#1d4ed8"} strokeWidth="2" 
                      className="pointer-events-none"
                    />
                    {/* Touch/click hit area p1 */}
                    <circle 
                      cx={p1.x} cy={p1.y} r="24" 
                      fill="transparent"
                      cursor="grab"
                      onMouseDown={(e) => handleWireMouseDown(wire.id, 'start', e)}
                      onTouchStart={(e) => handleWireTouchStart(wire.id, 'start', e)}
                    />
                    {/* Visual endpoint p2 */}
                    <circle 
                      cx={p2.x} cy={p2.y} r="12" 
                      fill={wire.endNode ? "#fcd34d" : "#60a5fa"} 
                      stroke={wire.endNode ? "#d97706" : "#1d4ed8"} strokeWidth="2" 
                      className="pointer-events-none"
                    />
                    {/* Touch/click hit area p2 */}
                    <circle 
                      cx={p2.x} cy={p2.y} r="24" 
                      fill="transparent"
                      cursor="grab"
                      onMouseDown={(e) => handleWireMouseDown(wire.id, 'end', e)}
                      onTouchStart={(e) => handleWireTouchStart(wire.id, 'end', e)}
                    />

                    {/* Scissors UI */}
                    {isSelected && (
                      <foreignObject 
                        x={(p1.x + p2.x) / 2 - 15} 
                        y={(p1.y + p2.y) / 2 - 15} 
                        width="30" 
                        height="30"
                      >
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteWire(wire.id); }}
                          className="bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform flex items-center justify-center cursor-pointer"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
                        </button>
                      </foreignObject>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Components */}
            {components.map((comp) => (
              <div
                key={comp.id}
                style={{ left: comp.x, top: comp.y }}
                className="absolute cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => handleCompMouseDown(comp.id, e)}
                onTouchStart={(e) => handleCompTouchStart(comp.id, e)}
                onClick={(e) => {
                  if (comp.type === "switch") {
                    e.stopPropagation();
                    toggleSwitch(comp.id);
                  }
                  // Dismiss long-press badge on any tap
                  if (longPressCompId === comp.id) setLongPressCompId(null);
                }}
              >
                <div className="relative group">
                  <div className="transition-transform group-hover:scale-105 duration-200">
                    {comp.type === "battery" && <BatteryIcon active={comp.active} />}
                    {comp.type === "bulb" && <BulbIcon active={comp.active} intensity={comp.intensity} isBroken={comp.isBroken} />}
                    {comp.type === "buzzer" && <BuzzerIcon active={comp.active} isBroken={comp.isBroken} />}
                    {comp.type === "switch" && <SwitchIcon isOpen={comp.isOpen || false} active={comp.active} />}
                  </div>
                  
                  {/* Delete button — hover on desktop, long-press badge on touch */}
                  <button 
                    className={`absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg z-20 flex items-center justify-center transition-all duration-200 ${
                      longPressCompId === comp.id
                        ? "opacity-100 scale-110"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                    onClick={(e) => { e.stopPropagation(); deleteComponent(comp.id); setLongPressCompId(null); }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                  {/* Long-press hint label */}
                  {longPressCompId === comp.id && (
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shadow">Tap ✕ to delete</div>
                  )}

                  {/* Terminals */}
                  {TERMINAL_OFFSET[comp.type].map((offset: {x: number, y: number}, i: number) => (
                    <div
                      key={i}
                      style={{ left: offset.x - 10, top: offset.y - 10 }}
                      className="absolute w-5 h-5 rounded-full border-2 border-slate-400 bg-slate-200 z-10 shadow-sm transition-transform hover:scale-125"
                      onMouseDown={(e) => {
                        // Prevent dragging component when clicking terminal
                        e.stopPropagation();
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Zoom Controls Overlay */}
        <div className="absolute bottom-4 right-4 glass px-3 py-2 flex items-center gap-2 rounded-xl text-slate-600 shadow-md">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1 hover:bg-white rounded shadow-sm flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <span className="w-12 text-center font-mono text-xs">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1 hover:bg-white rounded shadow-sm flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-full lg:w-72 glass-strong p-5 flex flex-col gap-6 shrink-0 z-10 overflow-y-auto">
        
        {/* Status Area */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            Status
          </h3>
          {circuitStatus === "working" && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-green-800 flex items-start gap-3 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span className="text-sm"><strong>Great job!</strong> Electricity is flowing perfectly through your circuit.</span>
            </div>
          )}
          {circuitStatus === "overload" && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-red-800 flex items-start gap-3 shadow-sm">
              <span className="text-xl shrink-0">💥</span>
              <span className="text-sm"><strong>Too much power!</strong> The current was too high and broke a component. Try removing a battery or adding more resistance!</span>
            </div>
          )}
          {circuitStatus === "short" && (
            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-300 text-yellow-800 flex items-start gap-3 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
              <span className="text-sm"><strong>Short Circuit!</strong> Electricity is flowing without doing any work. The wires will get hot! Add a component like a bulb.</span>
            </div>
          )}
          {circuitStatus === "broken" && (
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 text-orange-800 flex items-start gap-3 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span className="text-sm"><strong>Circuit is broken.</strong> Make sure your wires connect the battery to other components in a loop.</span>
            </div>
          )}
          {circuitStatus === "idle" && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 flex items-start gap-3 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span className="text-sm">Drag a battery, a bulb, and some wires to get started!</span>
            </div>
          )}
        </div>

        {/* Missions */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            Missions
          </h3>
          <div className="space-y-2">
            {MISSIONS.map((mission, index) => (
              <div 
                key={mission.id}
                className={`p-3 rounded-xl border text-sm transition-all duration-500
                  ${index < missionIndex 
                    ? "bg-green-500 text-white border-green-600" 
                    : index === missionIndex 
                      ? "bg-blue-50 text-blue-900 border-blue-200 shadow-sm font-medium" 
                      : "bg-slate-50 text-slate-400 border-slate-100"}`}
              >
                {mission.text}
              </div>
            ))}
            {missionIndex >= MISSIONS.length && (
              <div className="text-center text-sm font-bold text-yellow-600 animate-bounce pt-4">
                🎉 All Missions Complete! 🎉
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
            Settings
          </h3>
          <label className="flex items-center justify-between cursor-pointer group mb-4">
            <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Show Current</span>
            <div className="relative inline-flex items-center">
              <input 
                type="checkbox" 
                checked={showCurrent} 
                onChange={() => setShowCurrent(!showCurrent)} 
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </label>
        </div>
      </div>

      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -16;
          }
        }
        .tool-btn {
          width: 4.5rem;
          height: 5.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.2rem;
          border-radius: 0.75rem;
          background-color: white;
          border: 2px solid #f1f5f9;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          transition: all 0.2s;
          cursor: pointer;
          flex-shrink: 0;
          padding: 0.25rem 0;
          overflow: hidden;
        }
        .tool-btn:hover {
          border-color: #60a5fa;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
        }
        .tool-btn:active {
          transform: scale(0.95);
        }
        .tool-icon {
          width: 3rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .tool-icon > svg {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .tool-label {
          font-size: 0.6rem;
          line-height: 1;
          text-align: center;
          color: #475569;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .glass-strong {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 1.5rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
      `}</style>
    </div>
  );
}
