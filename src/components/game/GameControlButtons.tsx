
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, RotateCw, RefreshCw, Trophy, DollarSign } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

interface GameControlButtonsProps {
  gameState: any;
  onNextPlayer: () => void;
  onNextRound: () => void;
  onNewHand: () => void;
  onEndGame: () => void;
}

const GameControlButtons: React.FC<GameControlButtonsProps> = ({
  gameState,
  onNextPlayer,
  onNextRound,
  onNewHand,
  onEndGame
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
      <div className="flex gap-3 justify-center">
        <Button 
          variant="outline" 
          className="button-hover flex-1 sm:flex-none"
          onClick={onNextPlayer}
          disabled={!!gameState.winner}
        >
          Next Player
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          className="button-hover flex-1 sm:flex-none"
          onClick={onNextRound}
          disabled={!!gameState.winner}
        >
          Next Round
          <RotateCw className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex gap-3 justify-center">
        <Button 
          variant="default" 
          className={`button-hover flex-1 sm:flex-none ${gameState.winner ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
          onClick={onNewHand}
        >
          {gameState.winner ? (
            <>
              New Hand
              <RefreshCw className="ml-1.5 h-4 w-4" />
            </>
          ) : (
            <>
              End Hand
              <Trophy className="ml-1.5 h-4 w-4" />
            </>
          )}
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10 flex-1 sm:flex-none">
              <DollarSign className="h-4 w-4 mr-1" />
              End Game
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>End the game?</DialogTitle>
            </DialogHeader>
            <p className="py-4">
              Are you sure you want to end this game? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <DialogTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </DialogTrigger>
              <Button variant="destructive" onClick={onEndGame}>
                End Game
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GameControlButtons;
