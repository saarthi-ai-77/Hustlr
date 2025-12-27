
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, IndianRupee, Users } from "lucide-react"; // Icons for stats
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

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
        .select('title, due_date, status')
        .not('due_date', 'is', null)
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(5);
      if (error) throw error;
      return data || [];
    }
  });

  const monthlyRevenue = revenueData || 0;
  const prevMonthlyRevenue = prevRevenueData || 0;
  const revenueChange = prevMonthlyRevenue === 0 ? 0 : ((monthlyRevenue - prevMonthlyRevenue) / prevMonthlyRevenue) * 100;

  const activeClients = clientsData?.length || 0;
  const topClient = clientsData?.[0]?.name || "N/A";

  const deadlinesData = upcomingProjects?.[0] || null;
  const nextDeadlineDate = deadlinesData?.due_date ? new Date(deadlinesData.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : "N/A";
  const nextDeadlineProject = deadlinesData?.title || "No upcoming projects";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, let's get that bread! 🍞</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">💰 This Month</CardTitle>
            <IndianRupee className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{formatCurrency(monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyber-teal">🔥 Hot Clients</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activeClients} Active</div>
            <p className="text-xs text-muted-foreground">
              {activeClients > 0 ? `Top client: ${topClient}` : "No active clients yet"}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-millennial-pink">📅 Next Deadline</CardTitle>
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{nextDeadlineDate}</div>
            <p className="text-xs text-muted-foreground">
              {nextDeadlineProject !== "No upcoming projects" ? `Project: ${nextDeadlineProject}` : nextDeadlineProject}
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Upcoming Deadlines</h2>
        <div className="bg-card rounded-lg shadow overflow-hidden">
          {upcomingProjects && upcomingProjects.length > 0 ? (
            <div className="divide-y divide-border">
              {upcomingProjects.map((project, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium text-foreground">{project.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(project.due_date!).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${project.status === 'Urgent AF' ? 'bg-destructive/10 text-destructive' :
                    project.status === 'Blocked' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-primary/10 text-primary'
                    }`}>
                    {project.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground">No upcoming deadlines. Time for a Chai break? ☕</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default IndexPage;
