
import { Card as CardType } from '@/types/project';
import { RetrospectiveCard } from './RetrospectiveCard';

interface SwimlaneProps {
  cards: CardType[];
  onCardInteraction: (cardId: string, action: 'like' | 'dislike') => void;
}

export const Swimlane = ({ cards, onCardInteraction }: SwimlaneProps) => {
  return (
    <div className="space-y-3 min-h-[200px]">
      {cards.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
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
  );
};
