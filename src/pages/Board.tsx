
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project } from '@/types/project';
import { getProject, updateProject } from '@/utils/storage';
import { Swimlane } from '@/components/Swimlane';
import { AddCardDialog } from '@/components/AddCardDialog';

const Board = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      const foundProject = getProject(projectId);
      if (foundProject) {
        setProject(foundProject);
      } else {
        navigate('/');
      }
    }
  }, [projectId, navigate]);

  const handleAddCard = (swimlane: keyof Project['cards'], text: string) => {
    if (!project) return;

    const newCard = {
      id: Date.now().toString(),
      text,
      likes: 0,
      dislikes: 0,
      createdAt: new Date().toISOString(),
    };

    const updatedProject = {
      ...project,
      cards: {
        ...project.cards,
        [swimlane]: [...project.cards[swimlane], newCard],
      },
    };

    updateProject(updatedProject);
    setProject(updatedProject);
    setActiveDialog(null);
  };

  const handleCardInteraction = (swimlane: keyof Project['cards'], cardId: string, action: 'like' | 'dislike') => {
    if (!project) return;

    const updatedCards = project.cards[swimlane].map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          [action === 'like' ? 'likes' : 'dislikes']: card[action === 'like' ? 'likes' : 'dislikes'] + 1,
        };
      }
      return card;
    });

    const updatedProject = {
      ...project,
      cards: {
        ...project.cards,
        [swimlane]: updatedCards,
      },
    };

    updateProject(updatedProject);
    setProject(updatedProject);
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  const swimlanes = [
    {
      key: 'whatWentWell' as const,
      title: 'What Went Well',
      color: 'bg-green-50 border-green-200',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      icon: '😊',
    },
    {
      key: 'toImprove' as const,
      title: 'To Improve',
      color: 'bg-orange-50 border-orange-200',
      buttonColor: 'bg-orange-600 hover:bg-orange-700',
      icon: '🔧',
    },
    {
      key: 'actionItems' as const,
      title: 'Action Items',
      color: 'bg-blue-50 border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      icon: '🎯',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{project.name}</h1>
          <p className="text-lg text-gray-600">Team Retrospective Board</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {swimlanes.map((swimlane) => (
            <div key={swimlane.key} className={`rounded-lg border-2 ${swimlane.color} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{swimlane.icon}</span>
                  <h2 className="text-xl font-semibold text-gray-900">{swimlane.title}</h2>
                </div>
                <Button
                  size="sm"
                  className={swimlane.buttonColor}
                  onClick={() => setActiveDialog(swimlane.key)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Swimlane
                cards={project.cards[swimlane.key]}
                onCardInteraction={(cardId, action) => handleCardInteraction(swimlane.key, cardId, action)}
              />

              <AddCardDialog
                isOpen={activeDialog === swimlane.key}
                onClose={() => setActiveDialog(null)}
                onAdd={(text) => handleAddCard(swimlane.key, text)}
                title={`Add card to ${swimlane.title}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board;
