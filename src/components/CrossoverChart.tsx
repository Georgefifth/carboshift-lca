import React, { useState, useRef } from 'react';
import { LifecycleBreakdown, BreakevenResult } from '../types/index.ts';
import { Target, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CrossoverChartProps {
  incumbentBreakdown: LifecycleBreakdown;
  candidateBreakdowns: LifecycleBreakdown[];
  breakevenResults: BreakevenResult[];
  annualMileage: number;
  isMetric: boolean;
}

export const CrossoverChart: React.FC<CrossoverChartProps> = ({
  incumbentBreakdown,
  candidateBreakdowns,
  breakevenResults,
  annualMileage,
  isMetric,
}) => {
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const maxYear = 10;

  // Find max emissions value across all vehicles over 10 years to scale Y-axis
  let maxEmissionsKg = Math.max(
    ...incumbentBreakdown.cumulativeEmissionsByYear,
    ...candidateBreakdowns.flatMap((c) => c.cumulativeEmissionsByYear),
    10000
  );
  // Round up to nearest 5,000 kg
  maxEmissionsKg = Math.ceil(maxEmissionsKg / 5000) * 5000;

  // Chart Dimensions
  const width = 800;
  const height = 400;
  const padding = { top: 30, right: 40, bottom: 50, left: 60 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Coordinate mapping functions
  const getX = (year: number) => padding.left + (year / maxYear) * plotWidth;
  const getY = (emissionsKg: number) => padding.top + plotHeight - (emissionsKg / maxEmissionsKg) * plotHeight;

  // Color assignments for candidate lines
  const candidateColors = ['#10B981', '#0EA5E9', '#F59E0B'];

  // Handle mouse scrub
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * width;
    const relX = svgX - padding.left;
    if (relX >= 0 && relX <= plotWidth) {
      const year = Math.min(10, Math.max(0, Math.round((relX / plotWidth) * 10 * 10) / 10));
      setHoverYear(year);
    } else {
      setHoverYear(null);
    }
  };

  const handleMouseLeave = () => setHoverYear(null);

  // Helper to build SVG polyline points string
  const buildPoints = (breakdown: LifecycleBreakdown) => {
    return breakdown.cumulativeEmissionsByYear
      .map((emissions, yr) => `${getX(yr)},${getY(emissions)}`)
      .join(' ');
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-card p-4 space-y-4">
      {/* Chart Header & Live Verdict */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-accent-green" />
            <h3 className="text-sm font-semibold tracking-wide text-text-primary uppercase font-mono">
              Cradle-to-Grave Carbon Crossover Trajectory
            </h3>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Initial vertical jump = Embodied Manufacturing Debt. Slope = Operational Grid/Fuel Burn.
          </p>
        </div>

        {/* Primary Verdict Pill */}
        {breakevenResults.length > 0 && (
          <div className="flex items-center space-x-2">
            {breakevenResults[0].hasCrossover ? (
              <div className="px-3 py-1.5 rounded-crisp bg-accent-green/15 border border-accent-green/40 text-accent-green font-mono text-xs flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-accent-green shrink-0" />
                <span>
                  <strong>Breakeven: Month {breakevenResults[0].crossoverMonths}</strong> ({isMetric
                    ? `${Math.round((breakevenResults[0].crossoverMiles || 0) * 1.60934).toLocaleString()} km`
                    : `${breakevenResults[0].crossoverMiles?.toLocaleString()} mi`})
                </span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-crisp bg-burn-red/15 border border-burn-red/40 text-burn-red font-mono text-xs flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-burn-red shrink-0" />
                <span><strong>No Breakeven</strong> (Higher lifecycle emissions than incumbent)</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SVG Interactive Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Grid Line Pattern */}
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1F293D" strokeWidth="0.5" />
            </pattern>
            {/* Glow Filter for Breakeven Pins */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            fill="#0E1420"
            stroke="#1F293D"
            strokeWidth="1"
          />

          {/* Horizontal Y-Axis Grid Lines & Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const val = pct * maxEmissionsKg;
            const y = getY(val);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1F293D"
                  strokeDasharray="3,3"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-text-muted font-mono"
                >
                  {(val / 1000).toFixed(0)} t
                </text>
              </g>
            );
          })}

          {/* Vertical X-Axis Grid Lines (Years & Mileage) */}
          {[0, 2, 4, 6, 8, 10].map((yr) => {
            const x = getX(yr);
            const miles = yr * annualMileage;
            return (
              <g key={yr}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke="#1F293D"
                  strokeDasharray="2,2"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  className="text-[11px] fill-text-muted font-mono"
                >
                  Yr {yr}
                </text>
                <text
                  x={x}
                  y={height - padding.bottom + 32}
                  textAnchor="middle"
                  className="text-[9px] fill-text-muted/60 font-mono"
                >
                  {isMetric
                    ? `${Math.round(miles * 1.60934 / 1000)}k km`
                    : `${Math.round(miles / 1000)}k mi`}
                </text>
              </g>
            );
          })}

          {/* Y-Axis Label */}
          <text
            transform={`rotate(-90)`}
            x={-height / 2}
            y={18}
            textAnchor="middle"
            className="text-[11px] fill-text-muted font-mono font-semibold"
          >
            Cumulative Emissions (Metric Tons CO₂e)
          </text>

          {/* --- Render Incumbent Baseline Trajectory (Red) --- */}
          <polyline
            points={buildPoints(incumbentBreakdown)}
            fill="none"
            stroke="#EF4444"
            strokeWidth="2.5"
            strokeDasharray="6,3"
          />

          {/* Incumbent Start Point */}
          <circle
            cx={getX(0)}
            cy={getY(incumbentBreakdown.embodiedTotalKg)}
            r="4"
            fill="#EF4444"
          />

          {/* --- Render Candidate Trajectories --- */}
          {candidateBreakdowns.map((cand, idx) => {
            const color = candidateColors[idx % candidateColors.length];
            const be = breakevenResults.find((r) => r.candidateId === cand.vehicleId);

            return (
              <g key={cand.vehicleId}>
                {/* Embodied Carbon Debt Vertical Indicator at Year 0 */}
                {cand.embodiedTotalKg > 0 && (
                  <line
                    x1={getX(0)}
                    y1={getY(0)}
                    x2={getX(0)}
                    y2={getY(cand.embodiedTotalKg)}
                    stroke={color}
                    strokeWidth="3"
                    strokeDasharray="2,2"
                    opacity="0.8"
                  />
                )}

                {/* Candidate Line */}
                <polyline
                  points={buildPoints(cand)}
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                />

                {/* Candidate Start Point */}
                <circle
                  cx={getX(0)}
                  cy={getY(cand.embodiedTotalKg)}
                  r="5"
                  fill={color}
                />

                {/* Breakeven Crossover Pin */}
                {be && be.hasCrossover && be.crossoverMonths !== null && be.crossoverMiles !== null && (
                  (() => {
                    const crossYear = be.crossoverMonths / 12;
                    if (crossYear <= 10) {
                      const crossX = getX(crossYear);
                      // Calculate exact emissions at crossover point
                      const crossEmissions = cand.embodiedTotalKg + (be.crossoverMiles * (cand.operationalPerMileGrams / 1000));
                      const crossY = getY(crossEmissions);

                      return (
                        <g key={`pin-${cand.vehicleId}`} filter="url(#glow)">
                          {/* Vertical dotted line down to X-axis */}
                          <line
                            x1={crossX}
                            y1={crossY}
                            x2={crossX}
                            y2={height - padding.bottom}
                            stroke={color}
                            strokeWidth="1.5"
                            strokeDasharray="3,3"
                          />

                          {/* Pin Outer Ring */}
                          <circle
                            cx={crossX}
                            cy={crossY}
                            r="7"
                            fill={color}
                            fillOpacity="0.3"
                            stroke={color}
                            strokeWidth="2"
                            className="animate-ping"
                          />
                          <circle
                            cx={crossX}
                            cy={crossY}
                            r="5"
                            fill="#0B0F17"
                            stroke={color}
                            strokeWidth="2"
                          />

                          {/* Annotation Flag */}
                          <rect
                            x={crossX + 6}
                            y={crossY - 26}
                            width="110"
                            height="20"
                            rx="3"
                            fill="#131B2A"
                            stroke={color}
                            strokeWidth="1"
                          />
                          <text
                            x={crossX + 10}
                            y={crossY - 12}
                            className="text-[9px] fill-text-primary font-mono font-bold"
                          >
                            Mo {be.crossoverMonths} ({Math.round(be.crossoverMiles / 1000)}k mi)
                          </text>
                        </g>
                      );
                    }
                    return null;
                  })()
                )}
              </g>
            );
          })}

          {/* Interactive Scrubbing Crosshair & Readout */}
          {hoverYear !== null && (
            <g>
              <line
                x1={getX(hoverYear)}
                y1={padding.top}
                x2={getX(hoverYear)}
                y2={height - padding.bottom}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeDasharray="4,4"
                opacity="0.8"
              />
              <circle
                cx={getX(hoverYear)}
                cy={height - padding.bottom}
                r="3"
                fill="#FFFFFF"
              />
            </g>
          )}
        </svg>

        {/* Hover Readout Tooltip (Overlay) */}
        {hoverYear !== null && (
          <div className="absolute top-2 right-4 bg-surface-elevated/95 border border-border-subtle p-3 rounded-card shadow-2xl text-xs font-mono space-y-1.5 z-10 pointer-events-none backdrop-blur">
            <div className="text-[11px] text-accent-green font-bold border-b border-border-subtle pb-1">
              Timeline Scrubber: Year {hoverYear.toFixed(1)} ({Math.round(hoverYear * annualMileage).toLocaleString()} miles)
            </div>
            {/* Incumbent */}
            <div className="flex items-center justify-between text-burn-red gap-4">
              <span>{incumbentBreakdown.vehicleName.split('(')[0]}:</span>
              <strong>
                {(
                  (incumbentBreakdown.embodiedTotalKg +
                    hoverYear * incumbentBreakdown.annualOperationalKg) /
                  1000
                ).toFixed(1)}{' '}
                t CO₂e
              </strong>
            </div>
            {/* Candidates */}
            {candidateBreakdowns.map((cand, idx) => {
              const cumTons = (
                (cand.embodiedTotalKg + hoverYear * cand.annualOperationalKg) /
                1000
              ).toFixed(1);
              const incumbentTons =
                (incumbentBreakdown.embodiedTotalKg +
                  hoverYear * incumbentBreakdown.annualOperationalKg) /
                1000;
              const deltaTons = (incumbentTons - Number(cumTons)).toFixed(1);
              const color = candidateColors[idx % candidateColors.length];

              return (
                <div key={cand.vehicleId} className="flex items-center justify-between gap-4" style={{ color }}>
                  <span>{cand.vehicleName.split('(')[0]}:</span>
                  <div>
                    <strong>{cumTons} t</strong>{' '}
                    <span className="text-[10px] text-text-muted">
                      ({Number(deltaTons) >= 0 ? `-${deltaTons}t saved` : `+${Math.abs(Number(deltaTons))}t debt`})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chart Legend & Explanation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pt-2 border-t border-border-subtle/60">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-burn-red inline-block border-t border-dashed"></span>
            <span className="text-text-muted">{incumbentBreakdown.vehicleName} (Incumbent Baseline)</span>
          </div>
          {candidateBreakdowns.map((cand, idx) => (
            <div key={cand.vehicleId} className="flex items-center space-x-1.5">
              <span
                className="w-3 h-0.5 inline-block"
                style={{ backgroundColor: candidateColors[idx % candidateColors.length] }}
              ></span>
              <span className="text-text-primary">{cand.vehicleName}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-1 text-text-muted text-[11px]">
          <Info className="w-3.5 h-3.5 text-accent-green" />
          <span>Intersection pin marks the zero-emissions parity point</span>
        </div>
      </div>
    </div>
  );
};
