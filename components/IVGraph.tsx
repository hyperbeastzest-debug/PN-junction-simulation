import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
  Label,
  Legend
} from 'recharts';
import { calculateCurrent, generateCurveData } from '../utils/physics';
import { DiodeParams, SimulationMode } from '../types';

interface IVGraphProps {
  currentVoltage: number;
  params: DiodeParams;
  mode: SimulationMode;
}

export const IVGraph: React.FC<IVGraphProps> = ({ currentVoltage, params, mode }) => {
  const { idealPoints, nonIdealPoints } = useMemo(() => generateCurveData(params), [params]);
  
  // Combine data for plotting
  const data = idealPoints.map((p, i) => ({
      v: p.v,
      ideal: p.i,
      nonIdeal: nonIdealPoints[i].i
  }));

  const currentI = calculateCurrent(currentVoltage, params, mode) * 1000;

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-4 h-[350px] flex flex-col">
      <div className="flex justify-between items-center mb-2 px-2 border-b border-slate-50 pb-2">
        <h3 className="text-xs font-bold text-slate-700 uppercase">I-V Characteristic Curve</h3>
        <span className="text-[10px] text-slate-400">Shockley Model</span>
      </div>
      
      <div className="flex-1 min-h-0 text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#94a3b8" />
            <XAxis 
              dataKey="v" 
              type="number" 
              domain={[-5, 5]} 
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickCount={11}
            >
              <Label value="Voltage (V)" offset={-15} position="insideBottom" style={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
            </XAxis>
            <YAxis 
              tick={{ fontSize: 10, fill: '#64748b' }}
              width={40}
              domain={['auto', 'auto']}
            >
               <Label value="Current (mA)" angle={-90} position="insideLeft" offset={0} style={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
            </YAxis>
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              itemStyle={{ fontWeight: 600 }}
              formatter={(val: number) => [`${val.toFixed(2)} mA`]}
              labelFormatter={(label) => `V: ${label} V`}
            />
            <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
            <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={1} />
            
            {mode === SimulationMode.NON_IDEAL && (
                 <Line 
                    type="monotone" 
                    dataKey="ideal" 
                    stroke="#94a3b8" 
                    strokeWidth={2} 
                    strokeDasharray="4 4" 
                    dot={false} 
                    name="Ideal Diode"
                    isAnimationActive={false}
                 />
            )}
            
            <Line 
              type="monotone" 
              dataKey={mode === SimulationMode.NON_IDEAL ? "nonIdeal" : "ideal"} 
              stroke="#2563eb" 
              strokeWidth={3} 
              dot={false} 
              name={mode}
              isAnimationActive={false}
            />
            
            <Legend verticalAlign="top" height={36} iconType="plainline"/>

            {/* Operating Point */}
            <ReferenceDot 
              x={currentVoltage} 
              y={currentI} 
              r={5} 
              fill="#dc2626" 
              stroke="white" 
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
