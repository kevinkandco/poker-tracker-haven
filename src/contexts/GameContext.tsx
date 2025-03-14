
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

// Types
interface Player {
  id: string;
  name: string;
  buyIn: number;
  currentStack: number;
  bets: { round: number; amount: number }[];
  totalBet: number;
  currentBet?: number;
  folded?: boolean;
}

interface GameState {
  players: Player[];
  blinds: {
    small: number;
    big: number;
  };
  currentRound: number;
  startTime: string;
  endTime?: string;
}

interface GameContextType {
  gameState: GameState;
  startGame: (initialState: GameState) => void;
  addBet: (playerId: string, amount: number) => void;
  updateCurrentBet: (playerId: string, amount: number) => void;
  submitBet: (playerId: string) => void;
  nextRound: () => void;
  increaseBlindLevel: () => void;
  buyIn: (playerId: string) => void;
  fold: (playerId: string) => void;
  endGame: () => void;
}

// Create context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Initial state
const initialGameState: GameState = {
  players: [],
  blinds: {
    small: 1,
    big: 2,
  },
  currentRound: 1,
  startTime: '',
};

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  // Start a new game
  const startGame = (initialState: GameState) => {
    setGameState({
      ...initialState,
      currentRound: 1,
    });
  };

  // Add a bet for a player
  const addBet = (playerId: string, amount: number) => {
    setGameState(prevState => ({
      ...prevState,
      players: prevState.players.map(player => {
        if (player.id === playerId) {
          // Don't allow betting more than current stack
          const validAmount = Math.min(amount, player.currentStack);
          
          return {
            ...player,
            currentStack: player.currentStack - validAmount,
            bets: [
              ...player.bets,
              { round: prevState.currentRound, amount: validAmount }
            ],
            totalBet: player.totalBet + validAmount,
          };
        }
        return player;
      }),
    }));
  };

  // Update the current bet amount before submitting
  const updateCurrentBet = (playerId: string, amount: number) => {
    setGameState(prevState => ({
      ...prevState,
      players: prevState.players.map(player => {
        if (player.id === playerId) {
          return {
            ...player,
            currentBet: amount,
          };
        }
        return player;
      }),
    }));
  };

  // Submit the current bet
  const submitBet = (playerId: string) => {
    setGameState(prevState => {
      const player = prevState.players.find(p => p.id === playerId);
      
      if (!player || !player.currentBet) {
        return prevState;
      }
      
      const betAmount = Math.min(player.currentBet, player.currentStack);
      
      return {
        ...prevState,
        players: prevState.players.map(p => {
          if (p.id === playerId) {
            return {
              ...p,
              currentStack: p.currentStack - betAmount,
              bets: [
                ...p.bets,
                { round: prevState.currentRound, amount: betAmount }
              ],
              totalBet: p.totalBet + betAmount,
              currentBet: undefined, // Clear current bet
            };
          }
          return p;
        }),
      };
    });
  };

  // Move to the next round
  const nextRound = () => {
    setGameState(prevState => ({
      ...prevState,
      currentRound: prevState.currentRound + 1,
      players: prevState.players.map(player => ({
        ...player,
        currentBet: undefined,
        folded: false, // Reset folded status for new round
      })),
    }));
  };

  // Increase the blind level
  const increaseBlindLevel = () => {
    setGameState(prevState => ({
      ...prevState,
      blinds: {
        small: prevState.blinds.small * 2,
        big: prevState.blinds.big * 2,
      },
    }));
  };

  // Allow a player to buy in more chips
  const buyIn = (playerId: string) => {
    // Show toast for now, could be expanded to a dialog
    toast("Buy-in feature coming soon!", {
      description: "This feature will be available in the next update."
    });
  };

  // Mark a player as folded for the current round
  const fold = (playerId: string) => {
    setGameState(prevState => ({
      ...prevState,
      players: prevState.players.map(player => {
        if (player.id === playerId) {
          return {
            ...player,
            folded: true,
            currentBet: undefined, // Clear any pending bet
          };
        }
        return player;
      }),
    }));
  };

  // End the current game
  const endGame = () => {
    setGameState({
      ...initialGameState,
      endTime: new Date().toISOString(),
    });
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        startGame,
        addBet,
        updateCurrentBet,
        submitBet,
        nextRound,
        increaseBlindLevel,
        buyIn,
        fold,
        endGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
