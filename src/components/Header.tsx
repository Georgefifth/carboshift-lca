import React from 'react';
import { ShieldCheck, FileText, Sliders, RefreshCw, Zap } from 'lucide-react';

interface HeaderProps {
  onOpenAuditModal: () => void;
  onResetDefaults: () => void;
  isMetric: boolean;
  onToggleUnits: () => void;
  onPrintReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuditModal,
  onResetDefaults,
  isMetric,
  onToggleUnits,
  onPrintReport,
}) => {
  return (
    <header className="border-b border-border-subtle bg-surface/80 backdrop-blur sticky top-0 z-30 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-crisp bg-accent-green/10 border border-accent-green/30 flex items-center justify-center text-accent-green font-mono font-bold text-lg">
            <Zap className="w-5 h-5 text-accent-green" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary font-mono">
                CarboShift<span className="text-accent-green">.LCA</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-surface-elevated border border-border-subtle text-accent-green">
                v1.4 Engineering
              </span>
            </div>
            <p className="text-xs text-text-muted hidden sm:block">
              Truth-in-Lifecycle Vehicle Replacement & Breakeven Engine (GREET 2024 & eGRID)
            </p>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Active Model Indicator */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-crisp bg-surface-elevated border border-border-subtle text-text-muted font-mono">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></span>
            <span>EPA eGRID 2024 / ANL GREET</span>
          </div>

          {/* Metric / Imperial toggle */}
          <button
            onClick={onToggleUnits}
            className="px-2.5 py-1.5 rounded-crisp bg-surface-elevated hover:bg-surface-elevated/80 border border-border-subtle font-mono text-text-primary transition-colors flex items-center space-x-1"
            title="Toggle between Imperial (miles, gallons) and Metric (km, liters)"
          >
            <Sliders className="w-3.5 h-3.5 text-text-muted mr-1" />
            <span>Unit: <strong>{isMetric ? 'Metric (km/L)' : 'Imperial (mi/gal)'}</strong></span>
          </button>

          {/* Reset button */}
          <button
            onClick={onResetDefaults}
            className="px-2.5 py-1.5 rounded-crisp bg-surface-elevated hover:bg-surface-elevated/80 border border-border-subtle text-text-muted hover:text-text-primary transition-colors flex items-center space-x-1"
            title="Reset parameters to benchmark defaults"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Print / Export Report */}
          <button
            onClick={onPrintReport}
            className="px-2.5 py-1.5 rounded-crisp bg-surface-elevated hover:bg-surface-elevated/80 border border-border-subtle text-text-primary transition-colors flex items-center space-x-1"
            title="Export scientific audit report"
          >
            <FileText className="w-3.5 h-3.5 text-accent-green" />
            <span>Export Report</span>
          </button>

          {/* Methodology / Audit modal */}
          <button
            onClick={onOpenAuditModal}
            className="px-3 py-1.5 rounded-crisp bg-accent-green text-base font-semibold hover:bg-accent-green/90 transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Scientific Audit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
