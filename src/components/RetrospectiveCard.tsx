
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Card as CardType } from '@/types/project';

interface RetrospectiveCardProps {
  card: CardType;
  onLike: () => void;
  onDislike: () => void;
}

export const RetrospectiveCard = ({ card, onLike, onDislike }: RetrospectiveCardProps) => {
  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <p className="text-gray-800 mb-3 text-sm leading-relaxed">{card.text}</p>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 px-2 py-1 h-auto"
            >
              <ThumbsUp className="w-3 h-3" />
              <span className="text-xs font-medium">{card.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDislike}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 h-auto"
            >
              <ThumbsDown className="w-3 h-3" />
              <span className="text-xs font-medium">{card.dislikes}</span>
            </Button>
          </div>
          <span className="text-xs text-gray-400">
            {new Date(card.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
