
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
import { getCurrentUser } from '@/lib/auth';

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

  const generatePDF = async (invoice: ApiInvoice) => {
    const user = await getCurrentUser();
    const doc = new jsPDF();

    // Brand Header
    doc.setFillColor(59, 130, 246); // Blue color from theme
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('HUSTLR', 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('PROFESSIONAL FREELANCE INVOICE', 20, 32);

    doc.setFontSize(30);
    doc.text('INVOICE', 140, 25);

    // Reset Color
    doc.setTextColor(0, 0, 0);

    // User & Client Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FROM:', 20, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(user?.email || 'Freelancer', 20, 67);

    doc.setFont('helvetica', 'bold');
    doc.text('TO:', 20, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.clientName, 20, 92);

    // Invoice Details
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE DETAILS', 140, 60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Invoice ID:  ${invoice.id.slice(0, 8).toUpperCase()}`, 140, 67);
    doc.text(`Date:        ${new Date().toLocaleDateString('en-IN')}`, 140, 74);
    doc.text(`Due Date:    ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}`, 140, 81);
    doc.text(`Status:      ${invoice.status.toUpperCase()}`, 140, 88);

    // Table Header
    doc.setFillColor(243, 244, 246);
    doc.rect(20, 110, 170, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', 25, 116);
    doc.text('AMOUNT', 160, 116);

    // Table content
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.projectTitle || 'Freelance Services', 25, 130);
    doc.text(`INR ${invoice.amount.toLocaleString('en-IN')}`, 160, 130);

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 135, 190, 135);

    // Totals
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', 130, 155);
    doc.text(`INR ${invoice.amount.toLocaleString('en-IN')}`, 160, 155);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Notes:', 20, 180);
    doc.text('Please make the payment by the due date mentioned above.', 20, 187);
    doc.text('Thank you for your business!', 20, 200);

    doc.save(`invoice-${invoice.id.slice(0, 8)}.pdf`);
    toast.success('Professional PDF generated!');
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
