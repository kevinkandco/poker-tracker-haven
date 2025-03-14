import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MinusCircle, RotateCw, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGameContext } from '@/contexts/GameContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface PlayerCardProps {
  playerId: string;
  playerIndex: number;
  isActive?: boolean;
  isWinner?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  playerId, 
  playerIndex, 
  isActive = false,
  isWinner = false 
}) => {
  const { 
    gameState, 
    addBet, 
    updateCurrentBet, 
    submitBet, 
    buyIn, 
    fold
  } = useGameContext();
  
  const player = gameState.players.find(p => p.id === playerId);
  const [betAmount, setBetAmount] = useState("");
  const [showBuyInDialog, setShowBuyInDialog] = useState(false);
  const [buyInAmount, setBuyInAmount] = useState<string>("");
  
  if (!player) return null;
  
  const formatCurrency = (amount: number) => {
    return `$${amount}`;
  };
  
  const handleQuickBet = (amount: number) => {
    if (player.currentStack < amount) {
      amount = player.currentStack; // All-in
    }
    updateCurrentBet(player.id, amount);
  };
  
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setBetAmount(value);
      const numValue = parseInt(value) || 0;
      updateCurrentBet(player.id, numValue > player.currentStack ? player.currentStack : numValue);
    }
  };
  
  const handleBetSubmit = () => {
    submitBet(player.id);
    setBetAmount("");
  };
  
  const handleFold = () => {
    fold(player.id);
  };
  
  const handleBuyIn = () => {
    const amount = parseInt(buyInAmount);
    if (amount > 0) {
      buyIn(player.id, amount);
      setShowBuyInDialog(false);
      setBuyInAmount("");
    }
  };

  const quickBuyInOptions = [
    player.buyIn / 2, // Half buy-in
    player.buyIn,     // Full buy-in
    player.buyIn * 2  // Double buy-in
  ];

  const currentBet = player.currentBet || 0;
  
  const totalBet = player.totalBet || 0;
  
  const suggestedBets = [
    gameState.blinds.big * 2,  // Min raise
    gameState.blinds.big * 4,  // 2x raise
    player.currentStack        // All-in
  ].filter(amount => amount > 0 && amount <= player.currentStack);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, delay: playerIndex * 0.05 }}
    >
      <Card className={cn(
        "overflow-hidden transition-all duration-300",
        isActive ? "ring-2 ring-primary shadow-md" : "",
        isWinner ? "ring-2 ring-emerald-500 shadow-md" : "",
        player.folded ? "opacity-60" : ""
      )}>
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium truncate text-base">
              {player.name}
              {isWinner && (
                <span className="ml-2 inline-flex items-center text-emerald-500">
                  <Trophy className="h-4 w-4 mr-0.5" />
                  Winner
                </span>
              )}
            </h3>
            {player.folded && <Badge variant="outline">Folded</Badge>}
          </div>
          
          <div className="flex justify-between items-center mb-5">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Stack</p>
              <p className="text-xl font-semibold">{formatCurrency(player.currentStack)}</p>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Total Bet</p>
              <p className="text-xl font-semibold">{formatCurrency(totalBet)}</p>
            </div>
          </div>
          
          <AnimatePresence>
            {!player.folded && isActive && !gameState.winner && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="flex gap-2">
                  {suggestedBets.map((amount, i) => (
                    <Button 
                      key={i}
                      variant="outline" 
                      size="sm"
                      onClick={() => handleQuickBet(amount)}
                      className="px-2 h-7 text-xs flex-1"
                    >
                      {amount === player.currentStack 
                        ? "All-in" 
                        : formatCurrency(amount)
                      }
                    </Button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => {
                      const newAmount = Math.max(0, (parseInt(betAmount) || 0) - gameState.blinds.big);
                      setBetAmount(newAmount.toString());
                      updateCurrentBet(player.id, newAmount);
                    }}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  
                  <Input
                    value={betAmount}
                    onChange={handleBetAmountChange}
                    className="h-8 text-center input-focus"
                    placeholder={`Bet amount...`}
                  />
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => {
                      const newAmount = Math.min(
                        player.currentStack, 
                        (parseInt(betAmount) || 0) + gameState.blinds.big
                      );
                      setBetAmount(newAmount.toString());
                      updateCurrentBet(player.id, newAmount);
                    }}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                
                {currentBet > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-sm font-medium"
                  >
                    Current bet: {formatCurrency(currentBet)}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        
        {!player.folded && isActive && !gameState.winner && (
          <CardFooter className="flex p-3 pt-0 gap-2">
            <Button 
              variant="default" 
              className="flex-1 h-9 button-hover"
              onClick={handleBetSubmit}
              disabled={currentBet <= 0}
            >
              Bet
            </Button>
            <Button 
              variant="outline" 
              className="h-9"
              onClick={handleFold}
            >
              Fold
            </Button>
          </CardFooter>
        )}
        
        {!player.folded && (
          <CardFooter className="p-3 pt-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full h-8"
              onClick={() => setShowBuyInDialog(true)}
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1" />
              Buy In
            </Button>
          </CardFooter>
        )}

        <Dialog open={showBuyInDialog} onOpenChange={setShowBuyInDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buy in for {player.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-muted-foreground">Current stack: {formatCurrency(player.currentStack)}</p>
                <p className="text-sm text-muted-foreground">Initial buy-in: {formatCurrency(player.buyIn)}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {quickBuyInOptions.map((amount, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    onClick={() => setBuyInAmount(amount.toString())}
                    className="flex-1"
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="buy-in-amount" className="text-sm font-medium">
                  Amount:
                </label>
                <Input
                  id="buy-in-amount"
                  type="number"
                  min="1"
                  value={buyInAmount}
                  onChange={(e) => setBuyInAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="w-full"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBuyInDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleBuyIn} disabled={!buyInAmount || parseInt(buyInAmount) <= 0}>
                Buy In
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </motion.div>
  );
};

export default PlayerCard;
