import React from 'react';

interface BandDiagramProps {
  voltage: number;
  Vbi: number;
}

export const BandDiagram: React.FC<BandDiagramProps> = ({ voltage, Vbi }) => {
  // Qualitative representation
  // Barrier Height decreases with forward voltage
  const barrierHeight = Math.max(0.1, Vbi - voltage); // Clamped for visual
  const maxBarrier = 2.0; // Scale factor
  
  // Heights relative to SVG
  const h = 100;
  const mid = 50;
  const pBandY = mid + (barrierHeight * 20); // P side moves down relative to N? 
  // Wait: P-type has holes (valence band near fermi). N-type has electrons (conduction band near fermi).
  // Equilibrium: Fermi levels aligned.
  // Forward Bias (V>0): P side raised relative to N side. Barrier lowers.
  // Visual:
  // Left (P): Valence band is high.
  // Right (N): Valence band is low.
  // Step occurs in depletion.
  
  // Let's draw simpler: Conduction Band Edge
  // Left (P): Higher energy (electrons are minority)
  // Right (N): Lower energy (electrons are majority)
  // Equilibrium: Large step.
  // Forward: Step reduces.
  
  const stepHeight = Math.max(5, 50 - voltage * 20); 

  return (
    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur p-2 rounded border border-slate-300 shadow-sm w-32 h-24 pointer-events-none">
       <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-1">Band Diagram (Ec)</h4>
       <svg viewBox="0 0 100 60" className="w-full h-full">
          {/* Conduction Band Edge */}
          <path 
            d={`M 0 ${30 - stepHeight/2} L 40 ${30 - stepHeight/2} C 50 ${30 - stepHeight/2}, 50 ${30 + stepHeight/2}, 60 ${30 + stepHeight/2} L 100 ${30 + stepHeight/2}`} 
            fill="none" 
            stroke="#2563eb" 
            strokeWidth="2"
          />
          
          {/* Valence Band Edge (Parallel) */}
          <path 
            d={`M 0 ${50 - stepHeight/2} L 40 ${50 - stepHeight/2} C 50 ${50 - stepHeight/2}, 50 ${50 + stepHeight/2}, 60 ${50 + stepHeight/2} L 100 ${50 + stepHeight/2}`} 
            fill="none" 
            stroke="#dc2626" 
            strokeWidth="2"
          />

          {/* Barrier Label */}
          <line x1="50" y1={30 - stepHeight/2} x2="50" y2={30 + stepHeight/2} stroke="#475569" strokeWidth="1" strokeDasharray="2 1" />
          <text x="55" y="32" fontSize="8" fill="#475569">q(Vbi-V)</text>
       </svg>
    </div>
  );
};
