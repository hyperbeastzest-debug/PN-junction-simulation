import React from 'react';

interface CircuitViewProps {
  voltage: number;
  current: number; // in Amps
}

export const CircuitView: React.FC<CircuitViewProps> = ({ voltage, current }) => {
  // Determine battery polarity
  const isReverse = voltage < 0;
  const isForward = voltage > 0;
  const currentMag = Math.abs(current * 1000); // mA for visualization scaling
  
  // Animation speed based on current magnitude
  // If current is tiny (reverse leakage), animation is very slow or static
  const animationDuration = currentMag < 0.01 ? 0 : Math.max(0.5, 3 - Math.log10(currentMag + 1));
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col items-center">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 w-full text-left">Circuit View (Macroscopic)</h3>
      
      <div className="relative w-full h-32 flex items-center justify-center">
        <svg viewBox="0 0 300 120" className="w-full h-full">
            <defs>
                <marker id="arrowHead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
                </marker>
            </defs>
            
            {/* Wires */}
            <rect x="30" y="20" width="240" height="80" rx="4" fill="none" stroke="#64748b" strokeWidth="3" />
            
            {/* Battery Symbol (Bottom) */}
            {/* Clearing line for battery */}
            <line x1="130" y1="100" x2="170" y2="100" stroke="white" strokeWidth="6" /> 
            
            <g transform="translate(150, 100)">
                {isReverse ? (
                    // Reverse Polarity: P side (Left) gets Negative
                    <>
                         {/* Left is Negative (Short bar), Right is Positive (Long bar) */}
                         <line x1="-10" y1="-10" x2="-10" y2="10" stroke="#2563eb" strokeWidth="4" /> {/* Negative */}
                         <line x1="10" y1="-18" x2="10" y2="18" stroke="#dc2626" strokeWidth="4" />   {/* Positive */}
                         <text x="-25" y="5" fontSize="16" fill="#2563eb" fontWeight="bold">-</text>
                         <text x="25" y="5" fontSize="16" fill="#dc2626" fontWeight="bold">+</text>
                    </>
                ) : (
                    // Forward Polarity: P side (Left) gets Positive
                    <>
                        {/* Left is Positive (Long bar), Right is Negative (Short bar) */}
                        <line x1="-10" y1="-18" x2="-10" y2="18" stroke="#dc2626" strokeWidth="4" /> {/* Positive */}
                        <line x1="10" y1="-10" x2="10" y2="10" stroke="#2563eb" strokeWidth="4" />   {/* Negative */}
                        <text x="-25" y="5" fontSize="16" fill="#dc2626" fontWeight="bold">+</text>
                        <text x="25" y="5" fontSize="16" fill="#2563eb" fontWeight="bold">-</text>
                    </>
                )}
            </g>

            {/* Diode Symbol (Top) */}
            {/* Clearing line for diode */}
            <line x1="130" y1="20" x2="170" y2="20" stroke="white" strokeWidth="6" />
            <g transform="translate(150, 20)">
                {/* Triangle pointing Right (P->N) */}
                <polygon points="-10,-10 -10,10 10,0" fill="#1e293b" stroke="#1e293b" strokeWidth="2" />
                {/* Bar */}
                <line x1="10" y1="-10" x2="10" y2="10" stroke="#1e293b" strokeWidth="3" />
                {/* Labels */}
                <text x="-15" y="-15" fontSize="10" fill="#dc2626" fontWeight="bold">P</text>
                <text x="15" y="-15" fontSize="10" fill="#2563eb" fontWeight="bold">N</text>
            </g>

            {/* Resistor (Right Side - Simplified) */}
            <g transform="translate(270, 60)">
               <rect x="-5" y="-20" width="10" height="40" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
               <text x="10" y="5" fontSize="10" fill="#64748b">R</text>
            </g>

            {/* Current Animation */}
            {currentMag > 0.001 && (
                <circle r={3 + Math.min(3, currentMag/50)} fill="#16a34a">
                    <animateMotion 
                        dur={`${animationDuration === 0 ? 0 : Math.max(0.2, 1/Math.sqrt(currentMag))}s`} 
                        repeatCount="indefinite"
                        // Clockwise for forward (P->N->...), Counter-Clockwise (electron flow vs conventional... wait conventional flows P->N external circuit + to -)
                        // Battery: Long bar is +.
                        // Forward Bias: Left is +, Right is -. Current leaves Left(+), goes Top through Diode(P->N), goes Right, enters Right(-).
                        // So Forward = Clockwise.
                        // Reverse = Counter-Clockwise (if breakdown).
                        path={isReverse 
                            ? "M 150 100 L 30 100 L 30 20 L 270 20 L 270 100 Z"  // Counter-Clockwise (roughly) - actually Breakdown current flows N->P internally so + to - externally?
                            // Wait, Reverse Bias: Battery Left(-), Right(+). Current leaves Right(+), goes Bottom->Right->Top->Diode(N->P)->Left->Battery(-). 
                            // So actually Counter-Clockwise.
                            : "M 150 100 L 270 100 L 270 20 L 30 20 L 30 100 Z" // Clockwise
                        }
                    />
                </circle>
            )}
        </svg>
      </div>

      <div className="flex justify-between w-full text-xs font-mono text-slate-500 mt-2 px-4">
        <span>V_source: {voltage.toFixed(2)} V</span>
        <span className={isForward ? 'text-green-600 font-bold' : isReverse ? 'text-blue-600 font-bold' : ''}>
           I: {(current*1000).toFixed(2)} mA
        </span>
      </div>
    </div>
  );
};
