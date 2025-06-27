
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AddCardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (text: string) => void;
  title: string;
}

export const AddCardDialog = ({ isOpen, onClose, onAdd, title }: AddCardDialogProps) => {
  const [text, setText] = useState('');

  const handleAdd = () => {
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
    }
  };

  const handleClose = () => {
    setText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="cardText">Card Content</Label>
            <Textarea
              id="cardText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your thoughts..."
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!text.trim()}>
              Add Card
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
