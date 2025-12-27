
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  status: "Urgent AF" | "Chillin'" | "Blocked";
  dueDate?: string;
  clientName?: string;
  onUpdate: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  status,
  dueDate,
  clientName,
  onUpdate
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('projectId', id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Urgent AF': return 'destructive';
      case 'Chillin\'': return 'default';
      case 'Blocked': return 'secondary';
      default: return 'default';
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Project deleted successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  return (
    <Card
      className="mb-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-move"
      draggable
      onDragStart={handleDragStart}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant={getStatusColor(status)}>{status}</Badge>
        </div>
        {clientName && (
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-3 w-3 mr-1" />
            {clientName}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {description && (
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
        )}

        {dueDate && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            Due: {new Date(dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        )}

        <div className="mt-2 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
