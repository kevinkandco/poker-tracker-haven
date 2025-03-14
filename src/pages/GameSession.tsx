
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

      {/* How to Play Dialog - Simplified */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How to Play Texas Hold'em</DialogTitle>
            <DialogDescription>
              Basic steps for playing Texas Hold'em Poker
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[70vh] pr-2">
            <div className="space-y-4 text-sm">
              <div className="border rounded-md p-4">
                <h3 className="font-medium">1. Dealer & Blinds</h3>
                <p className="text-muted-foreground">
                  • Dealer button (D) rotates clockwise each hand<br />
                  • Small blind: Player left of dealer posts small blind<br />
                  • Big blind: Next player posts big blind (2x small blind)
                </p>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium">2. Pre-Flop</h3>
                <p className="text-muted-foreground">
                  • Each player gets 2 cards (not shown in app)<br />
                  • Players bet in turn, starting with player left of big blind<br />
                  • Options: Call (match current bet), Raise, or Fold
                </p>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium">3. Flop, Turn & River</h3>
                <p className="text-muted-foreground">
                  • Flop: Dealer puts 3 community cards on table<br />
                  • Turn: Dealer adds 4th community card<br />
                  • River: Dealer adds 5th community card<br />
                  • Betting round after each step
                </p>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium">4. Showdown</h3>
                <p className="text-muted-foreground">
                  • Players reveal cards (not shown in app)<br />
                  • Select winner to distribute pot<br />
                  • Dealer button moves for next hand
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
