"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

/**
 * Global state for stars earned across the four games.
 *
 * One "star" ≈ one small win (correct answer, correctly placed image,
 * completed step). We keep the count per game so the dashboard can show
 * a progress picture — but the dashboard displays the total, too.
 */

export type GameId = "sorting" | "sequencing" | "matching" | "sentence";

export interface XPState {
  stars: Record<GameId, number>;
  bestStreak: number;
}

type XPAction =
  | { type: "add"; game: GameId; amount: number }
  | { type: "set"; game: GameId; amount: number }
  | { type: "reset" }
  | { type: "hydrate"; payload: XPState };

const STORAGE_KEY = "electricity-labs/xp/v1";

const initialState: XPState = {
  stars: { sorting: 0, sequencing: 0, matching: 0, sentence: 0 },
  bestStreak: 0,
};

function reducer(state: XPState, action: XPAction): XPState {
  switch (action.type) {
    case "add":
      return {
        ...state,
        stars: {
          ...state.stars,
          [action.game]: Math.max(0, state.stars[action.game] + action.amount),
        },
      };
    case "set":
      return {
        ...state,
        stars: { ...state.stars, [action.game]: Math.max(0, action.amount) },
      };
    case "reset":
      return initialState;
    case "hydrate":
      return action.payload;
    default:
      return state;
  }
}

interface XPContextValue extends XPState {
  totalStars: number;
  addStars: (game: GameId, amount: number) => void;
  setStars: (game: GameId, amount: number) => void;
  reset: () => void;
}

const XPContext = createContext<XPContextValue | undefined>(undefined);

export function XPProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as XPState;
        if (parsed && parsed.stars) {
          dispatch({ type: "hydrate", payload: { ...initialState, ...parsed } });
        }
      }
    } catch {
      // Ignore malformed storage — start fresh.
    }
  }, []);

  // Persist on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const totalStars = useMemo(
    () =>
      state.stars.sorting +
      state.stars.sequencing +
      state.stars.matching +
      state.stars.sentence,
    [state.stars]
  );

  const addStars = useCallback((game: GameId, amount: number) => {
    dispatch({ type: "add", game, amount });
  }, []);

  const setStars = useCallback((game: GameId, amount: number) => {
    dispatch({ type: "set", game, amount });
  }, []);

  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  const value: XPContextValue = {
    ...state,
    totalStars,
    addStars,
    setStars,
    reset,
  };

  return <XPContext.Provider value={value}>{children}</XPContext.Provider>;
}

export function useXP() {
  const ctx = useContext(XPContext);
  if (!ctx) throw new Error("useXP must be used inside <XPProvider>.");
  return ctx;
}
