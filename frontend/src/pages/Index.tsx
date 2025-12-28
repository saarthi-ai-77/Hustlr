import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, IndianRupee, Users, CheckCircle2, TrendingUp, Clock, AlertCircle } from "lucide-react"; // Icons for stats
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Project } from "@/lib/api";
import { format } from "date-fns";

const IndexPage = () => {
  // Fetch real data from Supabase
  const { data: revenueData } = useQuery({
    queryKey: ['revenue'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_monthly_revenue');
      if (error) throw error;
      return data || 0;
    }
  });

  const { data: clientsData } = useQuery({
    queryKey: ['hot-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('is_ghosted', false)
        .limit(5);
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch previous month revenue for change calculation
  const { data: prevRevenueData } = useQuery({
    queryKey: ['prev-revenue'],
    queryFn: async () => {
      const now = new Date();
      const firstOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const { data, error } = await supabase
        .from('invoices')
        .select('amount')
        .eq('status', 'Paid')
        .gte('created_at', firstOfPrevMonth.toISOString())
        .lte('created_at', lastOfPrevMonth.toISOString());

      if (error) throw error;
      return data?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
    }
  });

  const { data: upcomingProjects } = useQuery({
    queryKey: ['upcoming-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description, due_date, status, budget')
        .not('due_date', 'is', null)
        .gte('due_date', new Date().toISOString())
        .neq('status', 'Completed')
        .order('due_date', { ascending: true });
      if (error) throw error;

      // Map snake_case from DB to camelCase for Project type
      return (data || []).map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        status: p.status,
        dueDate: p.due_date,
        budget: p.budget
      })) as Project[];
    }
  });

  const { data: projectStats } = useQuery({
    queryKey: ['project-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('status, budget');
      if (error) throw error;

      const total = data.length;
      const completed = data.filter(p => p.status === 'Completed').length;
      const inProgress = data.filter(p => p.status === 'In Progress').length;
      const totalBudget = data.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);

      return { total, completed, inProgress, totalBudget };
    }
  });

  const { data: invoiceStats } = useQuery({
    queryKey: ['invoice-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('amount, status');
      if (error) throw error;

      const paid = data.filter(i => i.status === 'Paid').reduce((sum, i) => sum + Number(i.amount), 0);
      const pending = data.filter(i => i.status === 'Pending').reduce((sum, i) => sum + Number(i.amount), 0);

      return { paid, pending };
    }
  });

  const monthlyRevenue = revenueData || 0;
  const prevMonthlyRevenue = prevRevenueData || 0;
  const revenueChange = prevMonthlyRevenue === 0 ? 0 : ((monthlyRevenue - prevMonthlyRevenue) / prevMonthlyRevenue) * 100;

  const activeClients = clientsData?.length || 0;
  const topClient = clientsData?.[0]?.name || "N/A";

  const deadlinesData = upcomingProjects?.[0] || null;
  const nextDeadlineDate = deadlinesData?.dueDate ? new Date(deadlinesData.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : "N/A";
  const nextDeadlineProject = deadlinesData?.title || "No upcoming projects";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, let's get that bread! 🍞</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Dialog>
          <DialogTrigger asChild>
            <Card className="shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary uppercase tracking-wider">Revenue Tracking</CardTitle>
                <IndianRupee className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{formatCurrency(monthlyRevenue)}</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className={`h-3 w-3 ${revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <p className="text-xs text-muted-foreground font-medium">
                    {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}% <span className="opacity-70">from last month</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Income Breakdown</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                  <p className="text-xs text-muted-foreground uppercase font-bold text-primary mb-1">Paid Invoices</p>
                  <p className="text-xl font-bold">{formatCurrency(invoiceStats?.paid || 0)}</p>
                </div>
                <div className="bg-amber-500/5 p-4 rounded-lg border border-amber-500/10">
                  <p className="text-xs text-muted-foreground uppercase font-bold text-amber-600 mb-1">Pending Invoices</p>
                  <p className="text-xl font-bold">{formatCurrency(invoiceStats?.pending || 0)}</p>
                </div>
              </div>
              <div className="bg-slate-500/5 p-4 rounded-lg border border-slate-500/10">
                <p className="text-xs text-muted-foreground uppercase font-bold text-slate-600 mb-1">Total Pipeline (Project Budgets)</p>
                <p className="text-2xl font-bold">{formatCurrency(projectStats?.totalBudget || 0)}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Card className="shadow border-l-4 border-l-cyber-teal">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyber-teal uppercase tracking-wider">Client Base</CardTitle>
            <Users className="h-5 w-5 text-cyber-teal" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activeClients} Active</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium italic opacity-80">
              {activeClients > 0 ? `Top connection: ${topClient}` : "Build your empire!"}
            </p>
          </CardContent>
        </Card>

        <Dialog>
          <DialogTrigger asChild>
            <Card className="shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-destructive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-destructive uppercase tracking-wider">Next Deadline</CardTitle>
                <CalendarDays className="h-5 w-5 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{nextDeadlineDate}</div>
                <div className="flex items-center gap-1 mt-1 overflow-hidden whitespace-nowrap text-ellipsis">
                  <Clock className="h-3 w-3 text-destructive shrink-0" />
                  <p className="text-xs text-muted-foreground font-medium">
                    {nextDeadlineProject !== "No upcoming projects" ? nextDeadlineProject : "Time for a Chai? ☕"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Deadline Calendar</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center pt-4">
              <Calendar
                mode="single"
                selected={deadlinesData?.dueDate ? new Date(deadlinesData.dueDate) : undefined}
                className="rounded-md border shadow-sm"
                modifiers={{
                  hasDeadline: upcomingProjects?.map(p => new Date(p.dueDate!)) || []
                }}
                modifiersStyles={{
                  hasDeadline: { fontWeight: 'bold', color: 'red', textDecoration: 'underline' }
                }}
              />
              <div className="mt-4 w-full space-y-2">
                <p className="text-sm font-bold text-primary px-2">Scheduled Deliverables:</p>
                <div className="max-h-[200px] overflow-y-auto px-1 space-y-2">
                  {upcomingProjects?.map((p, i) => (
                    <div key={i} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded border border-border">
                      <span className="font-medium">{p.title}</span>
                      <span className="text-xs opacity-70 font-mono">{format(new Date(p.dueDate!), 'dd MMM')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
            <Clock className="mr-2 h-6 w-6 text-primary" />
            Upcoming Deadlines
          </h2>
          <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
            {upcomingProjects && upcomingProjects.length > 0 ? (
              <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                {upcomingProjects.map((project, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group">
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{project.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center mt-0.5">
                        <CalendarDays className="h-3 w-3 mr-1" />
                        Due {new Date(project.dueDate!).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-[10px] uppercase font-black tracking-tighter ${project.status === 'In Progress' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                      project.status === 'Completed' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
                        'bg-primary/10 text-primary border border-primary/20'
                      }`}>
                      {project.status === 'In Progress' ? 'Urgent AF' : project.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground font-medium">All clear! No deadlines lurking. 🏄‍♂️</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
            <CheckCircle2 className="mr-2 h-6 w-6 text-green-500" />
            Hustle Progress
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/10 shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-black text-primary">{projectStats?.total || 0}</div>
                <p className="text-xs font-bold text-muted-foreground uppercase mt-1">Total Projects</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/5 border-green-500/10 shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-black text-green-600">{projectStats?.completed || 0}</div>
                <p className="text-xs font-bold text-muted-foreground uppercase mt-1">Completed</p>
              </CardContent>
            </Card>
            <Card className="bg-cyber-teal/5 border-cyber-teal/10 shadow-sm col-span-2">
              <CardContent className="py-4 flex items-center justify-around">
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{projectStats?.inProgress || 0}</div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Working On</p>
                </div>
                <div className="h-8 w-px bg-border/50" />
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{formatCurrency(projectStats?.totalBudget || 0)}</div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Revenue Pipeline</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IndexPage;
