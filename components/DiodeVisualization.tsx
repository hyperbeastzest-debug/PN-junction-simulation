import React from 'react';
import { DiodeParams } from '../types';
import { calculateDepletionFactor } from '../utils/physics';

interface DiodeVisualizationProps {
  voltage: number;
  params: DiodeParams;
}

export const DiodeVisualization: React.FC<DiodeVisualizationProps> = ({ voltage, params }) => {
  const widthFactor = calculateDepletionFactor(voltage, params.Vbi);
  
  // Base width in pixels for the depletion region at equilibrium
  const baseDepletionPx = 80;
  const currentDepletionWidth = baseDepletionPx * widthFactor;

  // Visualization dimensions
  const totalWidth = 600;
  const height = 200;
  const halfWidth = totalWidth / 2;

  // Generate static positions for carriers (dots)
  // We use a pseudo-random seed based on index to keep them static during re-renders
  const generateCarriers = (type: 'p' | 'n') => {
    const dots = [];
    const count = 60;
    const startX = type === 'p' ? 20 : halfWidth + 20;
    const endX = type === 'p' ? halfWidth - 20 : totalWidth - 20;

    for (let i = 0; i < count; i++) {
      // Simple pseudo-random distribution
      const r1 = Math.sin(i * 12.9898) * 43758.5453;
      const r2 = Math.cos(i * 12.9898) * 43758.5453;
      
      const x = startX + (Math.abs(r1) % (endX - startX));
      const y = 20 + (Math.abs(r2) % (height - 40));
      
      dots.push(
        <circle 
          key={`${type}-${i}`} 
          cx={x} 
          cy={y} 
          r={4} 
          fill={type === 'p' ? '#ef4444' : '#3b82f6'} 
          opacity={0.6}
        />
      );
      
      // Charge symbols
      dots.push(
        <text
          key={`sym-${type}-${i}`}
          x={x}
          y={y + 2.5}
          textAnchor="middle"
          fontSize="8"
          fill="white"
          pointerEvents="none"
          fontWeight="bold"
        >
          {type === 'p' ? '+' : '-'}
        </text>
      );
    }
    return dots;
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4 border border-slate-200 flex flex-col items-center">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">PN Junction Visualization</h3>
      
      <div className="relative overflow-hidden rounded-lg border-2 border-slate-800" style={{ width: '100%', maxWidth: '600px' }}>
        <svg viewBox={`0 0 ${totalWidth} ${height}`} className="w-full h-auto bg-slate-50">
          {/* P-Type Region Background */}
          <rect x="0" y="0" width={halfWidth} height={height} fill="#fee2e2" />
          
          {/* N-Type Region Background */}
          <rect x={halfWidth} y="0" width={halfWidth} height={height} fill="#dbeafe" />

          {/* Labels */}
          <text x="20" y="30" className="text-xl font-bold fill-red-800 opacity-50">P-Type (Holes)</text>
          <text x={totalWidth - 20} y="30" textAnchor="end" className="text-xl font-bold fill-blue-800 opacity-50">N-Type (Electrons)</text>

          {/* Carriers */}
          {generateCarriers('p')}
          {generateCarriers('n')}

          {/* Depletion Region Overlay */}
          {/* This rectangle sits in the middle and represents the depletion zone. 
              As it grows, it covers the carriers. We use a gradient to make it look like a barrier. */}
          <defs>
            <linearGradient id="depletionGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#fee2e2" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#e2e8f0" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.9" />
            </linearGradient>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
            </marker>
          </defs>

          <rect 
            x={halfWidth - currentDepletionWidth / 2} 
            y="0" 
            width={currentDepletionWidth} 
            height={height} 
            fill="url(#depletionGrad)"
            stroke="#94a3b8"
            strokeDasharray="4 2"
          />

          {/* Depletion Width Label */}
          <line 
            x1={halfWidth - currentDepletionWidth / 2} 
            y1={height - 20} 
            x2={halfWidth + currentDepletionWidth / 2} 
            y2={height - 20} 
            stroke="#475569" 
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
            markerStart="url(#arrowhead)" // Note: markerStart needs a reversed arrow in real SVG, simplifying here
          />
          <text x={halfWidth} y={height - 30} textAnchor="middle" fontSize="12" fill="#475569" fontWeight="bold">
            Depletion Region (W)
          </text>
        </svg>

        {/* Applied Voltage Indicator Overlay */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white/80 px-3 py-1 rounded-full text-xs font-mono font-bold border border-slate-300">
          E-Field Direction {voltage > 0 ? '→ (Opposes Built-in)' : '← (Aids Built-in)'}
        </div>
      </div>
      
      <div className="mt-2 text-sm text-slate-500 text-center">
        {voltage === 0 
          ? "Unbiased: Equilibrium established. Drift = Diffusion." 
          : voltage > 0 
            ? "Forward Bias: Barrier lowered. Carriers cross junction."
            : "Reverse Bias: Barrier heightened. Depletion region widens."}
      </div>
    </div>
  );
};