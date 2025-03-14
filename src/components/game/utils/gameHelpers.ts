
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
