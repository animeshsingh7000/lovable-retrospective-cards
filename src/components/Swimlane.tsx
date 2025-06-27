
import { Card as CardType } from '@/types/project';
import { RetrospectiveCard } from './RetrospectiveCard';

interface SwimlaneProps {
  cards: CardType[];
  onCardInteraction: (cardId: string, action: 'like' | 'dislike') => void;
}

export const Swimlane = ({ cards, onCardInteraction }: SwimlaneProps) => {
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
    </div>
  );
};
