
import { useState, useEffect } from 'react';
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./lib/sentry"; // Initialize Sentry
import { initGA, measurePerformance } from "./lib/analytics"; // Initialize analytics

import { Layout } from "./components/Layout";
import IndexPage from "./pages/Index";
import ProjectsPage from "./pages/ProjectsPage";
import InvoicesPage from "./pages/InvoicesPage";
import ClientsPage from "./pages/ClientsPage";
import AuthPage from "./pages/AuthPage";
import SignupPage from "./pages/SignupPage";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage"; // Import the new LandingPage
import { Toaster as SonnerToaster } from "sonner";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupAuth = async () => {
      const { getCurrentUser, onAuthStateChange } = await import('./lib/auth');

      // Check initial user
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);

      // Listen for auth changes
      const { data: { subscription } } = onAuthStateChange((user: any) => {
        setUser(user);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    };

    setupAuth();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

// Component to handle root path logic
const HomeRouter = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupAuth = async () => {
      const { getCurrentUser, onAuthStateChange } = await import('./lib/auth');

      // Check initial user
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);

      // Listen for auth changes
      const { data: { subscription } } = onAuthStateChange((user: any) => {
        setUser(user);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    };

    setupAuth();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user) {
    // If logged in, redirect to the dashboard
    return <Navigate to="/dashboard" replace />;
  }
  // If not logged in, show the LandingPage
  return <LandingPage />;
};

const App = () => {
  useEffect(() => {
    // Initialize analytics and performance monitoring
    initGA();
    measurePerformance();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomeRouter />} /> {/* Root path now handled by HomeRouter */}
              <Route element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                {/* Main app routes are now nested and start with /dashboard or other specific paths */}
                <Route path="/dashboard" element={<IndexPage />} /> {/* Dashboard is now at /dashboard */}
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/clients" element={<ClientsPage />} />
              </Route>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <SonnerToaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
