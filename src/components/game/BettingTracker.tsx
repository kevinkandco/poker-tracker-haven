
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import PlayerCard from './PlayerCard';
import { 
  ArrowRight, 
  RotateCw, 
  PlusCircle, 
  History, 
  DollarSign, 
  Share2, 
  Copy, 
  RefreshCw, 
  Trophy, 
  CheckCircle2, 
  UserRound, 
  CircleDot, 
  Coins 
} from 'lucide-react';
import { useGameContext } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BettingTracker = () => {
  const navigate = useNavigate();
  const { gameState, nextRound, increaseBlindLevel, endGame, getShareUrl, resetHand, markWinner, setDealer } = useGameContext();
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string>("");
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
    if (gameState.winner) {
      resetHand();
      // Move dealer to next player
      const nextDealerIndex = (gameState.dealerIndex !== undefined ? 
        (gameState.dealerIndex + 1) % gameState.players.length : 0);
      setDealer(nextDealerIndex);
      setActivePlayerIndex(0);
      toast.success(`Dealer is now ${gameState.players[nextDealerIndex].name}`);
    } else {
      setShowWinnerDialog(true);
    }
  };
  
  const handleConfirmWinner = () => {
    if (selectedWinner) {
      markWinner(selectedWinner);
      setShowWinnerDialog(false);
    } else {
      toast.error("Please select a winner");
    }
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

  const getWinnerName = () => {
    if (!gameState.winner) return null;
    const winner = gameState.players.find(p => p.id === gameState.winner);
    return winner ? winner.name : null;
  };

  const getDealerName = () => {
    if (gameState.dealerIndex === undefined) return null;
    const dealer = gameState.players[gameState.dealerIndex];
    return dealer ? dealer.name : null;
  };

  const winnerName = getWinnerName();
  const dealerName = getDealerName();

  const currentRoundLabel = () => {
    switch(gameState.currentRound) {
      case 1: return "Pre-flop";
      case 2: return "Flop";
      case 3: return "Turn";
      case 4: return "River";
      default: return `Round ${gameState.currentRound}`;
    }
  };

  const getNextActionText = () => {
    if (gameState.winner) {
      return "Start new hand";
    }
    
    if (activePlayer) {
      return `${activePlayer.name}'s turn to bet`;
    }
    
    return "Next player's turn";
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight">Poker Tracker</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-normal">Hand #{gameState.currentHand}</Badge>
            <Badge variant="outline" className="font-normal">{currentRoundLabel()}</Badge>
          </div>
          <div className="hidden sm:block">•</div>
          <div>
            Blinds: {formatCurrency(gameState.blinds.small)}/{formatCurrency(gameState.blinds.big)}
          </div>
          {dealerName && (
            <>
              <div className="hidden sm:block">•</div>
              <div className="flex items-center gap-1 text-primary font-medium">
                <UserRound className="h-4 w-4" />
                {dealerName} dealing
              </div>
            </>
          )}
          {winnerName && (
            <>
              <div className="hidden sm:block">•</div>
              <div className="flex items-center gap-1 text-emerald-500 font-medium">
                <Trophy className="h-4 w-4" />
                {winnerName} won
              </div>
            </>
          )}
        </div>
      </div>
      
      <Card className="bg-card border border-border shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto">
              <p className="text-sm text-muted-foreground mb-1">Current Pot</p>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-500" />
                <p className="text-3xl font-bold">{formatCurrency(getTotalPot())}</p>
              </div>
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

              {!gameState.winner && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-amber-500"
                  onClick={() => setShowWinnerDialog(true)}
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  Mark Winner
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Action Card */}
      <Card className="bg-card border border-primary/30 shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CircleDot className="h-5 w-5 text-primary" />
              <p className="font-medium">{getNextActionText()}</p>
            </div>
            {!gameState.winner && (
              <Button 
                variant="outline" 
                size="sm" 
                className="button-hover"
                onClick={handleNextPlayer}
              >
                Next Player
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            )}
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
            isWinner={gameState.winner === player.id}
            isDealer={gameState.dealerIndex === index}
          />
        ))}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <div className="flex gap-3 justify-center">
          <Button 
            variant="outline" 
            className="button-hover flex-1 sm:flex-none"
            onClick={handleNextPlayer}
            disabled={!!gameState.winner}
          >
            Next Player
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            className="button-hover flex-1 sm:flex-none"
            onClick={handleNextRound}
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
            onClick={handleNewHand}
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

      {/* Winner Selection Dialog */}
      <Dialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Who won this hand?</DialogTitle>
            <DialogDescription>
              Select the winner who will receive the pot of {formatCurrency(getTotalPot())}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={selectedWinner}
              onValueChange={setSelectedWinner}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select winner" />
              </SelectTrigger>
              <SelectContent>
                {gameState.players.map(player => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name} {player.folded ? " (Folded)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWinnerDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmWinner}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Confirm Winner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BettingTracker;
