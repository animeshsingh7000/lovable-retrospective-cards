
export interface Card {
  id: string;
  text: string;
  likes: number;
  dislikes: number;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  cards: {
    whatWentWell: Card[];
    toImprove: Card[];
    actionItems: Card[];
  };
}
