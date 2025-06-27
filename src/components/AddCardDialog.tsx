
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
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-rd-secondary-dark">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div>
            <Label htmlFor="cardText" className="text-sm font-medium text-gray-700">Card Content</Label>
            <Textarea
              id="cardText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your thoughts..."
              rows={4}
              className="resize-none mt-2 rounded-lg border-gray-300 focus:border-rd-primary focus:ring-rd-primary/20"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleClose} className="rounded-lg px-6">
              Cancel
            </Button>
            <Button 
              onClick={handleAdd} 
              disabled={!text.trim()}
              className="bg-rd-primary hover:bg-rd-primary/90 text-white rounded-lg px-6"
            >
              Add Card
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
