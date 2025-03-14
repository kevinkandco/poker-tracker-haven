
import React from 'react';
import Header from '@/components/layout/Header';
import Container from '@/components/layout/Container';
import GameSetup from '@/components/game/GameSetup';
import BettingTracker from '@/components/game/BettingTracker';
import { useGameContext } from '@/contexts/GameContext';

const GameSession = () => {
  const { gameState } = useGameContext();
  const gameInProgress = gameState.players.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <Container>
          {gameInProgress ? <BettingTracker /> : <GameSetup />}
        </Container>
      </main>
    </div>
  );
};

export default GameSession;
