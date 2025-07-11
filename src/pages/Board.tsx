import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Project } from '@/types/project';
import { getProject, addCard, updateCardInteraction } from '@/utils/supabaseStorage';
import { supabase } from '@/integrations/supabase/client';
import { Swimlane } from '@/components/Swimlane';
import { AddCardDialog } from '@/components/AddCardDialog';
import { ExportDialog } from '@/components/ExportDialog';
import { useToast } from '@/hooks/use-toast';

const Board = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      loadProject();
      setupRealTimeSubscription();
    }

    return () => {
      // Cleanup subscriptions when component unmounts
      supabase.removeAllChannels();
    };
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;
    
    try {
      setIsLoading(true);
      const foundProject = await getProject(projectId);
      if (foundProject) {
        setProject(foundProject);
      } else {
        toast({
          title: "Error",
          description: "Project not found.",
          variant: "destructive",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: "Error",
        description: "Failed to load project. Please try again.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealTimeSubscription = () => {
    if (!projectId) return;

    const channel = supabase
      .channel('board-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          // Reload project data when cards change
          loadProject();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAddCard = async (swimlane: keyof Project['cards'], text: string) => {
    if (!project || !projectId) return;

    try {
      // Use the new addCard function for individual operations
      const newCard = await addCard(projectId, swimlane, text);
      
      // Optimistically update local state while real-time will sync
      const updatedProject = {
        ...project,
        cards: {
          ...project.cards,
          [swimlane]: [...project.cards[swimlane], newCard],
        },
      };

      setProject(updatedProject);
      setActiveDialog(null);
      toast({
        title: "Success",
        description: "Card added successfully!",
      });
    } catch (error) {
      console.error('Error adding card:', error);
      toast({
        title: "Error",
        description: "Failed to add card. Please try again.",
        variant: "destructive",
      });
      // Reload to get the current state
      loadProject();
    }
  };

  const handleCardInteraction = async (swimlane: keyof Project['cards'], cardId: string, action: 'like' | 'dislike') => {
    if (!project) return;

    try {
      // Use the new updateCardInteraction function
      await updateCardInteraction(cardId, action);

      // Optimistically update local state
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

      setProject(updatedProject);
    } catch (error) {
      console.error('Error updating card:', error);
      toast({
        title: "Error",
        description: "Failed to update card. Please try again.",
        variant: "destructive",
      });
      // Reload to get the current state
      loadProject();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rd-secondary-light to-white">
        <Header title="Retro Board App by Animesh Singh" />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rd-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const swimlanes = [
    {
      key: 'whatWentWell' as const,
      title: 'What Went Well',
      color: 'bg-green-50 border-green-200',
      headerColor: 'bg-green-100',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      icon: '😊',
    },
    {
      key: 'toImprove' as const,
      title: 'To Improve',
      color: 'bg-orange-50 border-orange-200',
      headerColor: 'bg-orange-100',
      buttonColor: 'bg-orange-600 hover:bg-orange-700',
      icon: '🔧',
    },
    {
      key: 'actionItems' as const,
      title: 'Action Items',
      color: 'bg-blue-50 border-blue-200',
      headerColor: 'bg-blue-100',
      buttonColor: 'bg-rd-primary hover:bg-rd-primary/90',
      icon: '🎯',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rd-secondary-light to-white">
      <Header title="Retro Board App by Animesh Singh" />
      
      <div className="h-[calc(100vh-80px)] flex flex-col px-6 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 hover:bg-white/80 text-gray-700 hover:text-rd-primary rounded-lg px-4 py-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-rd-secondary-dark mb-2">{project.name}</h1>
                <p className="text-gray-600">Team Retrospective Board</p>
              </div>
              <Button
                onClick={() => setIsExportDialogOpen(true)}
                className="bg-rd-primary hover:bg-rd-primary/90 text-white rounded-lg px-4 py-2 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <div id="board-content" className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {swimlanes.map((swimlane) => (
            <div key={swimlane.key} className={`rounded-xl border-2 ${swimlane.color} flex flex-col h-full shadow-sm`}>
              <div className={`${swimlane.headerColor} rounded-t-xl p-4 border-b border-gray-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{swimlane.icon}</span>
                    <h2 className="text-lg font-semibold text-gray-900">{swimlane.title}</h2>
                  </div>
                  <Button
                    size="sm"
                    className={`${swimlane.buttonColor} text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200`}
                    onClick={() => setActiveDialog(swimlane.key)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-h-0 p-4">
                <Swimlane
                  cards={project.cards[swimlane.key]}
                  onCardInteraction={(cardId, action) => handleCardInteraction(swimlane.key, cardId, action)}
                />
              </div>

              <AddCardDialog
                isOpen={activeDialog === swimlane.key}
                onClose={() => setActiveDialog(null)}
                onAdd={(text) => handleAddCard(swimlane.key, text)}
                title={`Add card to ${swimlane.title}`}
              />
            </div>
          ))}
        </div>

        {/* Export Dialog */}
        <ExportDialog
          isOpen={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          project={project}
          boardElementId="board-content"
        />
      </div>
    </div>
  );
};

export default Board;
