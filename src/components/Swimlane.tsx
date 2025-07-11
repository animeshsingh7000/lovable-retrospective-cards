
import { Plus } from 'lucide-react';
import { Card as CardType } from '@/types/project';
import { RetrospectiveCard } from './RetrospectiveCard';
import { Button } from './ui/button';

interface SwimlaneProps {
  cards: CardType[];
  onCardInteraction: (cardId: string, action: 'like' | 'dislike') => void;
  onAddCard: () => void;
}

export const Swimlane = ({ cards, onCardInteraction, onAddCard }: SwimlaneProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto">
        {cards.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center py-8 text-gray-500">
            <p>No cards yet. Click the + button to add one!</p>
          </div>
        ) : (
          cards.map((card) => (
            <RetrospectiveCard
              key={card.id}
              card={card}
              onLike={() => onCardInteraction(card.id, 'like')}
              onDislike={() => onCardInteraction(card.id, 'dislike')}
            />
          ))
        )}
      </div>
      
      {/* Add Card Button */}
      <div className="mt-3">
        <Button
          variant="ghost"
          onClick={onAddCard}
          className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Card
        </Button>
      </div>
    </div>
  );
};
