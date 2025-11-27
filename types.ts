export enum DopingLevel {
  LIGHT = 'Lightly Doped',
  MODERATE = 'Moderately Doped',
  HEAVY = 'Heavily Doped',
}

export enum AnimationSpeed {
  VERY_SLOW = 0.2,
  SLOW = 0.5,
  NORMAL = 1,
  FAST = 2.5,
}

export enum SimulationMode {
  IDEAL = 'Ideal Diode',
  NON_IDEAL = 'Non-Ideal Diode',
}

export interface DiodeParams {
  Is: number; // Saturation current (Amps)
  n: number;  // Ideality factor
  Vbi: number; // Built-in potential (Volts)
  Rs: number; // Series resistance (Ohms)
  breakdownVoltage: number; // Volts (negative)
}

export interface Carrier {
  id: number;
  type: 'hole' | 'electron';
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
}
