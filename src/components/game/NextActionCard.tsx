
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircleDot, ArrowRight, ArrowDown } from 'lucide-react';
import { 
  getCurrentActionDescription, 
  getNextActionText 
} from './utils/gameHelpers';

interface NextActionCardProps {
  gameState: any;
  activePlayer: any;
  onNextPlayer: () => void;
}

const NextActionCard: React.FC<NextActionCardProps> = ({
  gameState,
  activePlayer,
  onNextPlayer
}) => {
  return (
    <>
      <Card className="bg-card border border-primary/30 shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CircleDot className="h-5 w-5 text-primary" />
              <p className="font-medium">{getNextActionText(gameState, activePlayer)}</p>
            </div>
            {!gameState.winner && (
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
          </div>
        </CardContent>
      </Card>
      
      {/* Current Action Description */}
      <Card className="bg-card border-l-4 border-l-primary border shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center">
            <ArrowDown className="h-4 w-4 mr-2 text-primary animate-bounce" />
            <p className="text-sm font-medium">{getCurrentActionDescription(gameState, activePlayer)}</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default NextActionCard;
