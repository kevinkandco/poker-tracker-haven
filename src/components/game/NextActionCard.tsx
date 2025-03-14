
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { getCurrentActionDescription, getNextActionText } from './utils/gameHelpers';

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
    <Card className="bg-card border border-primary/30 shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{getNextActionText(gameState, activePlayer)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {getCurrentActionDescription(gameState, activePlayer)}
            </p>
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
  );
};

export default NextActionCard;
