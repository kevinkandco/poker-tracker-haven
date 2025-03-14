
import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Container from '@/components/layout/Container';
import GameSetup from '@/components/game/GameSetup';
import BettingTracker from '@/components/game/BettingTracker';
import { useGameContext } from '@/contexts/GameContext';
import { useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import JoinGameForm from '@/components/game/JoinGameForm';

const GameSession = () => {
  const { gameState } = useGameContext();
  const gameInProgress = gameState.players.length > 0;
  const location = useLocation();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  // Check for gameId in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const gameId = params.get('gameId');
    const inviteFromUrl = params.get('invite');
    
    if (gameId) {
      console.log(`Joining shared game: ${gameId}`);
    }
    
    if (inviteFromUrl && gameState.allowAnonymousJoin) {
      setInviteCode(inviteFromUrl);
      setShowJoinDialog(true);
    }
  }, [location, gameState.allowAnonymousJoin]);

  const handleJoinSuccess = () => {
    setShowJoinDialog(false);
  };

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
