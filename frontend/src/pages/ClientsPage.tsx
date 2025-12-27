
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Search, UserPlus, Loader2 } from "lucide-react";
import ClientCard from "@/components/ClientCard";
import { useQuery } from "@tanstack/react-query";
import { getClients, createClient, Client as ApiClient } from "@/lib/api";
import { toast } from "sonner";

const ClientForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    linkedin: '',
    twitter: '',
    isGhostedInitial: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createClient(formData);
      toast.success('Client added successfully!');
      onSuccess();
      setFormData({
        name: '', company: '', email: '', linkedin: '', twitter: '', isGhostedInitial: false
      });
    } catch (error) {
      toast.error('Failed to add client');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="linkedin">LinkedIn</Label>
        <Input
          id="linkedin"
          value={formData.linkedin}
          onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="twitter">Twitter</Label>
        <Input
          id="twitter"
          value={formData.twitter}
          onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="ghosted"
          checked={formData.isGhostedInitial}
          onCheckedChange={(checked) => setFormData({ ...formData, isGhostedInitial: checked })}
        />
        <Label htmlFor="ghosted">Mark as ghosted</Label>
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add Client'}
      </Button>
    </form>
  );
};

const ClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: clients, isLoading, isError, error, refetch } = useQuery<ApiClient[], Error>({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground">Manage your client relationships</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <ClientForm onSuccess={() => {
              refetch();
              // Close dialog - handled by Dialog component
            }} />
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex space-x-2 mb-6">
        <Input
          type="search"
          placeholder="Search clients... (name, company, email)"
          className="flex-grow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="outline" className="text-foreground">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading clients...</p>
        </div>
      )}

      {isError && (
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          <p className="font-semibold">Error loading clients:</p>
          <p>{error?.message || "An unknown error occurred."}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {(filteredClients.length === 0 && searchTerm) ? (
            <div className="bg-card p-6 rounded-lg shadow min-h-[400px] flex flex-col items-center justify-center">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-muted-foreground text-lg">No clients found matching "{searchTerm}"</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
            </div>
          ) : (filteredClients.length === 0) ? (
            <div className="bg-card p-6 rounded-lg shadow min-h-[400px] flex flex-col items-center justify-center">
              <p className="text-4xl mb-4">🤷‍♀️</p>
              <p className="text-muted-foreground text-lg">No clients yet? Time to network!</p>
              <p className="text-sm text-muted-foreground mt-1">Client contact cards will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map(client => (
                <ClientCard
                  key={client.id}
                  id={client.id}
                  name={client.name}
                  company={client.company}
                  email={client.email}
                  linkedin={client.linkedin}
                  twitter={client.twitter}
                  isGhostedInitial={client.isGhostedInitial}
                  internalNotes={client.internalNotes}
                  lastContactedAt={client.lastContactedAt}
                  onUpdate={refetch}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClientsPage;
