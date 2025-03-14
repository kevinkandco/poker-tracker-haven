
import React, { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Container from '@/components/layout/Container';
import GameSetup from '@/components/game/GameSetup';
import BettingTracker from '@/components/game/BettingTracker';
import { useGameContext } from '@/contexts/GameContext';
import { useLocation } from 'react-router-dom';

const GameSession = () => {
  const { gameState } = useGameContext();
  const gameInProgress = gameState.players.length > 0;
  const location = useLocation();

  // Check for gameId in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const gameId = params.get('gameId');
    
    if (gameId) {
      console.log(`Joining shared game: ${gameId}`);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <Container className="px-4 md:px-6">
          {gameInProgress ? <BettingTracker /> : <GameSetup />}
        </Container>
      </main>
    </div>
  );
};

export default GameSession;
