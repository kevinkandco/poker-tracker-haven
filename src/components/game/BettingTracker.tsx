
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import PlayerCard from './PlayerCard';
import { ArrowRight, RotateCw, PlusCircle, History, DollarSign, Share2, Copy, RefreshCw } from 'lucide-react';
import { useGameContext } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const BettingTracker = () => {
  const navigate = useNavigate();
  const { gameState, nextRound, increaseBlindLevel, endGame, getShareUrl, resetHand } = useGameContext();
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const shareUrl = getShareUrl();
  
  // Navigate to home if no game in progress
  React.useEffect(() => {
    if (!gameState || !gameState.players || gameState.players.length === 0) {
      navigate('/');
    }
  }, [gameState, navigate]);
  
  if (!gameState || !gameState.players || gameState.players.length === 0) {
    return null;
  }

  const activePlayers = gameState.players.filter(player => !player.folded);
  const activePlayer = activePlayers[activePlayerIndex % activePlayers.length];
  
  const formatCurrency = (amount: number) => {
    return `$${amount}`;
  };
  
  const handleNextPlayer = () => {
    if (activePlayers.length <= 1) {
      // Only one player left, auto-end round
      nextRound();
      return;
    }
    
    setActivePlayerIndex((activePlayerIndex + 1) % activePlayers.length);
  };
  
  const handleNextRound = () => {
    nextRound();
    toast.success(`Starting new round`);
    // Reset to first player for new round
    setActivePlayerIndex(0);
  };

  const handleNewHand = () => {
    resetHand();
    setActivePlayerIndex(0);
  };
  
  const handleIncreaseBlindLevel = () => {
    increaseBlindLevel();
    toast.success(`Blinds increased to ${formatCurrency(gameState.blinds.small)}/${formatCurrency(gameState.blinds.big)}`);
  };
  
  const handleEndGame = () => {
    endGame();
    navigate('/');
    toast.success("Game ended");
  };
  
  const getTotalPot = () => {
    return gameState.players.reduce((sum, player) => sum + player.totalBet, 0);
  };

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight">Poker Tracker</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-normal">Hand #{gameState.currentHand}</Badge>
            <Badge variant="outline" className="font-normal">Round {gameState.currentRound}</Badge>
          </div>
          <div className="hidden sm:block">•</div>
          <div>
            Blinds: {formatCurrency(gameState.blinds.small)}/{formatCurrency(gameState.blinds.big)}
          </div>
        </div>
      </div>
      
      <Card className="bg-card border border-border shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto">
              <p className="text-sm text-muted-foreground mb-1">Current Pot</p>
              <p className="text-3xl font-bold">{formatCurrency(getTotalPot())}</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <History className="h-4 w-4 mr-1" />
                    History
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Betting History</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-[400px] overflow-y-auto">
                    {gameState.players.map(player => (
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
                            player.bets.map((bet, idx) => (
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
              
              <Button variant="outline" size="sm" onClick={handleIncreaseBlindLevel}>
                <PlusCircle className="h-4 w-4 mr-1" />
                Blinds
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {gameState.players.map((player, index) => (
          <PlayerCard 
            key={player.id} 
            playerId={player.id} 
            playerIndex={index}
            isActive={activePlayer && activePlayer.id === player.id}
          />
        ))}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <div className="flex gap-3 justify-center">
          <Button 
            variant="outline" 
            className="button-hover flex-1 sm:flex-none"
            onClick={handleNextPlayer}
          >
            Next Player
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            className="button-hover flex-1 sm:flex-none"
            onClick={handleNextRound}
          >
            Next Round
            <RotateCw className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button 
            variant="default" 
            className="button-hover flex-1 sm:flex-none"
            onClick={handleNewHand}
          >
            New Hand
            <RefreshCw className="ml-1.5 h-4 w-4" />
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
                <Button variant="destructive" onClick={handleEndGame}>
                  End Game
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this game</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4 text-muted-foreground">
              Share this link with other players to join your game session:
            </p>
            <div className="flex items-center gap-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={copyShareLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BettingTracker;
