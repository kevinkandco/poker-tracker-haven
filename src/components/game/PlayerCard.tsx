
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MinusCircle, RotateCw, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGameContext } from '@/contexts/GameContext';

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
  
  // Get current bet for this round
  const currentBet = player.currentBet || 0;
  
  // Get total bets for this player
  const totalBet = player.totalBet || 0;
  
  // Suggested bet amounts 
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
        
        {!isActive && !player.folded && !gameState.winner && (
          <CardFooter className="p-3 pt-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full h-8"
              onClick={() => buyIn(player.id)}
            >
              <RotateCw className="h-3.5 w-3.5 mr-1" />
              Buy In
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default PlayerCard;
