
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
import { Info, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
        title: "Hand Complete",
        description: `${gameState.players.find(p => p.id === gameState.winner)?.name} won the pot!`,
        nextAction: "Click 'New Hand' to deal again"
      };
    }
    
    const stages = [
      {
        title: "Pre-Flop Betting",
        description: "Each player has received 2 cards. Betting starts with the player left of the big blind.",
        nextAction: "Players call, raise, or fold"
      },
      {
        title: "The Flop",
        description: "Dealer has placed 3 community cards face up. Another round of betting begins.",
        nextAction: "Players check, bet, or fold"
      },
      {
        title: "The Turn",
        description: "Dealer has placed the 4th community card face up. Another round of betting begins.",
        nextAction: "Players check, bet, or fold"
      },
      {
        title: "The River",
        description: "Dealer has placed the 5th and final community card face up. The final betting round begins.",
        nextAction: "Players check, bet, or fold"
      },
      {
        title: "Showdown",
        description: "All betting is complete. Players reveal their cards to determine the winner.",
        nextAction: "Select the winner"
      }
    ];
    
    return stages[Math.min(gameState.currentRound - 1, stages.length - 1)];
  };
  
  const stageInfo = getCurrentGameStageDescription();

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
                <h2 className="text-2xl font-semibold tracking-tight">Poker Tracker</h2>
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
              
              {stageInfo && (
                <Card className="mb-6 bg-card border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex gap-3 items-start">
                      <PlayCircle className="h-5 w-5 mt-0.5 text-primary" />
                      <div>
                        <h3 className="font-medium text-lg">{stageInfo.title}</h3>
                        <p className="text-muted-foreground">{stageInfo.description}</p>
                        <p className="text-sm mt-1 font-medium text-primary">{stageInfo.nextAction}</p>
                      </div>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>How to Play Texas Hold'em</DialogTitle>
            <DialogDescription>
              Follow these steps to play a hand of Texas Hold'em Poker
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh] pr-2">
            <div className="space-y-4 text-sm">
              <div className="border rounded-md p-3">
                <h3 className="font-medium">1. Deal Cards & Blinds</h3>
                <p className="text-muted-foreground">The dealer (marked with a "D") deals 2 cards to each player. The small and big blinds are posted by the players to the left of the dealer.</p>
              </div>
              
              <div className="border rounded-md p-3">
                <h3 className="font-medium">2. Pre-Flop Betting</h3>
                <p className="text-muted-foreground">Starting with the player left of the big blind, each player can call, raise, or fold. The app will highlight whose turn it is to bet.</p>
              </div>
              
              <div className="border rounded-md p-3">
                <h3 className="font-medium">3. The Flop</h3>
                <p className="text-muted-foreground">After pre-flop betting, the dealer places 3 community cards face up. Another round of betting occurs, starting with the first active player to the left of the dealer.</p>
              </div>
              
              <div className="border rounded-md p-3">
                <h3 className="font-medium">4. The Turn</h3>
                <p className="text-muted-foreground">A 4th community card is dealt, followed by another betting round.</p>
              </div>
              
              <div className="border rounded-md p-3">
                <h3 className="font-medium">5. The River</h3>
                <p className="text-muted-foreground">The 5th and final community card is dealt, with a final betting round.</p>
              </div>
              
              <div className="border rounded-md p-3">
                <h3 className="font-medium">6. The Showdown</h3>
                <p className="text-muted-foreground">If there are multiple players left, they reveal their cards. The player with the best 5-card hand using any combination of their 2 hole cards and the 5 community cards wins the pot.</p>
              </div>
              
              <div className="border rounded-md p-3">
                <h3 className="font-medium">Using the App</h3>
                <p className="text-muted-foreground">This app will guide you through each stage of the game automatically. The betting will pass from player to player when they place a bet or fold. When all players have bet equally, the app will automatically advance to the next betting round. You can also toggle auto-advancement on/off if you prefer manual control.</p>
              </div>

              <div className="border rounded-md p-3 bg-amber-50">
                <h3 className="font-medium text-amber-800">Auto-Advance Feature</h3>
                <p className="text-amber-700">When auto-advance is enabled, the game will automatically move to the next round when all active players have bet equally. This helps guide beginners through the proper Texas Hold'em betting structure.</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameSession;
