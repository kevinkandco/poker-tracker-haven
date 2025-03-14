
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

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
  dealerIndex?: number; // Track dealer position
}

interface GameContextType {
  gameState: GameState;
  startGame: (initialState: GameState) => Promise<void>;
  addBet: (playerId: string, amount: number) => void;
  updateCurrentBet: (playerId: string, amount: number) => void;
  submitBet: (playerId: string) => void;
  nextRound: () => void;
  increaseBlindLevel: () => void;
  buyIn: (playerId: string, amount?: number) => void;
  fold: (playerId: string) => void;
  endGame: () => Promise<void>;
  getShareUrl: () => string;
  resetHand: () => void;
  markWinner: (playerId: string) => void;
  addAnonymousPlayer: (name: string, buyIn: number) => Promise<void>;
  toggleAnonymousJoin: () => void;
  loadGameByInviteCode: (inviteCode: string) => Promise<boolean>;
  setDealer: (playerIndex: number) => void; // Add dealer setter
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
  dealerIndex: 0, // Default dealer is first player
};

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load game state from URL parameters on component mount
  useEffect(() => {
    const initializeFromUrl = async () => {
      // Check if there's a gameId or invite code in the URL
      const params = new URLSearchParams(window.location.search);
      const gameIdFromUrl = params.get('gameId');
      const inviteCodeFromUrl = params.get('invite');
      
      let foundGame = false;
      
      if (inviteCodeFromUrl) {
        foundGame = await loadGameByInviteCode(inviteCodeFromUrl);
        if (foundGame) {
          toast.success("Joined game via invite link!");
        }
      } else if (gameIdFromUrl) {
        // Try to load the game from Supabase
        try {
          const { data: gameData, error: gameError } = await supabase
            .from('games')
            .select('*')
            .eq('id', gameIdFromUrl)
            .single();
          
          if (gameError) throw gameError;
          
          if (gameData) {
            const { data: playersData, error: playersError } = await supabase
              .from('players')
              .select('*')
              .eq('game_id', gameData.id);
            
            if (playersError) throw playersError;
            
            if (playersData && playersData.length > 0) {
              // Transform database data to our game state format
              const players = playersData.map(player => ({
                id: player.id,
                name: player.name,
                buyIn: player.buy_in,
                currentStack: player.current_stack,
                bets: [],
                totalBet: 0,
                isAnonymous: player.is_anonymous,
              }));
              
              setGameState({
                players,
                blinds: {
                  small: gameData.small_blind,
                  big: gameData.big_blind,
                },
                currentRound: 1,
                startTime: gameData.created_at,
                gameId: gameData.id,
                currentHand: 1,
                inviteCode: gameData.invite_code,
                allowAnonymousJoin: gameData.allow_anonymous_join,
                dealerIndex: 0, // Default to first player as dealer
              });
              
              foundGame = true;
              toast.success("Loaded game from shared link!");
            }
          }
        } catch (error) {
          console.error("Error loading game:", error);
          toast.error("Failed to load game from shared link");
        }
      }
      
      // If no game found from URL, try local storage
      if (!foundGame) {
        const storedGame = localStorage.getItem('pokerGameState');
        if (storedGame) {
          try {
            const parsedState = JSON.parse(storedGame);
            setGameState(parsedState);
          } catch (error) {
            console.error('Failed to parse stored game state', error);
          }
        }
      }
      
      setIsInitialized(true);
    };
    
    initializeFromUrl();
  }, []);

  // Load a game by invite code
  const loadGameByInviteCode = async (inviteCode: string): Promise<boolean> => {
    try {
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('invite_code', inviteCode)
        .eq('active', true)
        .single();
      
      if (gameError) throw gameError;
      
      if (gameData) {
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('game_id', gameData.id);
        
        if (playersError) throw playersError;
        
        // Transform database data to our game state format
        const players = playersData ? playersData.map(player => ({
          id: player.id,
          name: player.name,
          buyIn: player.buy_in,
          currentStack: player.current_stack,
          bets: [],
          totalBet: 0,
          isAnonymous: player.is_anonymous,
        })) : [];
        
        setGameState({
          players,
          blinds: {
            small: gameData.small_blind,
            big: gameData.big_blind,
          },
          currentRound: 1,
          startTime: gameData.created_at,
          gameId: gameData.id,
          currentHand: 1,
          inviteCode: gameData.invite_code,
          allowAnonymousJoin: gameData.allow_anonymous_join,
          dealerIndex: 0, // Default to first player as dealer
        });
        
        return true;
      }
    } catch (error) {
      console.error("Error loading game by invite code:", error);
      toast.error("Failed to load game with this invite code");
    }
    
    return false;
  };

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized && gameState.players.length > 0) {
      localStorage.setItem('pokerGameState', JSON.stringify(gameState));
    }
  }, [gameState, isInitialized]);

  // Set dealer position
  const setDealer = (playerIndex: number) => {
    if (playerIndex >= 0 && playerIndex < gameState.players.length) {
      setGameState(prevState => ({
        ...prevState,
        dealerIndex: playerIndex
      }));
    }
  };

  // Start a new game
  const startGame = async (initialState: GameState) => {
    // Generate a unique invite code if not provided
    const inviteCode = initialState.inviteCode || generateInviteCode();
    const gameId = initialState.gameId || uuidv4();
    
    // Create the game in Supabase
    try {
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert([
          {
            id: gameId,
            invite_code: inviteCode,
            small_blind: initialState.blinds.small,
            big_blind: initialState.blinds.big,
            allow_anonymous_join: initialState.allowAnonymousJoin || false
          }
        ])
        .select();
      
      if (gameError) throw gameError;
      
      // Add all players to the game
      if (gameData && gameData.length > 0) {
        const playersToInsert = initialState.players.map(player => ({
          game_id: gameId,
          name: player.name,
          buy_in: player.buyIn,
          current_stack: player.buyIn,
          is_anonymous: player.isAnonymous || false
        }));
        
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .insert(playersToInsert)
          .select();
        
        if (playersError) throw playersError;
        
        // If players were successfully added, update the game state with new player IDs
        if (playersData && playersData.length > 0) {
          const updatedPlayers = playersData.map(player => ({
            id: player.id,
            name: player.name,
            buyIn: player.buy_in,
            currentStack: player.current_stack,
            bets: [],
            totalBet: 0,
            isAnonymous: player.is_anonymous
          }));
          
          const newGameState = {
            ...initialState,
            players: updatedPlayers,
            currentRound: 1,
            currentHand: 1,
            gameId,
            inviteCode,
            allowAnonymousJoin: initialState.allowAnonymousJoin || false,
            dealerIndex: 0 // First player starts as dealer
          };
          
          setGameState(newGameState);
          toast.success("Game created successfully!");
        }
      }
    } catch (error) {
      console.error("Error creating game:", error);
      toast.error("Failed to create game");
      
      // Fallback to local state only if Supabase fails
      const newGameState = {
        ...initialState,
        currentRound: 1,
        currentHand: 1,
        gameId,
        inviteCode,
        allowAnonymousJoin: initialState.allowAnonymousJoin || false,
        dealerIndex: 0 // First player starts as dealer
      };
      
      setGameState(newGameState);
    }
  };

  // Generate an invite code
  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Get shareable URL
  const getShareUrl = () => {
    if (!gameState.inviteCode) return '';
    
    const baseUrl = window.location.origin;
    return `${baseUrl}/?invite=${gameState.inviteCode}`;
  };

  // Toggle anonymous join setting
  const toggleAnonymousJoin = () => {
    setGameState(prevState => ({
      ...prevState,
      allowAnonymousJoin: !prevState.allowAnonymousJoin
    }));
    
    // Update in Supabase if we have a gameId
    if (gameState.gameId) {
      supabase
        .from('games')
        .update({
          allow_anonymous_join: !gameState.allowAnonymousJoin
        })
        .eq('id', gameState.gameId)
        .then(({ error }) => {
          if (error) {
            console.error("Error updating anonymous join setting:", error);
          }
        });
    }
  };
  
  // Add anonymous player to the game
  const addAnonymousPlayer = async (name: string, buyIn: number) => {
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
    
    // Add the player to Supabase if we have a gameId
    if (gameState.gameId) {
      try {
        const { data, error } = await supabase
          .from('players')
          .insert([
            {
              game_id: gameState.gameId,
              name,
              buy_in: buyIn,
              current_stack: buyIn,
              is_anonymous: true
            }
          ])
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const newPlayer = {
            id: data[0].id,
            name,
            buyIn,
            currentStack: buyIn,
            bets: [],
            totalBet: 0,
            isAnonymous: true
          };
          
          setGameState(prevState => ({
            ...prevState,
            players: [...prevState.players, newPlayer]
          }));
          
          toast.success(`${name} joined the game`);
        }
      } catch (error) {
        console.error("Error adding anonymous player:", error);
        toast.error("Failed to join the game");
      }
    } else {
      // Fallback to local state only
      const newPlayer = {
        id: `anon-${Date.now()}`,
        name,
        buyIn,
        currentStack: buyIn,
        bets: [],
        totalBet: 0,
        isAnonymous: true
      };
      
      setGameState(prevState => ({
        ...prevState,
        players: [...prevState.players, newPlayer]
      }));
      
      toast.success(`${name} joined the game`);
    }
  };

  // Add a bet for a player
  const addBet = (playerId: string, amount: number) => {
    setGameState(prevState => {
      const updatedPlayers = prevState.players.map(player => {
        if (player.id === playerId) {
          // Don't allow betting more than current stack
          const validAmount = Math.min(amount, player.currentStack);
          
          const updatedPlayer = {
            ...player,
            currentStack: player.currentStack - validAmount,
            bets: [
              ...player.bets,
              { round: prevState.currentRound, amount: validAmount }
            ],
            totalBet: player.totalBet + validAmount,
          };
          
          // Show toast for the bet
          const roundNames = ["Pre-flop", "Flop", "Turn", "River", "Showdown"];
          const roundName = roundNames[Math.min(prevState.currentRound - 1, roundNames.length - 1)];
          toast.success(`${player.name} bet ${validAmount} on ${roundName}`);
          
          return updatedPlayer;
        }
        return player;
      });
      
      return {
        ...prevState,
        players: updatedPlayers,
      };
    });
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
    setGameState(prevState => {
      // Determine next round name for toast message
      const newRound = prevState.currentRound + 1;
      const roundNames = ["Pre-flop", "Flop", "Turn", "River", "Showdown"];
      const roundName = roundNames[Math.min(newRound - 1, roundNames.length - 1)];
      
      return {
        ...prevState,
        currentRound: newRound,
        players: prevState.players.map(player => ({
          ...player,
          currentBet: undefined,
          folded: player.folded, // Maintain folded status between rounds
        })),
      };
    });
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
      
      const winnerName = updatedPlayers.find(p => p.id === playerId)?.name;
      toast.success(`${winnerName} won ${totalPot}!`, {
        description: "Click 'New Hand' to start the next hand"
      });
      
      return {
        ...prevState,
        players: updatedPlayers,
        winner: playerId,
      };
    });
  };

  // Reset for a new hand
  const resetHand = () => {
    setGameState(prevState => {
      // Next dealer index
      const nextDealerIndex = (prevState.dealerIndex !== undefined ? 
        (prevState.dealerIndex + 1) % prevState.players.length : 0);
      
      return {
        ...prevState,
        currentRound: 1, // Reset to first round
        currentHand: prevState.currentHand + 1, // Increment hand counter
        winner: undefined, // Clear winner
        dealerIndex: nextDealerIndex, // Move dealer button
        players: prevState.players.map(player => ({
          ...player,
          bets: [], // Clear all bets for this hand
          totalBet: 0, // Reset total bet
          currentBet: undefined, // Clear current bet
          folded: false, // Reset folded status
        })),
      };
    });
    
    toast.success(`Starting Hand #${gameState.currentHand + 1}`, {
      description: "Dealer deals 2 cards to each player"
    });
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
    setGameState(prevState => {
      const player = prevState.players.find(p => p.id === playerId);
      const playerName = player ? player.name : 'Player';

      toast.info(`${playerName} folded`);
      
      return {
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
      };
    });
  };

  // End the current game
  const endGame = async () => {
    // If we have a gameId, mark the game as inactive in Supabase
    if (gameState.gameId) {
      try {
        const { error } = await supabase
          .from('games')
          .update({
            active: false
          })
          .eq('id', gameState.gameId);
        
        if (error) throw error;
        
        toast.success("Game ended successfully");
      } catch (error) {
        console.error("Error ending game:", error);
        toast.error("Failed to end game");
      }
    }
    
    setGameState({
      ...initialGameState,
      endTime: new Date().toISOString(),
    });
    
    // Clear localStorage for this game
    localStorage.removeItem('pokerGameState');
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
        loadGameByInviteCode,
        setDealer,
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
