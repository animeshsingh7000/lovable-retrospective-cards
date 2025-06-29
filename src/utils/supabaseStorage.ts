import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Project, Card } from '@/types/project';

type DbProject = Database['public']['Tables']['projects']['Row'];
type DbCard = Database['public']['Tables']['cards']['Row'];

// Helper function to transform database project to frontend format
const transformDbProjectToProject = (dbProject: DbProject, cards: DbCard[]): Project => {
  const groupedCards = {
    whatWentWell: [] as Card[],
    toImprove: [] as Card[],
    actionItems: [] as Card[],
  };

  cards.forEach(card => {
    const transformedCard: Card = {
      id: card.id,
      text: card.text,
      likes: card.likes,
      dislikes: card.dislikes,
      createdAt: card.created_at,
    };

    if (card.swimlane === 'whatWentWell') {
      groupedCards.whatWentWell.push(transformedCard);
    } else if (card.swimlane === 'toImprove') {
      groupedCards.toImprove.push(transformedCard);
    } else if (card.swimlane === 'actionItems') {
      groupedCards.actionItems.push(transformedCard);
    }
  });

  return {
    id: dbProject.id,
    name: dbProject.name,
    createdAt: dbProject.created_at,
    cards: groupedCards,
  };
};

export const getProjects = async (): Promise<Project[]> => {
  try {
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      throw projectsError;
    }

    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*');

    if (cardsError) {
      console.error('Error fetching cards:', cardsError);
      throw cardsError;
    }

    return projects.map(project => 
      transformDbProjectToProject(project, cards?.filter(card => card.project_id === project.id) || [])
    );
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const getProject = async (projectId: string): Promise<Project | null> => {
  try {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      throw projectError;
    }

    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .eq('project_id', projectId);

    if (cardsError) {
      console.error('Error fetching cards:', cardsError);
      throw cardsError;
    }

    return transformDbProjectToProject(project, cards || []);
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
};

export const createProject = async (name: string): Promise<Project> => {
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }

    return transformDbProjectToProject(project, []);
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

// NEW: Individual card operations to prevent race conditions
export const addCard = async (projectId: string, swimlane: string, text: string): Promise<Card> => {
  try {
    const cardId = crypto.randomUUID();
    const { data: card, error } = await supabase
      .from('cards')
      .insert({
        id: cardId,
        project_id: projectId,
        text,
        likes: 0,
        dislikes: 0,
        swimlane,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding card:', error);
      throw error;
    }

    return {
      id: card.id,
      text: card.text,
      likes: card.likes,
      dislikes: card.dislikes,
      createdAt: card.created_at,
    };
  } catch (error) {
    console.error('Error adding card:', error);
    throw error;
  }
};

// NEW: Update individual card likes/dislikes using direct SQL update for now
export const updateCardInteraction = async (cardId: string, action: 'like' | 'dislike'): Promise<void> => {
  try {
    // For now, use direct SQL updates instead of RPC functions
    // This will work until we create the database functions
    const columnToUpdate = action === 'like' ? 'likes' : 'dislikes';
    
    // First get the current value
    const { data: currentCard, error: fetchError } = await supabase
      .from('cards')
      .select(columnToUpdate)
      .eq('id', cardId)
      .single();

    if (fetchError) {
      console.error(`Error fetching card for ${action}:`, fetchError);
      throw fetchError;
    }

    // Then increment it
    const currentValue = currentCard[columnToUpdate] || 0;
    const { error: updateError } = await supabase
      .from('cards')
      .update({ [columnToUpdate]: currentValue + 1 })
      .eq('id', cardId);

    if (updateError) {
      console.error(`Error updating card ${action}:`, updateError);
      throw updateError;
    }
  } catch (error) {
    console.error(`Error updating card ${action}:`, error);
    throw error;
  }
};

// Keep the old updateProject for backward compatibility, but it's now less used
export const updateProject = async (project: Project): Promise<void> => {
  try {
    // Update project name
    const { error: projectError } = await supabase
      .from('projects')
      .update({ name: project.name })
      .eq('id', project.id);

    if (projectError) {
      console.error('Error updating project:', projectError);
      throw projectError;
    }

    // Get existing cards to determine what needs to be updated/inserted/deleted
    const { data: existingCards, error: fetchError } = await supabase
      .from('cards')
      .select('*')
      .eq('project_id', project.id);

    if (fetchError) {
      console.error('Error fetching existing cards:', fetchError);
      throw fetchError;
    }

    const existingCardIds = new Set(existingCards?.map(card => card.id) || []);
    const newCardIds = new Set();

    // Process all cards from all swimlanes
    const allCards = [
      ...project.cards.whatWentWell.map(card => ({ ...card, swimlane: 'whatWentWell' as const })),
      ...project.cards.toImprove.map(card => ({ ...card, swimlane: 'toImprove' as const })),
      ...project.cards.actionItems.map(card => ({ ...card, swimlane: 'actionItems' as const })),
    ];

    for (const card of allCards) {
      newCardIds.add(card.id);

      if (existingCardIds.has(card.id)) {
        // Update existing card
        const { error } = await supabase
          .from('cards')
          .update({
            text: card.text,
            likes: card.likes,
            dislikes: card.dislikes,
            swimlane: card.swimlane,
          })
          .eq('id', card.id);

        if (error) {
          console.error('Error updating card:', error);
          throw error;
        }
      } else {
        // Insert new card
        const { error } = await supabase
          .from('cards')
          .insert({
            id: card.id,
            project_id: project.id,
            text: card.text,
            likes: card.likes,
            dislikes: card.dislikes,
            swimlane: card.swimlane,
            created_at: card.createdAt,
          });

        if (error) {
          console.error('Error inserting card:', error);
          throw error;
        }
      }
    }

    // Delete cards that are no longer present
    const cardsToDelete = existingCards?.filter(card => !newCardIds.has(card.id)) || [];
    for (const card of cardsToDelete) {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', card.id);

      if (error) {
        console.error('Error deleting card:', error);
        throw error;
      }
    }

  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    // Delete the project (cards will be deleted automatically due to CASCADE)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};
