import React, { useState, useEffect } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getTotalPot } from './utils/gameHelpers';

// Component imports
import GameInfoHeader from './GameInfoHeader';
import TableStructureCard from './TableStructureCard';
import PotDisplay from './PotDisplay';
import AutoAdvanceToggle from './AutoAdvanceToggle';
import GameStageTracker from './GameStageTracker';
import NextActionCard from './NextActionCard';
import PlayerCard from './PlayerCard';
import GameControlButtons from './GameControlButtons';
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
  const [isAdvancing, setIsAdvancing] = useState(false); // Add state to track if we're in the process of advancing
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
      setIsAdvancing(true); // Set flag to prevent multiple triggers
      
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
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Game info header */}
      <GameInfoHeader 
        currentHand={gameState.currentHand}
        currentRound={gameState.currentRound}
        blinds={gameState.blinds}
        dealerName={dealerName}
        winnerName={winnerName}
      />
      
      {/* Dealer and Blinds Info Card */}
      {!gameState.winner && gameState.dealerIndex !== undefined && (
        <TableStructureCard 
          dealerIndex={gameState.dealerIndex}
          players={gameState.players}
          blinds={gameState.blinds}
        />
      )}
      
      {/* Pot Display Card */}
      <PotDisplay 
        players={gameState.players}
        gameState={gameState}
        onShowShareDialog={() => setShowShareDialog(true)}
        onIncreaseBlindLevel={handleIncreaseBlindLevel}
        onShowWinnerDialog={() => setShowWinnerDialog(true)}
      />

      {/* Auto-advance toggle */}
      <AutoAdvanceToggle 
        autoAdvance={autoAdvance}
        onToggle={() => setAutoAdvance(!autoAdvance)}
      />

      {/* Texas Hold'em Step Tracker */}
      <GameStageTracker 
        currentRound={gameState.currentRound}
        activePlayers={activePlayers}
        gameState={gameState}
      />

      {/* Next Action Cards */}
      {activePlayer && (
        <NextActionCard 
          gameState={gameState}
          activePlayer={activePlayer}
          onNextPlayer={handleNextPlayer}
        />
      )}
      
      {/* Player Cards Grid */}
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
      
      {/* Game Control Buttons */}
      <GameControlButtons 
        gameState={gameState}
        onNextPlayer={handleNextPlayer}
        onNextRound={handleNextRound}
        onNewHand={handleNewHand}
        onEndGame={handleEndGame}
      />
      
      {/* Share Dialog */}
      <ShareDialog 
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        shareUrl={shareUrl}
        onCopyLink={copyShareLink}
      />

      {/* Winner Selection Dialog */}
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
