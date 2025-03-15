import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { PlusCircle, MinusCircle, Trophy, Coins, UserRound, CheckCircle, Hand } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGameContext } from '@/contexts/GameContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface PlayerCardProps {
  playerId: string;
  playerIndex: number;
  isActive?: boolean;
  isWinner?: boolean;
  isDealer?: boolean;
  isSmallBlind?: boolean;
  isBigBlind?: boolean;
  blindsPosted?: boolean;
  onBetComplete?: () => void;
  autoAdvance?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  playerId, 
  playerIndex, 
  isActive = false,
  isWinner = false,
  isDealer = false,
  isSmallBlind = false,
  isBigBlind = false,
  blindsPosted = false,
  onBetComplete,
  autoAdvance = true
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
  const [useSlider, setUseSlider] = useState(false);
  
  if (!player) return null;
  
  const formatCurrency = (amount: number) => {
    return `$${amount}`;
  };
  
  // Get the player position role
  const getPlayerRole = () => {
    if (isDealer) return "Dealer (D)";
    if (isSmallBlind) return "Small Blind (SB)";
    if (isBigBlind) return "Big Blind (BB)";
    
    const dealerIndex = gameState.dealerIndex || 0;
    const numPlayers = gameState.players.length;
    
    if (playerIndex === (dealerIndex + 3) % numPlayers) {
      return "UTG";
    }
    
    return null;
  };

  const playerRole = getPlayerRole();
  
  // Handle player making the minimum bet (call)
  const handleQuickBet = (amount: number) => {
    if (player.currentStack < amount) {
      amount = player.currentStack; // All-in
    }
    updateCurrentBet(player.id, amount);
    setBetAmount(amount.toString());
  };
  
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setBetAmount(value);
      const numValue = parseInt(value) || 0;
      updateCurrentBet(player.id, numValue > player.currentStack ? player.currentStack : numValue);
    }
  };

  const handleSliderChange = (value: number[]) => {
    const amount = value[0];
    setBetAmount(amount.toString());
    updateCurrentBet(player.id, amount);
  };
  
  const handleBetSubmit = () => {
    submitBet(player.id);
    setBetAmount("");
    setUseSlider(false);
    
    // Auto-advance to next player if enabled
    if (autoAdvance && onBetComplete) {
      setTimeout(() => {
        onBetComplete();
      }, 500); // Small delay for visual feedback
    }
  };
  
  const handleFold = () => {
    fold(player.id);
    
    // Auto-advance to next player if enabled
    if (autoAdvance && onBetComplete) {
      setTimeout(() => {
        onBetComplete();
      }, 500); // Small delay for visual feedback
    }
  };

  const handleCheck = () => {
    // Check is equivalent to betting 0
    updateCurrentBet(player.id, 0);
    submitBet(player.id);
    
    // Auto-advance to next player if enabled
    if (autoAdvance && onBetComplete) {
      setTimeout(() => {
        onBetComplete();
      }, 500); // Small delay for visual feedback
    }
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
  
  // Determine current highest bet at the table
  const highestCurrentBet = Math.max(
    ...gameState.players
      .filter(p => !p.folded)
      .map(p => {
        const currentRoundBets = p.bets
          .filter(bet => bet.round === gameState.currentRound)
          .reduce((sum, bet) => sum + bet.amount, 0);
        return currentRoundBets;
      })
  );

  // Get the current round bet for this player
  const playerCurrentRoundBet = player.bets
    .filter(bet => bet.round === gameState.currentRound)
    .reduce((sum, bet) => sum + bet.amount, 0);

  // Determine if this player can check (no need to call)
  const canCheck = highestCurrentBet === 0 || 
    playerCurrentRoundBet >= highestCurrentBet;
    
  // Calculate call amount
  const callAmount = Math.max(0, highestCurrentBet - playerCurrentRoundBet);
  
  // Calculate minimum raise amount
  const minRaiseAmount = callAmount + gameState.blinds.big;

  // For blinds, calculate how much more they need to add to complete their action
  const hasPostedSmallBlind = isSmallBlind && blindsPosted && gameState.currentRound === 1;
  const hasPostedBigBlind = isBigBlind && blindsPosted && gameState.currentRound === 1;
  
  // If small blind, they've already bet SB amount, so they need to call the difference to BB
  const sbCallAmount = hasPostedSmallBlind ? gameState.blinds.big - gameState.blinds.small : callAmount;
  
  // For big blind, they've already bet BB amount, so they need to call any additional raises
  const bbCallAmount = hasPostedBigBlind ? Math.max(0, highestCurrentBet - gameState.blinds.big) : callAmount;

  // Suggested bets 
  const suggestedBets = [
    minRaiseAmount,             // Min raise
    gameState.blinds.big * 4,   // 2x raise
    player.currentStack         // All-in
  ].filter(amount => amount > 0 && amount <= player.currentStack);

  const getCardStyles = () => {
    let styles = "overflow-hidden transition-all duration-300";

    if (isActive) {
      styles += " ring-2 ring-amber-500 shadow-md";
    } else if (isWinner) {
      styles += " ring-2 ring-emerald-500 shadow-md";
    } else if (isDealer) {
      styles += " ring-2 ring-primary shadow-md";
    }

    if (player.folded) {
      styles += " opacity-60";
    }

    return styles;
  };

  // Define text for blind status
  const getBlindStatusText = () => {
    if (hasPostedSmallBlind) {
      return `Small blind ($${gameState.blinds.small}) posted`;
    } else if (hasPostedBigBlind) {
      return `Big blind ($${gameState.blinds.big}) posted`;
    }
    return null;
  };

  const blindStatusText = getBlindStatusText();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, delay: playerIndex * 0.05 }}
    >
      <Card className={cn(getCardStyles())}>
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate text-base">
                {player.name}
                {isWinner && (
                  <span className="ml-2 inline-flex items-center text-emerald-500">
                    <Trophy className="h-4 w-4 mr-0.5" />
                    Winner
                  </span>
                )}
              </h3>
              {isDealer && (
                <Badge variant="outline" className="bg-primary text-primary-foreground">
                  <UserRound className="h-3 w-3 mr-1" />
                  Dealer
                </Badge>
              )}
              {playerRole && !isDealer && (
                <Badge variant="outline" className={cn(
                  "text-muted-foreground",
                  (hasPostedSmallBlind || hasPostedBigBlind) && "bg-amber-50 border-amber-200"
                )}>
                  {playerRole}
                </Badge>
              )}
            </div>
            {player.folded && <Badge variant="outline">Folded</Badge>}
          </div>
          
          <div className="flex justify-between items-center mb-5">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Stack</p>
              <div className="flex items-center gap-1">
                <Coins className={cn(
                  "h-4 w-4",
                  isActive ? "text-amber-500" : "text-muted-foreground"
                )} />
                <p className={cn(
                  "text-xl font-semibold",
                  isActive ? "text-amber-500" : ""
                )}>
                  {formatCurrency(player.currentStack)}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Total Bet</p>
              <p className={cn(
                "text-xl font-semibold",
                totalBet > 0 ? "text-emerald-600" : ""
              )}>
                {formatCurrency(totalBet)}
              </p>
            </div>
          </div>
          
          {/* Blind status indicator */}
          {blindStatusText && (
            <div className="mb-3">
              <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 w-full justify-center py-1">
                {blindStatusText}
              </Badge>
            </div>
          )}
          
          <AnimatePresence>
            {!player.folded && isActive && !gameState.winner && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {/* Primary Action Buttons */}
                <div className="flex gap-2">
                  {/* For small blind who has posted */}
                  {hasPostedSmallBlind && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleQuickBet(sbCallAmount)}
                      className="px-2 h-7 flex-1 hover:bg-secondary/50"
                      disabled={player.currentStack <= 0}
                    >
                      {sbCallAmount > 0 ? `Complete to ${formatCurrency(gameState.blinds.big)}` : "Check"}
                    </Button>
                  )}
                  
                  {/* For big blind who has posted */}
                  {hasPostedBigBlind && canCheck && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCheck}
                      className="px-2 h-7 flex-1 hover:bg-secondary/50"
                    >
                      Check
                    </Button>
                  )}
                  
                  {/* For big blind who has posted but needs to call */}
                  {hasPostedBigBlind && !canCheck && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleQuickBet(bbCallAmount)}
                      className="px-2 h-7 flex-1 hover:bg-secondary/50"
                      disabled={player.currentStack <= 0}
                    >
                      {`Call ${formatCurrency(bbCallAmount)}`}
                    </Button>
                  )}
                  
                  {/* For normal players */}
                  {!hasPostedSmallBlind && !hasPostedBigBlind && canCheck && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCheck}
                      className="px-2 h-7 flex-1 hover:bg-secondary/50"
                    >
                      Check
                    </Button>
                  )}
                  
                  {!hasPostedSmallBlind && !hasPostedBigBlind && !canCheck && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleQuickBet(callAmount)}
                      className="px-2 h-7 flex-1 hover:bg-secondary/50"
                      disabled={player.currentStack <= 0}
                    >
                      {`Call ${formatCurrency(callAmount)}`}
                    </Button>
                  )}
                  
                  {/* Raise button for everyone */}
                  {minRaiseAmount <= player.currentStack && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const raiseAmount = hasPostedSmallBlind ? sbCallAmount + gameState.blinds.big :
                                          hasPostedBigBlind ? gameState.blinds.big :
                                          minRaiseAmount;
                        handleQuickBet(raiseAmount);
                        setUseSlider(true);
                      }}
                      className="px-2 h-7 flex-1 hover:bg-primary/10"
                    >
                      Raise
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickBet(player.currentStack)}
                    className="px-2 h-7 flex-1 hover:bg-amber-50"
                    disabled={player.currentStack <= 0}
                  >
                    All-In
                  </Button>
                </div>
                
                {/* Suggested Bet Amounts */}
                {useSlider && (
                  <div className="flex gap-2">
                    {suggestedBets.filter(amount => amount !== player.currentStack).map((amount, i) => (
                      <Button 
                        key={i}
                        variant="outline" 
                        size="sm"
                        onClick={() => handleQuickBet(amount)}
                        className="px-2 h-7 text-xs flex-1"
                      >
                        {formatCurrency(amount)}
                      </Button>
                    ))}
                  </div>
                )}
                
                {/* Rest of the betting controls */}
                <div className="space-y-3">
                  <div className="pt-2">
                    <Slider 
                      value={[parseInt(betAmount) || 0]} 
                      min={0}
                      max={player.currentStack}
                      step={gameState.blinds.small}
                      onValueChange={handleSliderChange}
                    />
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
                </div>
                
                {/* Current Bet Display */}
                {currentBet > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-sm font-medium text-amber-500"
                  >
                    Current bet: {formatCurrency(currentBet)}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        
        {/* Action Buttons */}
        {!player.folded && isActive && !gameState.winner && (
          <CardFooter className="flex p-3 pt-0 gap-2">
            <Button 
              variant="default" 
              className="flex-1 h-9 button-hover bg-amber-500 hover:bg-amber-600"
              onClick={handleBetSubmit}
              disabled={(!canCheck && currentBet <= 0) || 
                (hasPostedSmallBlind && currentBet < sbCallAmount && currentBet !== player.currentStack) ||
                (hasPostedBigBlind && !canCheck && currentBet < bbCallAmount && currentBet !== player.currentStack) ||
                (!hasPostedSmallBlind && !hasPostedBigBlind && !canCheck && currentBet < callAmount && currentBet !== player.currentStack)}
            >
              {canCheck && currentBet === 0 ? "Check" :
               hasPostedSmallBlind && currentBet === sbCallAmount ? "Complete" :
               hasPostedBigBlind && canCheck && currentBet === 0 ? "Check" :
               hasPostedBigBlind && currentBet === bbCallAmount ? "Call" :
               !hasPostedSmallBlind && !hasPostedBigBlind && currentBet === callAmount ? "Call" :
               currentBet === player.currentStack ? "All-In" :
               currentBet > (hasPostedSmallBlind ? sbCallAmount : (hasPostedBigBlind ? bbCallAmount : callAmount)) ? "Raise" : 
               "Bet"}
            </Button>
            <Button 
              variant="outline" 
              className="h-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
              onClick={handleFold}
            >
              <Hand className="h-3.5 w-3.5 mr-1.5" />
              Fold
            </Button>
          </CardFooter>
        )}
        
        {/* Buy-In Button */}
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

        {/* Buy-In Dialog */}
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
