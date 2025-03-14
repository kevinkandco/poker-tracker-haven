
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentRoundLabel } from './utils/gameHelpers';

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
  // Simple instruction text based on current round
  const getInstructions = () => {
    if (gameState.winner) {
      return "Hand complete. Start a new hand.";
    }
    
    if (activePlayers.length <= 1) {
      return "Only one player left. End the hand.";
    }
    
    const instructions = [
      "Pre-flop betting round in progress", 
      "Flop betting round in progress", 
      "Turn betting round in progress", 
      "River betting round in progress", 
      "Showdown - Select the winner"
    ];
    
    return instructions[Math.min(currentRound - 1, instructions.length - 1)];
  };

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

          <div className="text-sm text-muted-foreground">
            {getInstructions()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameStageTracker;
