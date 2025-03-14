
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TableStructureCardProps {
  dealerIndex?: number;
  players: any[];
  blinds: {
    small: number;
    big: number;
  };
}

const TableStructureCard: React.FC<TableStructureCardProps> = ({
  dealerIndex,
  players,
  blinds
}) => {
  // Don't render if there's no dealer assigned
  if (dealerIndex === undefined || players.length === 0) {
    return null;
  }

  const dealerName = players[dealerIndex]?.name;
  const smallBlindIndex = (dealerIndex + 1) % players.length;
  const bigBlindIndex = (dealerIndex + 2) % players.length;
  const smallBlindName = players[smallBlindIndex]?.name;
  const bigBlindName = players[bigBlindIndex]?.name;

  return (
    <Card className="bg-card border border-primary/10 shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-medium">Table Structure</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <span className="font-bold">D</span>
              <span>{dealerName}</span>
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1">
              <span>SB</span>
              <span>${blinds.small}</span>
              <span>{smallBlindName}</span>
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1">
              <span>BB</span>
              <span>${blinds.big}</span>
              <span>{bigBlindName}</span>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TableStructureCard;
