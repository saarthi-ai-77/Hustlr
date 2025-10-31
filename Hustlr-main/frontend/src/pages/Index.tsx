
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, DollarSign, Users } from "lucide-react"; // Icons for stats
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

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

  const { data: deadlinesData } = useQuery({
    queryKey: ['calendar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('due_date, title')
        .not('due_date', 'is', null)
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(1);
      if (error) throw error;
      return data?.[0] || null;
    }
  });

  const monthlyRevenue = revenueData || 0;
  const revenueChange = 0; // TODO: Calculate from previous month
  const activeClients = clientsData?.length || 0;
  const topClient = clientsData?.[0]?.name || "N/A";
  const nextDeadlineDate = deadlinesData?.due_date ? new Date(deadlinesData.due_date).toLocaleDateString() : "N/A";
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
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">${monthlyRevenue.toFixed(2)}</div>
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
        <div className="bg-card p-6 rounded-lg shadow min-h-[300px] flex flex-col items-center justify-center">
          <CalendarDays className="h-16 w-16 text-primary mb-4 opacity-50" />
          <p className="text-muted-foreground">A mini-calendar with deadline dots is brewing...</p>
          <p className="text-sm text-muted-foreground mt-1">For now, keep adulting level: 99!</p>
        </div>
      </section>
    </div>
  );
};

export default IndexPage;
