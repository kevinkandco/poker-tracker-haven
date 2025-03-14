
import React from 'react';

interface AutoAdvanceToggleProps {
  autoAdvance: boolean;
  onToggle: () => void;
}

const AutoAdvanceToggle: React.FC<AutoAdvanceToggleProps> = ({
  autoAdvance,
  onToggle
}) => {
  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-sm text-muted-foreground">Auto-advance:</span>
      <button 
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${autoAdvance ? 'bg-primary' : 'bg-input'}`}
        onClick={onToggle}
        role="switch"
        aria-checked={autoAdvance}
      >
        <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${autoAdvance ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
};

export default AutoAdvanceToggle;
