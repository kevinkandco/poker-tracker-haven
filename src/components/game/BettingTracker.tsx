
import React, { useState, useEffect } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getTotalPot, getCurrentRoundLabel } from './utils/gameHelpers';
import { Button } from '@/components/ui/button';

// Component imports
import TableStructureCard from './TableStructureCard';
import PotDisplay from './PotDisplay';
import GameStageTracker from './GameStageTracker';
import NextActionCard from './NextActionCard';
import PlayerCard from './PlayerCard';
import ShareDialog from './dialogs/ShareDialog';
import WinnerDialog from './dialogs/WinnerDialog';

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
  const [isAdvancing, setIsAdvancing] = useState(false);
  const shareUrl = getShareUrl();
  
  // Navigate to home if no game in progress
  React.useEffect(() => {
    if (!gameState || !gameState.players || gameState.players.length === 0) {
      navigate('/');
    }
  }, [gameState, navigate]);
  
  // Auto advance to next round when round is complete
  useEffect(() => {
    if (autoAdvance && isRoundComplete() && !gameState.winner && !isAdvancing) {
      // Add small delay for visual feedback
      setIsAdvancing(true);
      
      const timer = setTimeout(() => {
        handleNextRound();
        // Reset the advancing flag after a short delay to prevent multiple toasts
        setTimeout(() => {
          setIsAdvancing(false);
        }, 500);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [gameState, autoAdvance, isRoundComplete, isAdvancing]);
  
  if (!gameState || !gameState.players || gameState.players.length === 0) {
    return null;
  }

  const activePlayers = gameState.players.filter(player => !player.folded);
  const activePlayer = activePlayers.length > 0 ? 
    activePlayers[activePlayerIndex % activePlayers.length] : null;
  
  const handleNextPlayer = () => {
    if (activePlayers.length <= 1) {
      // Only one player left, auto-end round
      nextRound();
      return;
    }
    
    setActivePlayerIndex((activePlayerIndex + 1) % activePlayers.length);
  };
  
  const handleNextRound = () => {
    // Get round name before advancing
    const currentRoundName = getCurrentRoundLabel(gameState.currentRound);
    const nextRoundName = getCurrentRoundLabel(gameState.currentRound + 1);
    
    nextRound();

    // Show appropriate toast based on current round
    const newRound = gameState.currentRound + 1;
    switch(newRound) {
      case 2:
        toast.success(`${currentRoundName} betting complete`, {
          description: "Dealer reveals 3 community cards (The Flop)"
        });
        break;
      case 3:
        toast.success(`${currentRoundName} betting complete`, {
          description: "Dealer reveals 4th community card (The Turn)"
        });
        break;
      case 4:
        toast.success(`${currentRoundName} betting complete`, {
          description: "Dealer reveals 5th community card (The River)"
        });
        break;
      case 5:
        toast.success(`${currentRoundName} betting complete`, {
          description: "Players reveal their hands (Showdown)"
        });
        break;
      default:
        toast.success(`Moving to ${nextRoundName}`);
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
    toast.success(`Blinds increased to $${gameState.blinds.small}/$${gameState.blinds.big}`);
  };
  
  const handleEndGame = () => {
    endGame();
    navigate('/');
    toast.success("Game ended");
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
    return gameState.players[gameState.dealerIndex]?.name || null;
  };

  const winnerName = getWinnerName();
  const dealerName = getDealerName();
  const totalPot = getTotalPot(gameState.players);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Single consolidated game info card */}
      <div className="flex justify-between items-center bg-card p-3 rounded-lg border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">Hand #{gameState.currentHand} • {getCurrentRoundLabel(gameState.currentRound)}</div>
          <div className="text-xs px-2 py-0.5 bg-secondary/30 rounded-full">${gameState.blinds.small}/${gameState.blinds.big}</div>
        </div>
        <div className="font-semibold">Pot: ${totalPot}</div>
      </div>
      
      {/* Main Game Stage & Action Card */}
      <GameStageTracker 
        currentRound={gameState.currentRound}
        activePlayers={activePlayers}
        gameState={gameState}
        onNextPlayer={handleNextPlayer}
        onNextRound={handleNextRound}
        onNewHand={handleNewHand}
      />
      
      {/* Next Action Instructions (only if active player exists) */}
      {activePlayer && (
        <NextActionCard 
          gameState={gameState}
          activePlayer={activePlayer}
          onNextPlayer={handleNextPlayer}
        />
      )}
      
      {/* Player Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      
      {/* End Game Button */}
      <div className="flex justify-center mt-4">
        <Button 
          variant="outline" 
          className="text-destructive border-destructive/20 hover:bg-destructive/10"
          onClick={() => endGame()}
        >
          End Game
        </Button>
      </div>
      
      {/* Dialogs */}
      <ShareDialog 
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        shareUrl={shareUrl}
        onCopyLink={copyShareLink}
      />

      <WinnerDialog 
        open={showWinnerDialog}
        onOpenChange={setShowWinnerDialog}
        players={gameState.players}
        totalPot={totalPot}
        selectedWinner={selectedWinner}
        onWinnerChange={setSelectedWinner}
        onConfirmWinner={handleConfirmWinner}
      />
    </div>
  );
};

export default BettingTracker;
