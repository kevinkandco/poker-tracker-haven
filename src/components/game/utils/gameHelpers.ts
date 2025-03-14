
/**
 * Simplified utility functions for the poker game UI
 */

// Format currency with dollar sign
export const formatCurrency = (amount: number): string => {
  return `$${amount}`;
};

// Get a label for the current poker round
export const getCurrentRoundLabel = (round: number): string => {
  switch(round) {
    case 1: return "Pre-flop";
    case 2: return "Flop";
    case 3: return "Turn";
    case 4: return "River";
    case 5: return "Showdown";
    default: return `Round ${round}`;
  }
};

// Get detailed betting instructions based on game state
export const getNextActionInstructions = (gameState: any, activePlayers: any[]): string => {
  // Handle win condition
  if (gameState.winner) {
    return "Hand complete! Click 'New Hand' to start the next hand.";
  }
  
  // Handle single player left (everyone else folded)
  if (activePlayers.length <= 1) {
    return "Only one player remains! End the hand and select the winner.";
  }
  
  // Get the dealer, small blind, and big blind positions
  const { dealerIndex } = gameState;
  
  if (dealerIndex === undefined || gameState.players.length === 0) {
    return "Start the game by selecting a dealer.";
  }
  
  const smallBlindIndex = (dealerIndex + 1) % gameState.players.length;
  const bigBlindIndex = (dealerIndex + 2) % gameState.players.length;
  
  // Round-specific instructions
  switch(gameState.currentRound) {
    case 1: 
      return `Pre-flop betting: Small blind (${gameState.players[smallBlindIndex]?.name}) bet $${gameState.blinds.small}, ` +
             `Big blind (${gameState.players[bigBlindIndex]?.name}) bet $${gameState.blinds.big}. ` +
             "Players must call, raise, or fold.";
    case 2:
      return "Flop: First three community cards are dealt. Continue betting round.";
    case 3:
      return "Turn: Fourth community card is dealt. Continue betting round.";
    case 4:
      return "River: Final community card is dealt. Final betting round.";
    case 5:
      return "Showdown: All players reveal their hands. Select the winner to award the pot.";
    default:
      return "Continue the current betting round.";
  }
};

// Get the current action description based on game state and active player
export const getCurrentActionDescription = (
  gameState: any,
  activePlayer: any
): string => {
  if (gameState.winner) {
    return "Hand complete. Start a new hand.";
  }
  
  if (!activePlayer) {
    return "No active players. Start a new hand.";
  }
  
  return `${activePlayer.name}'s turn to bet`;
};

// Get text for the next action button
export const getNextActionText = (
  gameState: any,
  activePlayer: any
): string => {
  if (gameState.winner) {
    return "Start new hand";
  }
  
  if (gameState.currentRound === 5) {
    return "Select Winner";
  }
  
  if (activePlayer) {
    return `${activePlayer.name}'s turn`;
  }
  
  return "Next player's turn";
};

// Get total pot amount
export const getTotalPot = (players: any[]): number => {
  return players.reduce((sum, player) => sum + player.totalBet, 0);
};
