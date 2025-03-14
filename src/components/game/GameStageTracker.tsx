
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  getCurrentRoundLabel, 
  getNextActionInstructions 
} from './utils/gameHelpers';

interface GameStageTrackerProps {
  currentRound: number;
  activePlayers: any[];
  gameState: any;
}

const GameStageTracker: React.FC<GameStageTrackerProps> = ({
  currentRound,
  activePlayers,
  gameState
}) => {
  // Get detailed betting instructions based on the current game state
  const instructions = getNextActionInstructions(gameState, activePlayers);

  return (
    <Card className="bg-card border border-amber-200/50 shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="font-medium">
              Current Stage: {getCurrentRoundLabel(currentRound)}
            </Badge>
            <Badge
              variant="outline"
              className="font-normal"
            >
              Round {Math.min(currentRound, 5)}/5
            </Badge>
          </div>
          
          <div className="w-full bg-secondary/30 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${Math.min(currentRound * 20, 100)}%` }}
            ></div>
          </div>

          <div className="text-sm font-medium border-l-4 border-primary pl-3 py-1">
            {instructions}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameStageTracker;
