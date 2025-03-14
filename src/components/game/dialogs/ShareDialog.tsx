
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy } from 'lucide-react';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
  onCopyLink: () => void;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onOpenChange,
  shareUrl,
  onCopyLink
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this game</DialogTitle>
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
            <Button variant="outline" size="icon" onClick={onCopyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
