import React, { useRef, useEffect } from 'react';
import { calculateDepletionFactor } from '../utils/physics';
import { DiodeParams, AnimationSpeed } from '../types';
import { BandDiagram } from './BandDiagram';

interface DiodeCanvasProps {
  voltage: number;
  params: DiodeParams;
  isPlaying: boolean;
  speed: AnimationSpeed;
  showBandDiagram: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'hole' | 'electron';
}

export const DiodeCanvas: React.FC<DiodeCanvasProps> = ({ voltage, params, isPlaying, speed, showBandDiagram }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  
  // Constants
  const WIDTH = 800;
  const HEIGHT = 300;
  const CENTER_X = WIDTH / 2;
  const BASE_DEPLETION_WIDTH = 120; // pixels at equilibrium
  const NUM_PARTICLES = 120; // per type

  // Initialize particles
  useEffect(() => {
    const initParticles = () => {
      const p: Particle[] = [];
      let pid = 0;
      
      // Create Holes (P-side majority)
      for (let i = 0; i < NUM_PARTICLES; i++) {
        p.push({
          id: pid++,
          x: Math.random() * (CENTER_X - 10), 
          y: Math.random() * HEIGHT,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          type: 'hole',
        });
      }

      // Create Electrons (N-side majority)
      for (let i = 0; i < NUM_PARTICLES; i++) {
        p.push({
          id: pid++,
          x: CENTER_X + 10 + Math.random() * (CENTER_X - 20),
          y: Math.random() * HEIGHT,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          type: 'electron',
        });
      }
      particlesRef.current = p;
    };

    if (particlesRef.current.length === 0) {
      initParticles();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // 1. Physics Calculations
      const depletionFactor = calculateDepletionFactor(voltage, params.Vbi);
      const currentDepletionWidth = BASE_DEPLETION_WIDTH * depletionFactor;
      const depletionLeft = CENTER_X - currentDepletionWidth / 2;
      const depletionRight = CENTER_X + currentDepletionWidth / 2;
      
      // Bias effects
      // Forward Bias (V > 0): Drift Force pushing carriers towards junction
      // Reverse Bias (V < 0): Drift Force pulling carriers away
      const biasFieldStrength = voltage * 0.15; 
      
      // Barrier Potential simulation
      // Even with forward bias, crossing is probabilistic based on energy
      // We simulate this by only allowing particles with enough random velocity or field push to cross
      // Or simply by creating a "Bounce" zone
      
      const effectiveBarrierHeight = Math.max(0, params.Vbi - voltage);

      // 2. Clear & Draw Background
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // P-Region (Left)
      const pGradient = ctx.createLinearGradient(0, 0, CENTER_X, 0);
      pGradient.addColorStop(0, '#ffe4e6'); // Rose-100
      pGradient.addColorStop(1, '#fecdd3'); // Rose-200
      ctx.fillStyle = pGradient;
      ctx.fillRect(0, 0, CENTER_X, HEIGHT);

      // N-Region (Right)
      const nGradient = ctx.createLinearGradient(CENTER_X, 0, WIDTH, 0);
      nGradient.addColorStop(0, '#bfdbfe'); // Blue-200
      nGradient.addColorStop(1, '#dbeafe'); // Blue-100
      ctx.fillStyle = nGradient;
      ctx.fillRect(CENTER_X, 0, CENTER_X, HEIGHT);

      // Depletion Region
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // Neutral whitish
      ctx.fillRect(depletionLeft, 0, currentDepletionWidth, HEIGHT);
      
      // Depletion Borders
      ctx.beginPath();
      ctx.moveTo(depletionLeft, 0);
      ctx.lineTo(depletionLeft, HEIGHT);
      ctx.moveTo(depletionRight, 0);
      ctx.lineTo(depletionRight, HEIGHT);
      ctx.strokeStyle = '#64748b';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Update & Draw Particles
      if (isPlaying) {
        particlesRef.current.forEach(p => {
          // Thermal Motion
          p.x += p.vx * speed;
          p.y += p.vy * speed;

          // Boundary Reflection (Top/Bottom)
          if (p.y < 0 || p.y > HEIGHT) p.vy *= -1;

          // Bias Drift
          if (p.type === 'hole') {
             // Holes in P side (x < CENTER_X) pushed Right if Forward Bias
             // Holes in N side (x > CENTER_X) pushed Right (Minority drift) ?? 
             // Actually: Forward Bias (+ on P, - on N). E-field is P->N. 
             // Holes pushed P->N. Electrons pushed N->P.
             
             // Simplistic visual logic:
             p.x += biasFieldStrength * speed;

             // Barrier Interaction (The Depletion Zone Repulsion)
             // If V < Vbi, there is still a barrier repelling majority carriers.
             // We simulate repulsion if they enter depletion zone without enough "energy"
             // Simplified: Hard bounce if voltage is low and random chance fails
             
             // Check if entering depletion from Left
             if (p.x > depletionLeft && p.x < CENTER_X) {
                // Probabilistic bounce based on barrier height
                if (Math.random() * 2.0 < effectiveBarrierHeight) {
                    p.vx = -Math.abs(p.vx); // Bounce back left
                    p.x = depletionLeft - 1;
                }
             }
             
             // Loop/Recombination
             if (p.x > WIDTH) {
                p.x = 0; // Wrap to simulate circuit
                p.y = Math.random() * HEIGHT;
             }
             if (p.x < 0) p.x = WIDTH;
          } 
          else {
             // Electrons
             p.x -= biasFieldStrength * speed; // Move Left in Forward Bias

             // Barrier Interaction (Entering from Right)
             if (p.x < depletionRight && p.x > CENTER_X) {
                if (Math.random() * 2.0 < effectiveBarrierHeight) {
                    p.vx = Math.abs(p.vx); // Bounce back right
                    p.x = depletionRight + 1;
                }
             }

             if (p.x < 0) {
                 p.x = WIDTH;
                 p.y = Math.random() * HEIGHT;
             }
             if (p.x > WIDTH) p.x = 0;
          }
        });
      }

      // Draw Particles
      particlesRef.current.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.type === 'hole' ? '#dc2626' : '#2563eb'; 
        ctx.fill();
      });

      // 4. Overlays
      // Region Labels
      ctx.fillStyle = 'rgba(220, 38, 38, 0.1)'; // faint red text bg
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#991b1b';
      ctx.fillText("P-Type (Holes)", 20, 30);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#1e40af';
      ctx.fillText("N-Type (Electrons)", WIDTH - 20, 30);
      
      // Depletion Label
      ctx.textAlign = 'center';
      if (currentDepletionWidth > 40) {
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText("Depletion Region", CENTER_X, HEIGHT - 15);
        
        // Width arrows
        ctx.beginPath();
        ctx.moveTo(depletionLeft, HEIGHT - 25);
        ctx.lineTo(depletionRight, HEIGHT - 25);
        ctx.strokeStyle = '#475569';
        ctx.stroke();
      }

      // Current Vector Overlay
      const currentMag = Math.abs(voltage); 
      if (currentMag > 0.2) {
         ctx.save();
         ctx.translate(CENTER_X, HEIGHT / 2);
         const arrowLen = Math.min(150, currentMag * 40);
         
         if (voltage > 0) {
            // Forward Current Arrow (Green)
            ctx.shadowColor = "rgba(0,0,0,0.2)";
            ctx.shadowBlur = 4;
            ctx.fillStyle = `rgba(22, 163, 74, ${Math.min(0.9, currentMag/2)})`;
            ctx.font = 'bold 18px Inter, sans-serif';
            ctx.fillText("Diffusion Current", 0, -20);
            
            ctx.beginPath();
            ctx.moveTo(-arrowLen, 0);
            ctx.lineTo(arrowLen, 0);
            ctx.lineTo(arrowLen - 10, -6);
            ctx.lineTo(arrowLen - 10, 6);
            ctx.lineTo(arrowLen, 0);
            ctx.strokeStyle = `rgba(22, 163, 74, ${Math.min(0.9, currentMag/2)})`;
            ctx.lineWidth = 4 + currentMag;
            ctx.stroke();
         } else if (voltage < -0.1) {
            // Reverse Leakage/Breakdown
            // Drift Current (Minority)
            // Usually represented as small arrows opposite to diffusion?
            // Net current is small and flows N -> P (conventional). 
            // Here we show electron/hole drift.
            
            ctx.fillStyle = `rgba(37, 99, 235, 0.6)`;
            ctx.font = '14px Inter, sans-serif';
            if (voltage > -4) ctx.fillText("Drift (Minority)", 0, -20);
            else {
                ctx.fillStyle = '#dc2626';
                ctx.fillText("Breakdown!", 0, -20);
            }
         }
         ctx.restore();
      }

      frameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [voltage, params, isPlaying, speed]);

  return (
    <div className="w-full bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden relative">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 flex justify-between items-center">
         <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Junction Visualization</span>
         <div className="text-xs text-slate-400 italic">
            {voltage === 0 ? "Equilibrium" : voltage > 0 ? "Forward Bias" : "Reverse Bias"}
         </div>
      </div>
      <div className="relative">
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={300} 
            className="w-full h-auto block bg-white"
          />
          {showBandDiagram && <BandDiagram voltage={voltage} Vbi={params.Vbi} />}
      </div>
      
      {/* Caption Footer */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-center text-sm text-slate-600">
         {voltage === 0 && "Dynamic Equilibrium: Diffusion and Drift currents balance exactly."}
         {voltage > 0 && "Barrier potential is lowered, allowing majority carriers to diffuse across."}
         {voltage < 0 && voltage > params.breakdownVoltage && "Barrier potential increased. Only minority carrier drift (leakage) flows."}
         {voltage <= params.breakdownVoltage && "Breakdown Voltage reached! Massive current flows."}
      </div>
    </div>
  );
};
