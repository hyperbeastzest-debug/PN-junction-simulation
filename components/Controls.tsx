import React from 'react';
import { DopingLevel, AnimationSpeed, SimulationMode } from '../types';
import { Play, Pause, RotateCcw, Zap, Settings, Activity } from 'lucide-react';

interface ControlsProps {
  voltage: number;
  setVoltage: (v: number) => void;
  doping: DopingLevel;
  setDoping: (d: DopingLevel) => void;
  mode: SimulationMode;
  setMode: (m: SimulationMode) => void;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  speed: AnimationSpeed;
  setSpeed: (s: AnimationSpeed) => void;
  showExplanation: boolean;
  setShowExplanation: (s: boolean) => void;
  showBandDiagram: boolean;
  setShowBandDiagram: (s: boolean) => void;
  current: number;
  biasType: string;
}

export const Controls: React.FC<ControlsProps> = ({
  voltage, setVoltage,
  doping, setDoping,
  mode, setMode,
  isPlaying, setIsPlaying,
  speed, setSpeed,
  showExplanation, setShowExplanation,
  showBandDiagram, setShowBandDiagram,
  current, biasType
}) => {
  return (
    <div className="flex flex-col gap-6 h-full">
      
      {/* Primary Control Card */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Settings size={14} /> Simulation Controls
        </h2>
        
        {/* Voltage Slider */}
        <div className="mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex justify-between items-end mb-2">
             <label className="text-xs font-bold text-slate-500 uppercase">Applied Voltage</label>
             <span className={`font-mono font-bold text-xl ${voltage > 0 ? 'text-green-600' : voltage < 0 ? 'text-blue-600' : 'text-slate-600'}`}>
               {voltage > 0 ? '+' : ''}{voltage.toFixed(2)} V
             </span>
          </div>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.05"
            value={voltage}
            onChange={(e) => setVoltage(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium uppercase">
            <span>Reverse (-5V)</span>
            <span>Forward (+5V)</span>
          </div>
          <button 
            onClick={() => setVoltage(0)}
            className="mt-3 w-full py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-600 rounded border border-slate-200 shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={12} /> Reset to Equilibrium
          </button>
        </div>

        {/* Animation Controls */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`py-2 rounded-lg flex items-center justify-center gap-2 font-medium text-sm transition-all ${isPlaying ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'}`}
          >
            {isPlaying ? <><Pause size={14}/> Pause</> : <><Play size={14}/> Play</>}
          </button>
          
          <select 
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="px-2 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value={AnimationSpeed.VERY_SLOW}>Very Slow</option>
            <option value={AnimationSpeed.SLOW}>Slow</option>
            <option value={AnimationSpeed.NORMAL}>Normal</option>
            <option value={AnimationSpeed.FAST}>Fast</option>
          </select>
        </div>

        {/* Settings Toggles */}
        <div className="space-y-3">
             {/* Mode Toggle */}
             <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setMode(SimulationMode.IDEAL)}
                    className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${mode === SimulationMode.IDEAL ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Ideal
                </button>
                <button 
                    onClick={() => setMode(SimulationMode.NON_IDEAL)}
                    className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${mode === SimulationMode.NON_IDEAL ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Non-Ideal
                </button>
             </div>

             {/* Doping */}
             <div className="border-t border-slate-100 pt-3">
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Doping Level</label>
                <div className="flex flex-col gap-1">
                    {Object.values(DopingLevel).map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer group">
                        <input
                        type="radio"
                        name="doping"
                        value={level}
                        checked={doping === level}
                        onChange={() => setDoping(level)}
                        className="w-3 h-3 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-indigo-600 transition-colors">{level}</span>
                    </label>
                    ))}
                </div>
             </div>
             
             {/* Checkboxes */}
             <div className="pt-2 space-y-2">
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={showBandDiagram} onChange={(e) => setShowBandDiagram(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                    <span className="text-sm text-slate-600">Show Band Diagram</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={showExplanation} onChange={(e) => setShowExplanation(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                    <span className="text-sm text-slate-600">Show Educational Panel</span>
                 </label>
             </div>
        </div>

      </div>

      {/* Live Readings Card */}
      <div className="bg-slate-800 text-white p-5 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden flex-1 flex flex-col justify-center">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity size={80} />
        </div>
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 relative z-10">Live Metrics</h2>
        
        <div className="grid grid-cols-1 gap-4 relative z-10">
          <div>
            <div className="text-slate-400 text-xs mb-1">Total Current (I)</div>
            <div className={`font-mono text-3xl font-bold tracking-tighter ${(current * 1000) > 0.1 ? 'text-green-400' : (current * 1000) < -0.01 ? 'text-blue-300' : 'text-white'}`}>
              {(current * 1000).toFixed(2)} <span className="text-sm text-slate-500 font-normal">mA</span>
            </div>
          </div>
          
          <div className="space-y-2 border-t border-slate-700 pt-3">
             <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Bias</span>
                <span className={`text-xs font-bold ${
                   biasType.includes('Forward') ? 'text-green-400' :
                   biasType.includes('Reverse') ? 'text-blue-400' :
                   'text-slate-200'
                }`}>{biasType}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Mode</span>
                <span className="text-xs text-slate-300">{mode}</span>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
};
