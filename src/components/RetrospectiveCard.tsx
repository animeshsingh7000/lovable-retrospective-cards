
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
    <Card className="bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-xl border border-gray-200">
      <CardContent className="p-5">
        <p className="text-gray-800 mb-4 text-sm leading-relaxed font-medium">{card.text}</p>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-2 h-auto rounded-lg transition-all duration-200"
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-semibold">{card.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDislike}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 h-auto rounded-lg transition-all duration-200"
            >
              <ThumbsDown className="w-4 h-4" />
              <span className="text-sm font-semibold">{card.dislikes}</span>
            </Button>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {new Date(card.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
