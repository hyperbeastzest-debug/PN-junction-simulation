import React, { useState, useMemo } from 'react';
import { DiodeCanvas } from './components/DiodeCanvas';
import { IVGraph } from './components/IVGraph';
import { ExplanationPanel } from './components/ExplanationPanel';
import { Controls } from './components/Controls';
import { CircuitView } from './components/CircuitView';
import { getDiodeParams, calculateCurrent } from './utils/physics';
import { DopingLevel, AnimationSpeed, SimulationMode } from './types';

const App: React.FC = () => {
  // State
  const [voltage, setVoltage] = useState<number>(0);
  const [doping, setDoping] = useState<DopingLevel>(DopingLevel.MODERATE);
  const [mode, setMode] = useState<SimulationMode>(SimulationMode.IDEAL);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<AnimationSpeed>(AnimationSpeed.NORMAL);
  const [showExplanation, setShowExplanation] = useState<boolean>(true);
  const [showBandDiagram, setShowBandDiagram] = useState<boolean>(false);

  // Derived Physics
  const params = useMemo(() => getDiodeParams(doping), [doping]);
  const current = calculateCurrent(voltage, params, mode);

  // Bias Type Helper
  let biasType = 'Unbiased';
  if (voltage > 0.05) biasType = 'Forward Bias';
  else if (voltage < params.breakdownVoltage + 0.5) biasType = 'Breakdown Region'; // Soft start label
  else if (voltage < -0.05) biasType = 'Reverse Bias';

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      
      {/* 1. Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm flex-none">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">PN Junction Master</h1>
            <span className="hidden sm:inline text-xs text-slate-400">| Interactive JEE Simulation</span>
          </div>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">v3.0</span>
        </div>
      </header>

      {/* 2. Main Dashboard Layout */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Comment for students saving the file */}
        {/* 
          HOW TO USE:
          Save as 'pn_junction_master_v3.html' and open in Chrome/Edge/Firefox.
          FEATURES:
          - Ideal vs Non-Ideal Diode Modes
          - Macroscopic Circuit View + Microscopic Junction View
          - Real-time physics calculation including series resistance
        */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Left Column: Controls & Readings (3 Cols) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
             <Controls 
               voltage={voltage} setVoltage={setVoltage}
               doping={doping} setDoping={setDoping}
               mode={mode} setMode={setMode}
               isPlaying={isPlaying} setIsPlaying={setIsPlaying}
               speed={speed} setSpeed={setSpeed}
               showExplanation={showExplanation} setShowExplanation={setShowExplanation}
               showBandDiagram={showBandDiagram} setShowBandDiagram={setShowBandDiagram}
               current={current} biasType={biasType}
             />
             <div className="hidden lg:block">
                 <CircuitView voltage={voltage} current={current} />
             </div>
          </div>

          {/* Center Column: Visualization (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
             <DiodeCanvas 
               voltage={voltage} 
               params={params} 
               isPlaying={isPlaying} 
               speed={speed} 
               showBandDiagram={showBandDiagram}
             />
             
             {/* Circuit View for Mobile (Below Canvas) */}
             <div className="lg:hidden">
                 <CircuitView voltage={voltage} current={current} />
             </div>

             {/* Graph Area */}
             <IVGraph currentVoltage={voltage} params={params} mode={mode} />
          </div>

          {/* Right Column: Education (3 Cols) */}
          <div className="lg:col-span-3 h-[600px] lg:h-auto flex flex-col">
              {showExplanation ? (
                <ExplanationPanel 
                    voltage={voltage} 
                    params={params} 
                    biasType={biasType} 
                    mode={mode}
                />
              ) : (
                <div className="flex-1 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 p-8 text-center text-sm">
                   Enable Educational Panel in controls to see detailed physics concepts.
                </div>
              )}
          </div>

        </div>
      </main>

    </div>
  );
};

export default App;
