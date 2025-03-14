import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Plus, User, DollarSign, Copy, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useGameContext } from '@/contexts/GameContext';
import BlindControl from './BlindControl';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import JoinGameForm from './JoinGameForm';
import { Switch } from '@/components/ui/switch';

interface Player {
  id: string;
  name: string;
  buyIn: number;
}

const GameSetup = () => {
  const { startGame, gameState, getShareUrl, toggleAnonymousJoin } = useGameContext();
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: '', buyIn: 50 },
    { id: '2', name: '', buyIn: 50 },
  ]);
  const [smallBlind, setSmallBlind] = useState(1);
  const [bigBlind, setBigBlind] = useState(2);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [allowAnonymousJoin, setAllowAnonymousJoin] = useState(false);
  const shareUrl = getShareUrl();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('gameId');
    const inviteCode = params.get('invite');
    
    if ((gameId || inviteCode) && gameState.players.length === 0) {
      toast.info(inviteCode ? "Joining game..." : "Loading shared game...");
    }
  }, [gameState.players.length]);

  const addPlayer = () => {
    if (players.length >= 10) {
      toast.warning("Maximum 10 players allowed");
      return;
    }
    
    setPlayers([
      ...players, 
      { 
        id: Date.now().toString(), 
        name: '', 
        buyIn: 50 
      }
    ]);
  };

  const removePlayer = (id: string) => {
    if (players.length <= 2) {
      toast.warning("Minimum 2 players required");
      return;
    }
    
    setPlayers(players.filter(player => player.id !== id));
  };

  const updatePlayer = (id: string, field: keyof Player, value: string | number) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, [field]: value } : player
    ));
  };

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    }
  };

  const handleAnonymousToggle = () => {
    setAllowAnonymousJoin(!allowAnonymousJoin);
  };

  const handleStartGame = () => {
    const emptyNames = players.some(player => !player.name.trim());
    if (emptyNames) {
      toast.error("All players must have names");
      return;
    }

    const names = players.map(p => p.name.trim());
    if (new Set(names).size !== names.length) {
      toast.error("All player names must be unique");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('gameId');

    startGame({
      players: players.map(p => ({
        id: p.id,
        name: p.name,
        buyIn: p.buyIn,
        currentStack: p.buyIn,
        bets: [],
        totalBet: 0
      })),
      blinds: {
        small: smallBlind,
        big: bigBlind
      },
      currentRound: 1,
      currentHand: 1,
      startTime: new Date().toISOString(),
      gameId: gameId || undefined,
      allowAnonymousJoin: allowAnonymousJoin
    });
    
    if (allowAnonymousJoin) {
      toggleAnonymousJoin();
    }
    
    setShowShareDialog(true);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Game Setup</h2>
          <p className="text-muted-foreground">Configure your poker game settings</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Players</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addPlayer}
                className="h-8 px-2"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Player
              </Button>
            </div>

            <div className="space-y-3">
              {players.map((player, index) => (
                <motion.div 
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-1">
                    <Label htmlFor={`player-${player.id}`} className="sr-only">
                      Player {index + 1} Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`player-${player.id}`}
                        value={player.name}
                        onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
                        placeholder={`Player ${index + 1}`}
                        className="pl-10 input-focus"
                      />
                    </div>
                  </div>
                  
                  <div className="w-[120px]">
                    <Label htmlFor={`buyin-${player.id}`} className="sr-only">
                      Buy-in Amount
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`buyin-${player.id}`}
                        type="number"
                        min={1}
                        value={player.buyIn}
                        onChange={(e) => updatePlayer(player.id, 'buyIn', parseInt(e.target.value) || 0)}
                        className="pl-10 input-focus"
                      />
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePlayer(player.id)}
                    disabled={players.length <= 2}
                    className="shrink-0 h-9 w-9 rounded-full"
                  >
                    <span className="sr-only">Remove</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          <BlindControl
            smallBlind={smallBlind}
            bigBlind={bigBlind}
            onSmallBlindChange={setSmallBlind}
            onBigBlindChange={setBigBlind}
          />

          <div className="flex items-center space-x-2 py-2">
            <Switch 
              id="allow-anonymous" 
              checked={allowAnonymousJoin}
              onCheckedChange={handleAnonymousToggle}
            />
            <Label htmlFor="allow-anonymous">
              Allow anonymous players to join via link
            </Label>
          </div>

          <div className="pt-4">
            <Button 
              className="w-full button-hover" 
              onClick={handleStartGame}
            >
              Start Game
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this game</DialogTitle>
            {allowAnonymousJoin && (
              <DialogDescription>
                You've enabled anonymous joining. Anyone with this link can join your game!
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4 text-muted-foreground">
              Share this link with other players to join your game session:
            </p>
            <div className="flex items-center gap-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={copyShareLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameSetup;
