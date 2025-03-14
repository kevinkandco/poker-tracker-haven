
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '../utils/gameHelpers';

interface WinnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: any[];
  totalPot: number;
  selectedWinner: string;
  onWinnerChange: (value: string) => void;
  onConfirmWinner: () => void;
}

const WinnerDialog: React.FC<WinnerDialogProps> = ({
  open,
  onOpenChange,
  players,
  totalPot,
  selectedWinner,
  onWinnerChange,
  onConfirmWinner
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Who won this hand?</DialogTitle>
          <DialogDescription>
            Select the winner who will receive the pot of {formatCurrency(totalPot)}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select
            value={selectedWinner}
            onValueChange={onWinnerChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select winner" />
            </SelectTrigger>
            <SelectContent>
              {players.map(player => (
                <SelectItem key={player.id} value={player.id}>
                  {player.name} {player.folded ? " (Folded)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirmWinner}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Confirm Winner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WinnerDialog;
