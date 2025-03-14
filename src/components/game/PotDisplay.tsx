
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  History, 
  PlusCircle, 
  Trophy,
  Coins
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency, getTotalPot } from './utils/gameHelpers';

interface PotDisplayProps {
  players: any[];
  gameState: any;
  onShowShareDialog: () => void;
  onIncreaseBlindLevel: () => void;
  onShowWinnerDialog: () => void;
}

const PotDisplay: React.FC<PotDisplayProps> = ({
  players,
  gameState,
  onShowShareDialog,
  onIncreaseBlindLevel,
  onShowWinnerDialog
}) => {
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const totalPot = getTotalPot(players);

  return (
    <>
      <Card className="bg-card border border-border shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto">
              <p className="text-sm text-muted-foreground mb-1">Current Pot</p>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-500" />
                <p className="text-3xl font-bold">{formatCurrency(totalPot)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
              <Button variant="outline" size="sm" onClick={onShowShareDialog}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              
              <Button variant="outline" size="sm" onClick={() => setShowHistoryDialog(true)}>
                <History className="h-4 w-4 mr-1" />
                History
              </Button>
              
              <Button variant="outline" size="sm" onClick={onIncreaseBlindLevel}>
                <PlusCircle className="h-4 w-4 mr-1" />
                Blinds
              </Button>

              {!gameState.winner && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-amber-500"
                  onClick={onShowWinnerDialog}
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  Mark Winner
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Betting History</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {gameState.players.map((player: any) => (
              <div key={player.id} className="py-3 border-b last:border-b-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-medium">{player.name}</h4>
                  <Badge variant="outline">
                    {player.folded ? "Folded" : `${formatCurrency(player.currentStack)}`}
                  </Badge>
                </div>
                <div className="text-sm space-y-1 text-muted-foreground">
                  {player.bets.length === 0 ? (
                    <p>No bets yet</p>
                  ) : (
                    player.bets.map((bet: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span>Round {bet.round}</span>
                        <span>{formatCurrency(bet.amount)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PotDisplay;
