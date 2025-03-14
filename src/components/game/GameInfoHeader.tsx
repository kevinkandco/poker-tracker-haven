
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserRound, Trophy, Coins } from 'lucide-react';
import { getCurrentRoundLabel } from './utils/gameHelpers';

interface GameInfoHeaderProps {
  currentHand: number;
  currentRound: number;
  blinds: {
    small: number;
    big: number;
  };
  dealerName?: string | null;
  winnerName?: string | null;
}

const GameInfoHeader: React.FC<GameInfoHeaderProps> = ({
  currentHand,
  currentRound,
  blinds,
  dealerName,
  winnerName
}) => {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold tracking-tight">Poker Tracker</h2>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-normal">Hand #{currentHand}</Badge>
          <Badge variant="secondary" className="font-medium">{getCurrentRoundLabel(currentRound)}</Badge>
        </div>
        <div className="hidden sm:block">•</div>
        <div className="flex items-center gap-1">
          <Coins className="h-4 w-4 text-amber-500" />
          Blinds: ${blinds.small}/${blinds.big}
        </div>
        {dealerName && (
          <>
            <div className="hidden sm:block">•</div>
            <div className="flex items-center gap-1 text-primary font-medium">
              <UserRound className="h-4 w-4" />
              {dealerName} dealing
            </div>
          </>
        )}
        {winnerName && (
          <>
            <div className="hidden sm:block">•</div>
            <div className="flex items-center gap-1 text-emerald-500 font-medium">
              <Trophy className="h-4 w-4" />
              {winnerName} won
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GameInfoHeader;
