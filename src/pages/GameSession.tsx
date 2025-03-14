import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Container from '@/components/layout/Container';
import GameSetup from '@/components/game/GameSetup';
import BettingTracker from '@/components/game/BettingTracker';
import { useGameContext } from '@/contexts/GameContext';
import { useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import JoinGameForm from '@/components/game/JoinGameForm';
import { toast } from 'sonner';
import { Info, PlayCircle, DollarSign, Users, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const GameSession = () => {
  const { gameState, loadGameByInviteCode } = useGameContext();
  const gameInProgress = gameState.players.length > 0;
  const location = useLocation();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check for invite code in URL
  useEffect(() => {
    const loadGame = async () => {
      setIsLoading(true);
      const params = new URLSearchParams(location.search);
      const inviteFromUrl = params.get('invite');
      
      if (inviteFromUrl && !gameInProgress) {
        console.log(`Checking invite code: ${inviteFromUrl}`);
        const gameExists = await loadGameByInviteCode(inviteFromUrl);
        
        if (gameExists && gameState.allowAnonymousJoin) {
          setInviteCode(inviteFromUrl);
          setShowJoinDialog(true);
        } else if (!gameExists) {
          toast.error("Invalid or expired invite code");
        } else if (!gameState.allowAnonymousJoin) {
          toast.error("This game doesn't allow anonymous joining");
        }
      }
      
      setIsLoading(false);
    };
    
    loadGame();
  }, [location, gameState.allowAnonymousJoin, gameInProgress, loadGameByInviteCode]);

  // Show help dialog for new games automatically
  useEffect(() => {
    if (gameInProgress && gameState.currentHand === 1 && gameState.currentRound === 1) {
      // Only show after a short delay so it doesn't instantly pop up
      const timer = setTimeout(() => {
        setShowHelpDialog(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameInProgress, gameState.currentHand, gameState.currentRound]);

  const handleJoinSuccess = () => {
    setShowJoinDialog(false);
  };

  // Get the current stage description based on round
  const getCurrentGameStageDescription = () => {
    if (!gameInProgress) return null;
    
    if (gameState.winner) {
      return {
        title: "Showdown Complete",
        description: `${gameState.players.find(p => p.id === gameState.winner)?.name} won the pot!`,
        nextAction: "Click 'New Hand' to deal again"
      };
    }
    
    const stages = [
      {
        title: "1. Pre-Flop Betting",
        description: "Each player has received 2 private cards. Betting starts with the player left of the big blind (UTG).",
        nextAction: "Players must call, raise, or fold in turn"
      },
      {
        title: "2. The Flop",
        description: "Dealer has placed 3 community cards face up. Another round of betting begins.",
        nextAction: "Players can check, bet, call, raise, or fold"
      },
      {
        title: "3. The Turn",
        description: "Dealer has placed the 4th community card face up. Another round of betting begins.",
        nextAction: "Players can check, bet, call, raise, or fold"
      },
      {
        title: "4. The River",
        description: "Dealer has placed the 5th and final community card face up. The final betting round begins.",
        nextAction: "Players can check, bet, call, raise, or fold"
      },
      {
        title: "5. Showdown",
        description: "All betting is complete. Players reveal their cards to determine the winner.",
        nextAction: "Select the winner with the best 5-card hand"
      }
    ];
    
    return stages[Math.min(gameState.currentRound - 1, stages.length - 1)];
  };
  
  const stageInfo = getCurrentGameStageDescription();

  // Get player seating arrangement visualization
  const getTableVisualization = () => {
    if (!gameInProgress || gameState.dealerIndex === undefined) return null;
    
    const numPlayers = gameState.players.length;
    if (numPlayers < 2) return null;
    
    const dealerName = gameState.players[gameState.dealerIndex].name;
    const sbIndex = (gameState.dealerIndex + 1) % numPlayers;
    const bbIndex = (gameState.dealerIndex + 2) % numPlayers;
    const sbName = gameState.players[sbIndex].name;
    const bbName = gameState.players[bbIndex].name;
    
    return {
      dealer: { name: dealerName, position: "Dealer (D)" },
      smallBlind: { name: sbName, position: "Small Blind (SB)", amount: gameState.blinds.small },
      bigBlind: { name: bbName, position: "Big Blind (BB)", amount: gameState.blinds.big },
      firstToAct: numPlayers > 3 
        ? { name: gameState.players[(bbIndex + 1) % numPlayers].name, position: "First to Act (UTG)" }
        : null
    };
  };
  
  const tableInfo = getTableVisualization();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <Container className="px-4 md:px-6">
          {gameInProgress ? (
            <>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-semibold tracking-tight">Texas Hold'em Poker</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowHelpDialog(true)}
                  className="flex items-center gap-1.5"
                >
                  <Info className="h-4 w-4" />
                  How to Play
                </Button>
              </div>
              
              {/* Table Layout & Player Positions Card */}
              {tableInfo && !gameState.winner && (
                <Card className="mb-6 bg-card shadow-sm border-primary/20">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Table Layout
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="rounded-md bg-primary/5 p-2 border border-primary/10">
                        <p className="text-xs text-muted-foreground mb-1">Dealer (D)</p>
                        <p className="font-medium">{tableInfo.dealer.name}</p>
                      </div>
                      <div className="rounded-md bg-primary/5 p-2 border border-primary/10">
                        <p className="text-xs text-muted-foreground mb-1">Small Blind (${tableInfo.smallBlind.amount})</p>
                        <p className="font-medium">{tableInfo.smallBlind.name}</p>
                      </div>
                      <div className="rounded-md bg-primary/5 p-2 border border-primary/10">
                        <p className="text-xs text-muted-foreground mb-1">Big Blind (${tableInfo.bigBlind.amount})</p>
                        <p className="font-medium">{tableInfo.bigBlind.name}</p>
                      </div>
                      {tableInfo.firstToAct && (
                        <div className="rounded-md bg-amber-50 p-2 border border-amber-200">
                          <p className="text-xs text-muted-foreground mb-1">First to Act (UTG)</p>
                          <p className="font-medium">{tableInfo.firstToAct.name}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-3">
                      Play proceeds clockwise around the table, starting with the player to the left of the big blind.
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current Stage Info Card */}
              {stageInfo && (
                <Card className="mb-6 bg-card border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex gap-3 items-start">
                      <PlayCircle className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-lg">{stageInfo.title}</h3>
                          <Badge variant="outline" className="text-xs h-5">
                            Stage {gameState.currentRound}/5
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{stageInfo.description}</p>
                        <p className="text-sm mt-1 font-medium text-primary">{stageInfo.nextAction}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Pot Summary Card */}
              {gameInProgress && (
                <Card className="mb-6 bg-amber-50/30 border-amber-200/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CircleDot className="h-5 w-5 text-amber-500" />
                      <div className="font-medium">Community Cards</div>
                      <Badge variant="outline" className="ml-auto">
                        {gameState.currentRound === 1 ? "Not yet dealt" :
                         gameState.currentRound === 2 ? "Flop (3 cards)" :
                         gameState.currentRound === 3 ? "Turn (4 cards)" :
                         gameState.currentRound === 4 ? "River (5 cards)" : "Complete"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-5 gap-2 mt-3">
                      {[...Array(5)].map((_, i) => {
                        const isVisible = gameState.currentRound >= 2 && i < (
                          gameState.currentRound === 2 ? 3 :
                          gameState.currentRound === 3 ? 4 :
                          gameState.currentRound >= 4 ? 5 : 0
                        );
                        
                        return (
                          <div key={i} className={`h-12 rounded-md border flex items-center justify-center ${
                            isVisible ? "bg-card border-primary/20" : "bg-secondary/20 border-dashed border-secondary/40"
                          }`}>
                            {isVisible ? (
                              <span className="text-xs">{
                                i < 3 ? "Flop" : 
                                i === 3 ? "Turn" : 
                                "River"
                              }</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">?</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <BettingTracker />
            </>
          ) : (
            <GameSetup />
          )}
        </Container>
      </main>
      
      {/* Join Game Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Poker Game</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4 text-muted-foreground">
              You've been invited to join a poker game. Enter your details below:
            </p>
            <JoinGameForm 
              inviteCode={inviteCode} 
              onJoinSuccess={handleJoinSuccess} 
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* How to Play Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>How to Play Texas Hold'em</DialogTitle>
            <DialogDescription>
              Follow these steps to play a hand of Texas Hold'em Poker
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[70vh] pr-2">
            <div className="space-y-6 text-sm">
              {/* Game Setup Section */}
              <div className="border rounded-md p-4 space-y-3">
                <h3 className="text-lg font-semibold text-primary">1. Game Setup & Table</h3>
                
                <div className="space-y-2">
                  <h4 className="font-medium">1.1 Table & Players</h4>
                  <p className="text-muted-foreground">
                    • Game Table: Displays player positions with 2-10 player seats.<br />
                    • Dealer Button (D): Rotates clockwise each hand.<br />
                    • Chips Display: Each player's stack size is visible.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">1.2 Posting Blinds</h4>
                  <p className="text-muted-foreground">
                    • Small Blind (SB): Auto-posted by the player left of the dealer.<br />
                    • Big Blind (BB): Auto-posted by the player left of the SB.<br />
                    • Blinds Increase: Based on game rules (can be increased during play).
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">1.3 Dealing Hole Cards</h4>
                  <p className="text-muted-foreground">
                    • Each player receives two private cards.<br />
                    • In a physical game, players can peek at their hole cards.<br />
                    • Pre-flop action begins with the player left of the BB.
                  </p>
                </div>
              </div>

              {/* Pre-Flop Action Section */}
              <div className="border rounded-md p-4 space-y-3">
                <h3 className="text-lg font-semibold text-primary">2. Pre-Flop Action (First Betting Round)</h3>
                
                <div className="space-y-2">
                  <h4 className="font-medium">2.1 Player Actions</h4>
                  <p className="text-muted-foreground">
                    • Turn Order: Begins with the player left of the BB (Under The Gun).<br />
                    • Action Options:<br />
                    &nbsp;&nbsp;- Fold: Forfeit hand.<br />
                    &nbsp;&nbsp;- Call: Match the current bet.<br />
                    &nbsp;&nbsp;- Raise: Enter a new bet amount.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">2.3 Moving to Next Player</h4>
                  <p className="text-muted-foreground">
                    • Once a player acts, action moves clockwise.<br />
                    • Betting continues until all players:<br />
                    &nbsp;&nbsp;- Have called or folded OR<br />
                    &nbsp;&nbsp;- One player raises and all others call or fold.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">2.4 End of Pre-Flop</h4>
                  <p className="text-muted-foreground">
                    • When all bets are equalized, dealer reveals the flop.
                  </p>
                </div>
              </div>

              {/* The Flop Section */}
              <div className="border rounded-md p-4 space-y-3">
                <h3 className="text-lg font-semibold text-primary">3. The Flop (Second Betting Round)</h3>
                
                <div className="space-y-2">
                  <h4 className="font-medium">3.1 Community Cards Reveal</h4>
                  <p className="text-muted-foreground">
                    • Dealer places three face-up cards in the center.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">3.2 Betting Round</h4>
                  <p className="text-muted-foreground">
                    • Turn Order: Starts with the first active player left of the dealer.<br />
                    • Action Options:<br />
                    &nbsp;&nbsp;- Check: No bet, pass action.<br />
                    &nbsp;&nbsp;- Bet: Place a new bet.<br />
                    &nbsp;&nbsp;- Call: Match existing bet.<br />
                    &nbsp;&nbsp;- Raise: Increase existing bet.<br />
                    &nbsp;&nbsp;- Fold: Exit the hand.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">3.3 End of Flop Round</h4>
                  <p className="text-muted-foreground">
                    • Once betting is settled, dealer reveals the turn card.
                  </p>
                </div>
              </div>

              {/* The Turn Section */}
              <div className="border rounded-md p-4 space-y-3">
                <h3 className="text-lg font-semibold text-primary">4. The Turn (Third Betting Round)</h3>
                
                <div className="space-y-2">
                  <h4 className="font-medium">4.1 Fourth Community Card Reveal</h4>
                  <p className="text-muted-foreground">
                    • Dealer places one additional face-up card.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">4.2 Betting Round (Same as Flop)</h4>
                  <p className="text-muted-foreground">
                    • Action Order: First active player left of dealer.<br />
                    • Players Choose Actions: Check, Bet, Call, Raise, Fold.<br />
                    • Betting resolves, and the dealer reveals the river.
                  </p>
                </div>
              </div>

              {/* The River Section */}
              <div className="border rounded-md p-4 space-y-3">
                <h3 className="text-lg font-semibold text-primary">5. The River (Final Betting Round)</h3>
                
                <div className="space-y-2">
                  <h4 className="font-medium">5.1 Fifth & Final Community Card Reveal</h4>
                  <p className="text-muted-foreground">
                    • Dealer places one last face-up card.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">5.2 Final Betting Round</h4>
                  <p className="text-muted-foreground">
                    • Action Order: First active player left of dealer.<br />
                    • Players Choose Actions: Check, Bet, Call, Raise, Fold.<br />
                    • Betting continues until resolved.
                  </p>
                </div>
              </div>

              {/* Showdown Section */}
              <div className="border rounded-md p-4 space-y-3">
                <h3 className="text-lg font-semibold text-primary">6. Showdown (Hand Reveal & Winner Determined)</h3>
                
                <div className="space-y-2">
                  <h4 className="font-medium">6.1 Cards Reveal</h4>
                  <p className="text-muted-foreground">
                    • If two or more players remain, hands are revealed.<br />
                    • The best five-card combination wins.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">6.2 Hand Ranking</h4>
                  <p className="text-muted-foreground">
                    • Select the player with the winning hand.<br />
                    • In case of tied hands, split the pot.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">6.3 Pot Distribution</h4>
                  <p className="text-muted-foreground">
                    • Winning player's stack updates automatically.<br />
                    • Dealer button moves clockwise for the next hand.
                  </p>
                </div>
              </div>

              {/* New Hand Section */}
              <div className="border rounded-md p-4 space-y-3">
                <h3 className="text-lg font-semibold text-primary">7. New Hand Begins</h3>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    • Dealer button moves clockwise.<br />
                    • Blinds are posted by the next players.<br />
                    • New cards are dealt.<br />
                    • Next round begins.
                  </p>
                </div>
              </div>

              <div className="border rounded-md p-4 bg-amber-50">
                <h3 className="font-medium text-amber-800">Auto-Advance Feature</h3>
                <p className="text-amber-700">
                  When auto-advance is enabled, the game will automatically move to the next round 
                  when all active players have bet equally. This helps guide beginners through the 
                  proper Texas Hold'em betting structure.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameSession;
