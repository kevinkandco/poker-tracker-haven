
import React, { useState, useEffect } from 'react';
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
  Coins,
  ArrowDown
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
  const { 
    gameState, 
    nextRound, 
    increaseBlindLevel, 
    endGame, 
    getShareUrl, 
    resetHand, 
    markWinner, 
    setDealer,
    isRoundComplete
  } = useGameContext();
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string>("");
  const [autoAdvance, setAutoAdvance] = useState(true);
  const shareUrl = getShareUrl();
  
  // Navigate to home if no game in progress
  React.useEffect(() => {
    if (!gameState || !gameState.players || gameState.players.length === 0) {
      navigate('/');
    }
  }, [gameState, navigate]);
  
  // Auto advance to next round when round is complete
  useEffect(() => {
    if (autoAdvance && isRoundComplete() && !gameState.winner) {
      // Add small delay for visual feedback
      const timer = setTimeout(() => {
        handleNextRound();
        toast.info("Automatically advancing to next round");
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [gameState, autoAdvance, isRoundComplete]);
  
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

    // Show appropriate toast based on current round
    const newRound = gameState.currentRound + 1;
    switch(newRound) {
      case 2:
        toast.success("The Flop: Dealer reveals 3 community cards");
        break;
      case 3:
        toast.success("The Turn: Dealer reveals 4th community card");
        break;
      case 4:
        toast.success("The River: Dealer reveals 5th community card");
        break;
      case 5:
        toast.success("Showdown: Players reveal their hands");
        break;
      default:
        toast.success(`Starting new round ${newRound}`);
    }

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
      toast.success(`New hand started. Dealer is now ${gameState.players[nextDealerIndex].name}`);
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
      case 5: return "Showdown";
      default: return `Round ${gameState.currentRound}`;
    }
  };

  const getCurrentActionDescription = () => {
    if (gameState.winner) {
      return "Hand complete. Start a new hand.";
    }
    
    if (!activePlayer) {
      return "No active players. Start a new hand.";
    }
    
    const roundDescriptions = [
      `Pre-flop betting: ${activePlayer.name}'s turn to bet`,
      `Flop betting: ${activePlayer.name}'s turn to bet`,
      `Turn betting: ${activePlayer.name}'s turn to bet`,
      `River betting: ${activePlayer.name}'s turn to bet`,
      `Showdown: Players reveal their hands`
    ];
    
    return roundDescriptions[Math.min(gameState.currentRound - 1, roundDescriptions.length - 1)];
  };

  const getNextActionText = () => {
    if (gameState.winner) {
      return "Start new hand";
    }
    
    if (gameState.currentRound === 5) {
      return "Showdown - Select Winner";
    }
    
    if (activePlayer) {
      return `${activePlayer.name}'s turn to bet`;
    }
    
    return "Next player's turn";
  };

  const getNextStepInstructions = () => {
    if (gameState.winner) {
      return "Click 'New Hand' to deal the next hand";
    }
    
    if (gameState.currentRound === 5) {
      return "Click 'Mark Winner' to select who won this hand";
    }
    
    if (activePlayers.length <= 1) {
      return "Only one player left. End the hand or proceed to next round";
    }
    
    const roundInstructions = [
      "Players bet in turn, starting left of big blind", // Pre-flop
      "Dealer placed 3 community cards. Players bet in turn", // Flop
      "Dealer placed 4th community card. Players bet in turn", // Turn
      "Dealer placed 5th community card. Players bet in turn", // River
      "Players reveal their hands. Select the winner" // Showdown
    ];
    
    return roundInstructions[Math.min(gameState.currentRound - 1, roundInstructions.length - 1)];
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
      
      {/* Dealer and Blinds Info Card */}
      {!gameState.winner && gameState.dealerIndex !== undefined && (
        <Card className="bg-card border border-primary/10 shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-medium">Texas Hold'em Structure</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <span className="font-bold">D</span>
                  <span>{gameState.players[gameState.dealerIndex].name}</span>
                </Badge>
                
                <Badge variant="outline" className="flex items-center gap-1">
                  <span>SB</span>
                  <span>{formatCurrency(gameState.blinds.small)}</span>
                  <span>{gameState.players[(gameState.dealerIndex + 1) % gameState.players.length].name}</span>
                </Badge>
                
                <Badge variant="outline" className="flex items-center gap-1">
                  <span>BB</span>
                  <span>{formatCurrency(gameState.blinds.big)}</span>
                  <span>{gameState.players[(gameState.dealerIndex + 2) % gameState.players.length].name}</span>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
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

      {/* Auto-advance toggle */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-muted-foreground">Auto-advance:</span>
        <button 
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${autoAdvance ? 'bg-primary' : 'bg-input'}`}
          onClick={() => setAutoAdvance(!autoAdvance)}
          role="switch"
          aria-checked={autoAdvance}
        >
          <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${autoAdvance ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Texas Hold'em Step Tracker */}
      <Card className="bg-card border border-amber-200/50 shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="font-medium">
                Current Stage: {currentRoundLabel()}
              </Badge>
              <Badge
                variant="outline"
                className="font-normal"
              >
                Hand Progress: {Math.min(gameState.currentRound, 5)}/5
              </Badge>
            </div>
            
            <div className="w-full bg-secondary/30 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${Math.min(gameState.currentRound * 20, 100)}%` }}
              ></div>
            </div>

            <div className="text-sm text-muted-foreground">
              {getNextStepInstructions()}
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
      
      {/* Current Action Description */}
      <Card className="bg-card border-l-4 border-l-primary border shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center">
            <ArrowDown className="h-4 w-4 mr-2 text-primary animate-bounce" />
            <p className="text-sm font-medium">{getCurrentActionDescription()}</p>
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
            onBetComplete={handleNextPlayer}
            autoAdvance={autoAdvance}
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
