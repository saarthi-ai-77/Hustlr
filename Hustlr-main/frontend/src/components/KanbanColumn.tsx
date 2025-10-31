
import React from 'react';
import { Badge } from "@/components/ui/badge";
import ProjectCard from './ProjectCard';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  description: string;
  status: "Urgent AF" | "Chillin'" | "Blocked";
  dueDate?: string;
  clientName?: string;
}

interface KanbanColumnProps {
  title: string;
  projects: Project[];
  onUpdate: () => void;
}

const statusMap = {
  'To Do': 'Chillin\'',
  'In Progress': 'Urgent AF',
  'Done': 'Blocked'
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, projects, onUpdate }) => {
  const status = statusMap[title as keyof typeof statusMap];

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('projectId');

    if (!projectId) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', projectId);

      if (error) throw error;

      toast.success(`Project moved to ${title}`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update project status');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="flex-1 min-h-[500px] bg-muted/50 rounded-lg p-4"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <Badge variant="secondary">{projects.length}</Badge>
      </div>

      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No projects in {title.toLowerCase()}</p>
            <p className="text-sm">Drag projects here</p>
          </div>
        ) : (
          projects.map(project => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.title}
              description={project.description}
              status={project.status}
              dueDate={project.dueDate}
              clientName={project.clientName}
              onUpdate={onUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
