
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FilePlus2, CalendarIcon, Download, Loader2, Search } from "lucide-react";
import { format } from 'date-fns';
import InvoiceListItem from "@/components/InvoiceListItem";
import { useQuery } from "@tanstack/react-query";
import { getInvoices, getClients, getProjects, createInvoice, Invoice as ApiInvoice } from "@/lib/api";
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { formatCurrency } from '@/lib/utils';

const InvoiceForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    amount: '',
    dueDate: undefined as Date | undefined,
    status: 'Pending' as const,
    project_id: undefined as string | undefined
  });
  const [isLoading, setIsLoading] = useState(false);

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => getClients()
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createInvoice({
        clientName: formData.clientName,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate?.toISOString() || new Date().toISOString(),
        status: formData.status,
        project_id: formData.project_id
      });
      toast.success('Invoice created successfully!');
      onSuccess();
      setFormData({
        clientName: '', amount: '', dueDate: undefined, status: 'Pending', project_id: undefined
      });
    } catch (error) {
      toast.error('Failed to create invoice');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Client *</Label>
        <Select value={formData.clientName} onValueChange={(value) => setFormData({ ...formData, clientName: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clients?.map(client => (
              <SelectItem key={client.id} value={client.name}>
                {client.name} {client.company && `(${client.company})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="amount">Amount *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>Due Date *</Label>
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

      <div>
        <Label>Status</Label>
        <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Project (Optional)</Label>
        <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects?.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Invoice'}
      </Button>
    </form>
  );
};

const InvoicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  });

  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const generatePDF = (invoice: ApiInvoice) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Hustlr CRM Invoice', 20, 30);

    doc.setFontSize(12);
    doc.text(`Invoice #${invoice.id}`, 20, 50);
    doc.text(`Client: ${invoice.clientName}`, 20, 65);
    doc.text(`Amount: INR ${invoice.amount.toLocaleString('en-IN')}`, 20, 80);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}`, 20, 95);
    doc.text(`Status: ${invoice.status}`, 20, 110);

    doc.save(`invoice-${invoice.id}.pdf`);
    toast.success('PDF downloaded successfully!');
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">Manage your invoices and get paid</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <FilePlus2 className="h-5 w-5 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <InvoiceForm onSuccess={() => refetch()} />
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search invoices by client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading invoices...</p>
        </div>
      ) : (
        <>
          {(invoices?.length || 0) === 0 ? (
            <div className="bg-card p-6 rounded-lg shadow min-h-[400px] flex flex-col items-center justify-center">
              <p className="text-4xl mb-4">📄💨</p>
              <p className="text-muted-foreground text-lg">No invoices yet!</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first invoice to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInvoices.map(invoice => (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-card rounded-lg shadow">
                  <InvoiceListItem
                    id={invoice.id}
                    clientName={invoice.clientName}
                    amount={invoice.amount}
                    dueDate={invoice.dueDate}
                    status={invoice.status}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generatePDF(invoice)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <p className="text-center text-sm text-muted-foreground mt-8">
        PDF generation and advanced invoice features are now live!
      </p>
    </div>
  );
};

export default InvoicesPage;
