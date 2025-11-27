import { DopingLevel, DiodeParams, SimulationMode } from '../types';

export const THERMAL_VOLTAGE_VT = 0.026; // approx 26mV at 300K

export const getDiodeParams = (doping: DopingLevel): DiodeParams => {
  switch (doping) {
    case DopingLevel.LIGHT:
      return { Is: 1e-12, n: 1.1, Vbi: 0.60, Rs: 25, breakdownVoltage: -50 }; // High Rs for light doping
    case DopingLevel.HEAVY:
      return { Is: 1e-9, n: 1.5, Vbi: 0.85, Rs: 2, breakdownVoltage: -4.5 }; // Low Rs, Zener breakdown
    case DopingLevel.MODERATE:
    default:
      return { Is: 1e-11, n: 1.2, Vbi: 0.70, Rs: 10, breakdownVoltage: -20 };
  }
};

/**
 * Solves the diode equation V = Vd + I*Rs for I given V_applied.
 * Since I = Is(exp(Vd/nVt) - 1), this is transcendental.
 * We use a simple iterative Newton-Raphson or fixed point approach for the operating point.
 */
export const calculateCurrent = (voltage: number, params: DiodeParams, mode: SimulationMode): number => {
  const { Is, n, Rs, breakdownVoltage } = params;
  
  // 1. Ideal Mode Calculation
  if (mode === SimulationMode.IDEAL) {
    // Forward
    if (voltage >= 0) {
      return Is * (Math.exp(voltage / (n * THERMAL_VOLTAGE_VT)) - 1);
    } 
    // Reverse
    else {
      // Ideal breakdown? Let's assume ideal has no breakdown in the -5V range for simplicity, 
      // or sharp breakdown at -5V if we want to show it.
      // Let's keep ideal perfectly flat Is in reverse.
      return -Is;
    }
  }

  // 2. Non-Ideal Mode Calculation
  // Forward Bias with Series Resistance
  if (voltage >= 0) {
    // We need to find I such that f(I) = V - I*Rs - nVt*ln(I/Is + 1) = 0
    // Simplified approximation:
    // For small V, I is small, I*Rs is negligible -> Shockley.
    // For large V, Vd saturates? No, I becomes linear: I ~ (V - V_knee) / Rs.
    
    // Newton-Raphson iteration to solve for Vd (Voltage across junction)
    // V = Vd + Is * (exp(Vd/nVt) - 1) * Rs
    // Let f(Vd) = Vd + Is*Rs*(exp(Vd/nVt)-1) - V = 0
    let Vd = voltage; // Initial guess
    
    // 5 iterations is usually enough for display precision
    for (let i = 0; i < 10; i++) {
        const expTerm = Math.exp(Vd / (n * THERMAL_VOLTAGE_VT));
        const f = Vd + Is * Rs * (expTerm - 1) - voltage;
        const df = 1 + Is * Rs * expTerm / (n * THERMAL_VOLTAGE_VT);
        
        const nextVd = Vd - f / df;
        if (Math.abs(nextVd - Vd) < 1e-5) {
            Vd = nextVd;
            break;
        }
        Vd = nextVd;
    }
    
    // Clamp Vd to be safe
    if (Vd > voltage) Vd = voltage; 
    
    return Is * (Math.exp(Vd / (n * THERMAL_VOLTAGE_VT)) - 1);
  } 
  
  // Reverse Bias with Leakage and Soft Breakdown
  else {
    // Leakage component (linear) representing surface leakage / defects
    const leakageCurrent = voltage * 1e-8; // small conductance
    
    // Shockley reverse component
    const shockleyCurrent = Is * (Math.exp(voltage / (n * THERMAL_VOLTAGE_VT)) - 1); // ~ -Is
    
    // Breakdown component (soft knee)
    // Modeled as exponential increase beyond breakdown voltage
    let breakdownCurrent = 0;
    if (voltage < breakdownVoltage) {
        // e.g. -5V vs -4V breakdown
        const diff = breakdownVoltage - voltage; 
        breakdownCurrent = -Is * (Math.exp(diff * 2) - 1) * 1000; // *1000 for dramatic effect
    }
    
    return shockleyCurrent + leakageCurrent + breakdownCurrent;
  }
};

export const calculateDepletionFactor = (voltage: number, Vbi: number): number => {
  // Model: W ~ sqrt(Vbi - V)
  // We clamp V to avoid sqrt(negative) and singularity
  const V_effective = Math.min(voltage, Vbi - 0.05);
  const w = Math.sqrt(Vbi - V_effective) / Math.sqrt(Vbi);
  return Math.max(0.1, Math.min(3.0, w));
};

export const generateCurveData = (params: DiodeParams) => {
    const idealPoints = [];
    const nonIdealPoints = [];
    
    // Sweep voltage
    for (let v = -5.0; v <= 5.0; v += 0.1) {
        const vFixed = parseFloat(v.toFixed(2));
        idealPoints.push({
            v: vFixed,
            i: calculateCurrent(vFixed, params, SimulationMode.IDEAL) * 1000
        });
        nonIdealPoints.push({
            v: vFixed,
            i: calculateCurrent(vFixed, params, SimulationMode.NON_IDEAL) * 1000
        });
    }
    return { idealPoints, nonIdealPoints };
};
