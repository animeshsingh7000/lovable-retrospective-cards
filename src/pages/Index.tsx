
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Users, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Project } from '@/types/project';
import { getProjects, createProject, deleteProject } from '@/utils/supabaseStorage';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const projectsData = await getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (newProjectName.trim()) {
      try {
        const project = await createProject(newProjectName.trim());
        await loadProjects();
        setNewProjectName('');
        setIsDialogOpen(false);
        navigate(`/board/${project.id}`);
        toast({
          title: "Success",
          description: "Project created successfully!",
        });
      } catch (error) {
        console.error('Error creating project:', error);
        toast({
          title: "Error",
          description: "Failed to create project. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    try {
      await deleteProject(projectId);
      await loadProjects();
      toast({
        title: "Success",
        description: `Project "${projectName}" deleted successfully!`,
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/board/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Retrospective Boards</h1>
          <p className="text-lg text-gray-600">Reflect, improve, and plan with your team</p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Projects Yet</h2>
              <p className="text-gray-600 mb-6">
                Create your first retrospective board to get started with team reflection.
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="projectName">Project Name</Label>
                      <Input
                        id="projectName"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Enter project name..."
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                      />
                    </div>
                    <Button onClick={handleCreateProject} className="w-full">
                      Create Project
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Your Projects</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="projectName">Project Name</Label>
                      <Input
                        id="projectName"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Enter project name..."
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                      />
                    </div>
                    <Button onClick={handleCreateProject} className="w-full">
                      Create Project
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className="bg-white hover:shadow-lg transition-all duration-200 hover:-translate-y-1 relative group"
                >
                  <div className="cursor-pointer" onClick={() => handleProjectClick(project.id)}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        {project.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Cards:</span>
                          <span className="font-medium">
                            {project.cards.whatWentWell.length + project.cards.toImprove.length + project.cards.actionItems.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span className="font-medium">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{project.name}"? This action cannot be undone and will permanently delete all cards in this project.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteProject(project.id, project.name)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
