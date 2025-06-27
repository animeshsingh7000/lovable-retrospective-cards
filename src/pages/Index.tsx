
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Users, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/Header';
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
      <div className="min-h-screen bg-gradient-to-br from-rd-secondary-light to-white">
        <Header title="Retro Board App by Animesh Singh" />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rd-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rd-secondary-light to-white">
      <Header title="Retro Board App by Animesh Singh" subtitle="Reflect, improve, and plan with your team" />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rd-primary to-rd-accent mx-auto mb-6 flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-semibold text-rd-secondary-dark mb-3">No Projects Yet</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Create your first retrospective board to get started with team reflection and continuous improvement.
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-rd-primary hover:bg-rd-primary/90 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-rd-secondary-dark">Create New Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    <div>
                      <Label htmlFor="projectName" className="text-sm font-medium text-gray-700">Project Name</Label>
                      <Input
                        id="projectName"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Enter project name..."
                        className="mt-2 rounded-lg border-gray-300 focus:border-rd-primary focus:ring-rd-primary/20"
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                      />
                    </div>
                    <Button 
                      onClick={handleCreateProject} 
                      className="w-full bg-rd-primary hover:bg-rd-primary/90 text-white rounded-lg py-2.5"
                    >
                      Create Project
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-semibold text-rd-secondary-dark">Your Projects</h2>
                <p className="text-gray-600 mt-1">Manage your team retrospectives</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-rd-primary hover:bg-rd-primary/90 text-white px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-rd-secondary-dark">Create New Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    <div>
                      <Label htmlFor="projectName" className="text-sm font-medium text-gray-700">Project Name</Label>
                      <Input
                        id="projectName"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Enter project name..."
                        className="mt-2 rounded-lg border-gray-300 focus:border-rd-primary focus:ring-rd-primary/20"
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                      />
                    </div>
                    <Button 
                      onClick={handleCreateProject} 
                      className="w-full bg-rd-primary hover:bg-primary/90 text-white rounded-lg py-2.5"
                    >
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
                  className="bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group rounded-xl border border-gray-200 rd-card-hover"
                >
                  <div className="cursor-pointer" onClick={() => handleProjectClick(project.id)}>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-rd-secondary-dark">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rd-primary to-rd-accent flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg">{project.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Total Cards:</span>
                          <span className="font-semibold text-rd-primary">
                            {project.cards.whatWentWell.length + project.cards.toImprove.length + project.cards.actionItems.length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Created:</span>
                          <span className="font-medium text-gray-900">
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
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-semibold text-rd-secondary-dark">Delete Project</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 leading-relaxed">
                          Are you sure you want to delete "{project.name}"? This action cannot be undone and will permanently delete all cards in this project.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteProject(project.id, project.name)}
                          className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
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
