
import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Container from '@/components/layout/Container';
import GameSetup from '@/components/game/GameSetup';
import BettingTracker from '@/components/game/BettingTracker';
import { useGameContext } from '@/contexts/GameContext';
import { useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import JoinGameForm from '@/components/game/JoinGameForm';
import { toast } from 'sonner';

const GameSession = () => {
  const { gameState, loadGameByInviteCode } = useGameContext();
  const gameInProgress = gameState.players.length > 0;
  const location = useLocation();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
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
          {gameInProgress ? <BettingTracker /> : <GameSetup />}
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
    </div>
  );
};

export default GameSession;
