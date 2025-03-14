
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface BlindControlProps {
  smallBlind: number;
  bigBlind: number;
  onSmallBlindChange: (value: number) => void;
  onBigBlindChange: (value: number) => void;
}

const BlindControl: React.FC<BlindControlProps> = ({
  smallBlind,
  bigBlind,
  onSmallBlindChange,
  onBigBlindChange
}) => {
  
  const handleSmallBlindChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    if (value <= 0) {
      toast.error("Small blind must be greater than 0");
      return;
    }
    
    onSmallBlindChange(value);
    
    // Ensure big blind is at least double the small blind
    if (bigBlind < value * 2) {
      onBigBlindChange(value * 2);
    }
  };
  
  const handleBigBlindChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    if (value <= smallBlind) {
      toast.error("Big blind must be greater than small blind");
      return;
    }
    
    onBigBlindChange(value);
  };
  
  const commonBlindSets = [
    { small: 1, big: 2 },
    { small: 2, big: 5 },
    { small: 5, big: 10 },
    { small: 10, big: 20 },
    { small: 25, big: 50 }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Blind Levels</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="small-blind">Small Blind</Label>
            <Input
              id="small-blind"
              type="number"
              min={1}
              value={smallBlind}
              onChange={handleSmallBlindChange}
              className="input-focus"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="big-blind">Big Blind</Label>
            <Input
              id="big-blind"
              type="number"
              min={smallBlind * 2}
              value={bigBlind}
              onChange={handleBigBlindChange}
              className="input-focus"
            />
          </div>
        </div>
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-2">Common blind sets</p>
        <div className="flex flex-wrap gap-2">
          {commonBlindSets.map((set, index) => (
            <button
              key={index}
              onClick={() => {
                onSmallBlindChange(set.small);
                onBigBlindChange(set.big);
              }}
              className={`
                text-xs px-2 py-1 rounded-md transition-all 
                ${smallBlind === set.small && bigBlind === set.big
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }
              `}
            >
              {set.small}/{set.big}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlindControl;
