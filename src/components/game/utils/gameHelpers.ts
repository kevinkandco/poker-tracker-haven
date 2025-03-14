
/**
 * Utility functions for the poker game UI
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
  
  const roundDescriptions = [
    `Pre-flop betting: ${activePlayer.name}'s turn to bet`,
    `Flop betting: ${activePlayer.name}'s turn to bet`,
    `Turn betting: ${activePlayer.name}'s turn to bet`,
    `River betting: ${activePlayer.name}'s turn to bet`,
    `Showdown: Players reveal their hands`
  ];
  
  return roundDescriptions[Math.min(gameState.currentRound - 1, roundDescriptions.length - 1)];
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
    return "Showdown - Select Winner";
  }
  
  if (activePlayer) {
    return `${activePlayer.name}'s turn to bet`;
  }
  
  return "Next player's turn";
};

// Get instructions for the next step in the game
export const getNextStepInstructions = (
  gameState: any,
  activePlayers: any[]
): string => {
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

// Check if round is complete
export const getTotalPot = (players: any[]): number => {
  return players.reduce((sum, player) => sum + player.totalBet, 0);
};
