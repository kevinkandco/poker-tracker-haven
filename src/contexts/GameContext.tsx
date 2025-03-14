
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
  isAnonymous?: boolean;
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
  gameId?: string;
  currentHand: number; // Track current hand number
  winner?: string; // Track winner ID
  inviteCode?: string; // For sharing and joining
  allowAnonymousJoin?: boolean;
}

interface GameContextType {
  gameState: GameState;
  startGame: (initialState: GameState) => void;
  addBet: (playerId: string, amount: number) => void;
  updateCurrentBet: (playerId: string, amount: number) => void;
  submitBet: (playerId: string) => void;
  nextRound: () => void;
  increaseBlindLevel: () => void;
  buyIn: (playerId: string, amount?: number) => void;
  fold: (playerId: string) => void;
  endGame: () => void;
  getShareUrl: () => string;
  resetHand: () => void;
  markWinner: (playerId: string) => void;
  addAnonymousPlayer: (name: string, buyIn: number) => void;
  toggleAnonymousJoin: () => void;
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
  currentHand: 1, // Start with hand #1
  allowAnonymousJoin: false,
};

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  // Load game state from local storage on component mount
  useEffect(() => {
    const storedGame = localStorage.getItem('pokerGameState');
    if (storedGame) {
      try {
        const parsedState = JSON.parse(storedGame);
        setGameState(parsedState);
      } catch (error) {
        console.error('Failed to parse stored game state', error);
      }
    }
    
    // Check if there's a gameId in the URL
    const params = new URLSearchParams(window.location.search);
    const gameIdFromUrl = params.get('gameId');
    const inviteCodeFromUrl = params.get('invite');
    
    if (gameIdFromUrl) {
      // Try to load the shared game from localStorage
      const sharedGame = localStorage.getItem(`pokerGameState_${gameIdFromUrl}`);
      if (sharedGame) {
        try {
          const parsedState = JSON.parse(sharedGame);
          setGameState(parsedState);
          toast.success("Joined shared game session!");
        } catch (error) {
          console.error('Failed to parse shared game state', error);
          toast.error("Failed to join shared game");
        }
      }
    }
    
    // If we have an invite code, show the join dialog
    if (inviteCodeFromUrl) {
      // We'll handle this in the GameSession component
      console.log("Found invite code:", inviteCodeFromUrl);
    }
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (gameState.players.length > 0) {
      localStorage.setItem('pokerGameState', JSON.stringify(gameState));
      
      // If we have a gameId, also save with that key
      if (gameState.gameId) {
        localStorage.setItem(`pokerGameState_${gameState.gameId}`, JSON.stringify(gameState));
      }
    }
  }, [gameState]);

  // Start a new game
  const startGame = (initialState: GameState) => {
    // Generate a unique gameId if not provided
    const gameId = initialState.gameId || generateGameId();
    const inviteCode = initialState.inviteCode || generateInviteCode();
    
    const newGameState = {
      ...initialState,
      currentRound: 1,
      currentHand: 1, // Initialize hand counter
      gameId,
      inviteCode,
      allowAnonymousJoin: initialState.allowAnonymousJoin || false
    };
    
    setGameState(newGameState);
  };

  // Generate a unique game ID
  const generateGameId = () => {
    return Math.random().toString(36).substring(2, 10);
  };
  
  // Generate an invite code (more user-friendly than gameId)
  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Get shareable URL
  const getShareUrl = () => {
    if (!gameState.gameId || !gameState.inviteCode) return '';
    
    const baseUrl = window.location.origin;
    
    // Use inviteCode for anonymous sharing
    if (gameState.allowAnonymousJoin) {
      return `${baseUrl}/?invite=${gameState.inviteCode}`;
    }
    
    // Use gameId for normal sharing
    return `${baseUrl}/?gameId=${gameState.gameId}`;
  };

  // Toggle anonymous join setting
  const toggleAnonymousJoin = () => {
    setGameState(prevState => ({
      ...prevState,
      allowAnonymousJoin: !prevState.allowAnonymousJoin
    }));
  };
  
  // Add anonymous player to the game
  const addAnonymousPlayer = (name: string, buyIn: number) => {
    // Validate
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    
    if (buyIn <= 0) {
      toast.error("Buy-in amount must be greater than 0");
      return;
    }
    
    // Check if the game allows anonymous joining
    if (!gameState.allowAnonymousJoin) {
      toast.error("This game doesn't allow anonymous joining");
      return;
    }
    
    // Check for duplicate names
    const isDuplicateName = gameState.players.some(
      player => player.name.toLowerCase() === name.toLowerCase()
    );
    
    if (isDuplicateName) {
      toast.error("This name is already taken");
      return;
    }
    
    setGameState(prevState => ({
      ...prevState,
      players: [
        ...prevState.players,
        {
          id: `anon-${Date.now()}`,
          name,
          buyIn,
          currentStack: buyIn,
          bets: [],
          totalBet: 0,
          isAnonymous: true
        }
      ]
    }));
    
    toast.success(`${name} joined the game`);
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

  // Mark a player as the winner and award them the pot
  const markWinner = (playerId: string) => {
    setGameState(prevState => {
      // Calculate total pot
      const totalPot = prevState.players.reduce((sum, player) => sum + player.totalBet, 0);
      
      // Update the winner and award the pot
      const updatedPlayers = prevState.players.map(player => {
        if (player.id === playerId) {
          return {
            ...player,
            currentStack: player.currentStack + totalPot,
          };
        }
        return player;
      });
      
      toast.success(`${updatedPlayers.find(p => p.id === playerId)?.name} won ${totalPot}!`);
      
      return {
        ...prevState,
        players: updatedPlayers,
        winner: playerId,
      };
    });
  };

  // Reset for a new hand
  const resetHand = () => {
    setGameState(prevState => ({
      ...prevState,
      currentRound: 1, // Reset to first round
      currentHand: prevState.currentHand + 1, // Increment hand counter
      winner: undefined, // Clear winner
      players: prevState.players.map(player => ({
        ...player,
        bets: [], // Clear all bets for this hand
        totalBet: 0, // Reset total bet
        currentBet: undefined, // Clear current bet
        folded: false, // Reset folded status
      })),
    }));
    
    toast.success(`Starting Hand #${gameState.currentHand + 1}`);
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
  const buyIn = (playerId: string, amount: number = 0) => {
    if (amount <= 0) {
      // If no amount is provided, use the player's initial buy-in amount
      const player = gameState.players.find(p => p.id === playerId);
      if (player) {
        amount = player.buyIn;
      } else {
        return;
      }
    }

    setGameState(prevState => ({
      ...prevState,
      players: prevState.players.map(player => {
        if (player.id === playerId) {
          const newStack = player.currentStack + amount;
          toast.success(`${player.name} bought in for $${amount}`, {
            description: `New stack: $${newStack}`
          });
          return {
            ...player,
            currentStack: newStack,
          };
        }
        return player;
      }),
    }));
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
    
    // Clear localStorage for this game
    localStorage.removeItem('pokerGameState');
    if (gameState.gameId) {
      localStorage.removeItem(`pokerGameState_${gameState.gameId}`);
    }
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
        getShareUrl,
        resetHand,
        markWinner,
        addAnonymousPlayer,
        toggleAnonymousJoin,
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
