import React from 'react';
import { DiodeParams, SimulationMode } from '../types';
import { calculateDepletionFactor } from '../utils/physics';

interface ExplanationPanelProps {
  voltage: number;
  params: DiodeParams;
  biasType: string;
  mode: SimulationMode;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ voltage, params, biasType, mode }) => {
  const depletionFactor = calculateDepletionFactor(voltage, params.Vbi);
  
  let depletionDesc = "Medium (Equilibrium)";
  if (depletionFactor > 1.2) depletionDesc = "Wide (Reverse Bias)";
  else if (depletionFactor < 0.8) depletionDesc = "Narrow (Forward Bias)";

  const isBreakdown = voltage <= params.breakdownVoltage;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-700">Physics Explanation</h3>
        <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">JEE Advanced</span>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto text-slate-700 space-y-4 text-sm leading-relaxed">
        
        {/* Dynamic State Header */}
        <div className="pb-3 border-b border-slate-100">
             <h4 className="font-bold text-indigo-700 mb-1">{biasType}</h4>
             <ul className="text-xs text-slate-500 space-y-1">
                 <li>• Depletion Width: <span className="font-semibold text-slate-700">{depletionDesc}</span></li>
                 <li>• Potential Barrier: <span className="font-semibold text-slate-700">{(params.Vbi - (voltage > 0 ? voltage : 0)).toFixed(2)} V (approx)</span></li>
             </ul>
        </div>

        {biasType === 'Unbiased' && (
           <>
            <p>
              <strong>Equilibrium:</strong> The Fermi levels of P and N sides align. 
              The diffusion of majority carriers (holes from P, electrons from N) is exactly balanced by the drift of minority carriers driven by the built-in electric field.
            </p>
            <div className="bg-indigo-50 p-3 rounded border border-indigo-100 text-xs">
              <strong>Key Concept:</strong> No net current flows because drift current = - diffusion current.
            </div>
           </>
        )}

        {biasType.includes('Forward') && (
           <>
            <p>
              <strong>Forward Bias:</strong> Applied voltage V opposes the built-in potential (V<sub>bi</sub>). The effective barrier height becomes V<sub>bi</sub> - V.
            </p>
            <p>
              This lowering of the barrier allows an exponential number of majority carriers to diffuse across the junction.
              <br/>
              I ∝ e<sup>eV/kT</sup>
            </p>
            {mode === SimulationMode.NON_IDEAL && (
                <p className="text-xs text-slate-500 mt-2">
                    <em>Non-Ideal Effect:</em> At higher currents, the voltage drop across the bulk regions (Series Resistance R<sub>s</sub>) becomes significant, making the I-V curve linear rather than exponential.
                </p>
            )}
           </>
        )}

        {biasType.includes('Reverse') && !isBreakdown && (
           <>
            <p>
              <strong>Reverse Bias:</strong> Applied voltage aids V<sub>bi</sub>, increasing the barrier height to V<sub>bi</sub> + |V|.
            </p>
            <p>
               Majority carrier diffusion is completely blocked. The tiny current observed is the <strong>Reverse Saturation Current (I<sub>s</sub>)</strong>, 
               caused by thermally generated minority carriers drifting across the depletion region.
            </p>
           </>
        )}

        {(biasType.includes('Breakdown') || isBreakdown) && (
           <div className="bg-red-50 p-3 rounded border border-red-100">
            <p className="text-red-800 font-semibold mb-1">Breakdown Region</p>
            <p className="text-xs text-red-700">
               The strong electric field imparts enough kinetic energy to carriers to knock bound electrons free (Avalanche Multiplication) or allows tunneling (Zener Effect), causing a sharp rise in current.
            </p>
           </div>
        )}
      </div>
    </div>
  );
};