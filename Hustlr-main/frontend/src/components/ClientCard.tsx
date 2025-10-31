import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, ExternalLink } from "lucide-react";
import { Users, Link as LinkIcon, MessageSquareWarning } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ClientCardProps {
  id: string;
  name: string;
  company: string;
  email: string;
  linkedin?: string;
  twitter?: string;
  isGhostedInitial?: boolean;
  onUpdate: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({
  id,
  name,
  company,
  email,
  linkedin,
  twitter,
  isGhostedInitial = false,
  onUpdate
}) => {
  const [isGhosted, setIsGhosted] = useState(isGhostedInitial);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleGhostToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({ is_ghosted: checked })
        .eq('id', id);

      if (error) throw error;

      setIsGhosted(checked);
      toast.success(`Client ${checked ? 'ghosted' : 'unghosted'}`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update client status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Client deleted successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete client');
    }
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center">
              {name}
              {isGhosted && <Badge variant="secondary" className="ml-2">Ghosted</Badge>}
            </CardTitle>
            {company && <p className="text-muted-foreground">{company}</p>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Client
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground mb-2">{email}</p>
        <div className="flex space-x-2">
          {linkedin && (
            <Button variant="outline" size="sm" asChild>
              <a href={linkedin} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                LinkedIn
              </a>
            </Button>
          )}
          {twitter && (
            <Button variant="outline" size="sm" asChild>
              <a href={`https://twitter.com/${twitter}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Twitter
              </a>
            </Button>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            checked={isGhosted}
            onCheckedChange={handleGhostToggle}
            disabled={isUpdating}
          />
          <span className="text-sm text-muted-foreground">
            {isGhosted ? 'Ghosted' : 'Active'}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ClientCard;
