
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, DollarSign } from 'lucide-react';
import { useGameContext } from '@/contexts/GameContext';
import { toast } from 'sonner';

interface JoinGameFormProps {
  inviteCode: string;
  onJoinSuccess?: () => void;
}

const JoinGameForm: React.FC<JoinGameFormProps> = ({ inviteCode, onJoinSuccess }) => {
  const [playerName, setPlayerName] = useState('');
  const [buyInAmount, setBuyInAmount] = useState(50);
  const { addAnonymousPlayer, gameState } = useGameContext();
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (buyInAmount <= 0) {
      toast.error("Buy-in amount must be greater than 0");
      return;
    }

    // Check if the game allows anonymous joining
    if (!gameState.allowAnonymousJoin) {
      toast.error("This game doesn't allow anonymous joining");
      return;
    }

    setIsJoining(true);
    try {
      await addAnonymousPlayer(playerName, buyInAmount);
      
      if (onJoinSuccess) {
        onJoinSuccess();
      }
    } catch (error) {
      console.error("Error joining game:", error);
      toast.error("Failed to join the game");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="player-name">Your Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="player-name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="buy-in-amount">Buy-In Amount</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="buy-in-amount"
            type="number"
            min={1}
            value={buyInAmount}
            onChange={(e) => setBuyInAmount(parseInt(e.target.value) || 0)}
            className="pl-10"
          />
        </div>
      </div>

      <Button 
        onClick={handleJoin} 
        className="w-full"
        disabled={isJoining}
      >
        {isJoining ? "Joining..." : "Join Game"}
      </Button>
    </div>
  );
};

export default JoinGameForm;
