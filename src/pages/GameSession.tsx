
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
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  const handleJoinSuccess = () => {
    setShowJoinDialog(false);
  };

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
              <div className="flex justify-end mb-2">
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
                <p className="text-muted-foreground">This app will guide you through each stage of the game. Follow the "Next Action" card to know what to do next. Click "Next Player" after each player's action, "Next Round" to move to the next betting round, and "End Hand" when the hand is complete.</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameSession;
