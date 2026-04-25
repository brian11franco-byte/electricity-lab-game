export type ComponentType = 'battery' | 'wire' | 'bulb' | 'switch' | 'buzzer';

export interface CircuitComponentLogic {
  id: string;
  type: ComponentType;
  voltage: number;      // V
  resistance: number;   // Ohms
  isOpen?: boolean;     // For switches
  isBroken?: boolean;   // For blown bulbs
  maxCurrent?: number;  // Amps threshold before breaking
}

export interface CircuitSimulationResult {
  totalVoltage: number;
  totalResistance: number;
  current: number;
  isShortCircuit: boolean;
  brokenComponents: string[];
}

export const defaultComponents = {
  battery: { type: 'battery', voltage: 9, resistance: 1 },
  wire: { type: 'wire', voltage: 0, resistance: 0.1 },
  bulb: { type: 'bulb', voltage: 0, resistance: 15, maxCurrent: 1.2 }, // 2x 9V is ~1.05A, 3x 9V is ~1.5A (breaks)
  switch: { type: 'switch', voltage: 0, resistance: 0.1, isOpen: false },
  buzzer: { type: 'buzzer', voltage: 0, resistance: 100, maxCurrent: 0.5 },
};

/**
 * Calculates the current and checks for broken components in a series loop.
 * You would run this every time the user connects or disconnects a piece.
 */
export function analyzeSeriesCircuit(components: CircuitComponentLogic[]): CircuitSimulationResult {
  let totalVoltage = 0;
  let totalResistance = 0;
  const brokenComponents: string[] = [];

  // 1. Calculate total voltage and resistance
  components.forEach(comp => {
    totalVoltage += comp.voltage;
    
    if (comp.type === 'switch' && comp.isOpen) {
       totalResistance += 999999; 
    } else if (comp.isBroken) {
       totalResistance += 999999;
    } else {
       totalResistance += comp.resistance;
    }
  });

  // 2. Calculate current using Ohm's Law (I = V / R)
  let current = totalResistance > 0 ? totalVoltage / totalResistance : 0;

  // 3. Define a short circuit (High current, very low resistance other than battery internal resistance)
  // E.g., 9V battery with just wires (1 ohm internal + 0.1 ohm wires) yields ~8-9 Amps.
  const isShortCircuit = current > 5.0;

  // 4. Check for blown components
  components.forEach(comp => {
    if (comp.maxCurrent && current > comp.maxCurrent && !comp.isBroken) {
      brokenComponents.push(comp.id);
    }
  });

  // If a component just broke, current stops in reality, but we return the calculated 
  // current so the frontend knows how severe the overload was before cutting it off.
  if (brokenComponents.length > 0) {
     current = 0; 
  }

  return {
    totalVoltage,
    totalResistance,
    current,
    isShortCircuit,
    brokenComponents
  };
}

/**
 * Helper to calculate Power (Brightness/Volume) for a specific component.
 * P = I^2 * R
 */
export function calculateComponentPower(current: number, component: CircuitComponentLogic): number {
  if (component.isBroken || (component.type === 'switch' && component.isOpen)) {
    return 0;
  }
  return (current * current) * component.resistance;
}
