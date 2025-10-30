
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MoreHorizontal } from 'lucide-react'; // FileText for invoice icon

interface InvoiceListItemProps {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
}

const statusStyles = {
  Paid: {
    badge: "bg-green-500 text-white",
    text: "text-green-600 dark:text-green-400",
    iconColor: "text-green-500",
  },
  Pending: {
    badge: "bg-yellow-500 text-black",
    text: "text-yellow-600 dark:text-yellow-400",
    iconColor: "text-yellow-500",
  },
  Overdue: {
    badge: "bg-red-500 text-white animate-pulse", // Added pulse for overdue
    text: "text-red-600 dark:text-red-400",
    iconColor: "text-red-500",
  },
};

const InvoiceListItem: React.FC<InvoiceListItemProps> = ({ id, clientName, amount, dueDate, status }) => {
  const styles = statusStyles[status];

  return (
    <div className="flex items-center justify-between bg-card p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150 mb-3">
      <div className="flex items-center">
        <FileText className={`h-8 w-8 mr-4 ${styles.iconColor}`} />
        <div>
          <p className="font-semibold text-foreground">{clientName} - Invoice #{id.slice(-4)}</p>
          <p className={`text-sm ${styles.text}`}>
            Due: {dueDate} - Amount: ${amount.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Badge className={`${styles.badge} text-xs`}>{status} {status === "Overdue" && "🥵"}</Badge>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
          <MoreHorizontal className="h-5 w-5" />
          <span className="sr-only">Invoice Options</span>
        </Button>
      </div>
    </div>
  );
};

export default InvoiceListItem;
