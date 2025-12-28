import { useState, useEffect } from 'react';
import KanbanColumn from '@/components/KanbanColumn';
import { useQuery } from '@tanstack/react-query';
import { getProjects, createProject, getClients, Project as ApiProject } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { subscribeToTable } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

const ProjectForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do' as const,
    budget: 0,
    dueDate: undefined as Date | undefined,
    client_id: undefined as string | undefined
  });
  const [isLoading, setIsLoading] = useState(false);

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => getClients()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createProject({
        ...formData,
        dueDate: formData.dueDate?.toISOString()
      });
      toast.success('Project created successfully!');
      onSuccess();
      setFormData({
        title: '', description: '', status: 'To Do', budget: 0, dueDate: undefined, client_id: undefined
      });
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Project Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="To Do">To Do</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="budget">Budget (₹)</Label>
          <Input
            id="budget"
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
      <div>
        <Label>Client (Optional)</Label>
        <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clients?.map(client => (
              <SelectItem key={client.id} value={client.id}>
                {client.name} {client.company && `(${client.company})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Due Date (Optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.dueDate}
              onSelect={(date) => setFormData({ ...formData, dueDate: date })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : 'Create Project'}
      </Button>
    </form>
  );
};

const ProjectsPage = () => {
  const { data: projects, isLoading, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const todoProjects = projects?.filter(p => p.status === 'To Do') || [];
  const doingProjects = projects?.filter(p => p.status === 'In Progress') || [];
  const doneProjects = projects?.filter(p => p.status === 'Completed') || [];

  // Real-time updates
  useEffect(() => {
    let channel: any;

    const setupRealtime = async () => {
      const user = await getCurrentUser();
      if (user) {
        channel = subscribeToTable('projects', (payload) => {
          console.log('Project change:', payload);
          refetch();
        }, user.id);
      }
    };

    setupRealtime();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [refetch]);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">Track your project progress with Kanban</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm onSuccess={() => refetch()} />
          </DialogContent>
        </Dialog>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading projects...</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          <KanbanColumn title="To Do" projects={todoProjects} onUpdate={refetch} />
          <KanbanColumn title="In Progress" projects={doingProjects} onUpdate={refetch} />
          <KanbanColumn title="Done" projects={doneProjects} onUpdate={refetch} />
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground mt-8">
        Drag projects between columns to update their status
      </p>
    </div>
  );
};

export default ProjectsPage;
