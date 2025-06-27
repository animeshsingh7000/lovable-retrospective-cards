
import { Project } from '@/types/project';

const STORAGE_KEY = 'retrospective-projects';

export const getProjects = (): Project[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getProject = (id: string): Project | null => {
  const projects = getProjects();
  return projects.find(project => project.id === id) || null;
};

export const createProject = (name: string): Project => {
  const project: Project = {
    id: Date.now().toString(),
    name,
    createdAt: new Date().toISOString(),
    cards: {
      whatWentWell: [],
      toImprove: [],
      actionItems: [],
    },
  };

  const projects = getProjects();
  projects.push(project);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return project;
};

export const updateProject = (updatedProject: Project): void => {
  const projects = getProjects();
  const index = projects.findIndex(project => project.id === updatedProject.id);
  
  if (index !== -1) {
    projects[index] = updatedProject;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }
};

export const deleteProject = (id: string): void => {
  const projects = getProjects();
  const filteredProjects = projects.filter(project => project.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredProjects));
};
