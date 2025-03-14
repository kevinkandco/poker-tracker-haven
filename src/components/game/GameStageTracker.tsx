
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, RotateCw, RefreshCw, Trophy } from 'lucide-react';
import { 
  getCurrentRoundLabel, 
  getNextActionInstructions 
} from './utils/gameHelpers';

interface GameStageTrackerProps {
  currentRound: number;
  activePlayers: any[];
  gameState: any;
  onNextPlayer: () => void;
  onNextRound: () => void;
  onNewHand: () => void;
}

const GameStageTracker: React.FC<GameStageTrackerProps> = ({
  currentRound,
  activePlayers,
  gameState,
  onNextPlayer,
  onNextRound,
  onNewHand
}) => {
  // Get detailed betting instructions based on the current game state
  const instructions = getNextActionInstructions(gameState, activePlayers);
  
  // Determine if round is complete (all players have bet equally)
  const isRoundComplete = activePlayers.length <= 1 || (() => {
    // If there's only one player or winner, the round is complete
    if (activePlayers.length <= 1 || gameState.winner) return true;
    
    // Get all bets for the current round
    const currentRoundBets = activePlayers.map(player => {
      const betsInCurrentRound = player.bets.filter(bet => bet.round === currentRound);
      return {
        playerId: player.id,
        totalBet: betsInCurrentRound.reduce((sum, bet) => sum + bet.amount, 0)
      };
    });
    
    // If any active player hasn't bet in this round, it's not complete
    if (currentRoundBets.some(bet => bet.totalBet === 0)) {
      return false;
    }
    
    // Check if all bets are equal (or player is all-in)
    const maxBet = Math.max(...currentRoundBets.map(bet => bet.totalBet));
    
    // For each player who hasn't bet the max, check if they're all-in
    for (const player of activePlayers) {
      const playerBet = currentRoundBets.find(bet => bet.playerId === player.id)?.totalBet || 0;
      
      // If player bet less than max but has chips left, round is not complete
      if (playerBet < maxBet && player.currentStack > 0) {
        return false;
      }
    }
    
    // If we got here, round is complete
    return true;
  })();

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
          
          <div className="flex flex-wrap gap-3 mt-1 justify-between">
            {/* Show appropriate actions based on game state */}
            {!gameState.winner && (
              <>
                {!isRoundComplete && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="button-hover"
                    onClick={onNextPlayer}
                  >
                    Next Player
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                )}
                
                {isRoundComplete && currentRound < 5 && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="button-hover"
                    onClick={onNextRound}
                  >
                    {currentRound === 1 ? "Deal Flop" : 
                     currentRound === 2 ? "Deal Turn" :
                     currentRound === 3 ? "Deal River" : "Next Round"}
                    <RotateCw className="ml-1.5 h-4 w-4" />
                  </Button>
                )}
                
                {(isRoundComplete && currentRound === 5) || activePlayers.length <= 1 ? (
                  <Button 
                    variant="default" 
                    size="sm"
                    className="button-hover bg-amber-600 hover:bg-amber-700"
                    onClick={onNewHand}
                  >
                    End Hand
                    <Trophy className="ml-1.5 h-4 w-4" />
                  </Button>
                ) : null}
              </>
            )}
            
            {gameState.winner && (
              <Button 
                variant="default" 
                size="sm"
                className="button-hover bg-emerald-600 hover:bg-emerald-700"
                onClick={onNewHand}
              >
                New Hand
                <RefreshCw className="ml-1.5 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameStageTracker;
