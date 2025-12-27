import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "@/lib/auth";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await signIn({ email, password });
      toast.success("Let's get that bread 🍞", {
        description: "Logged in successfully!"
      });
      navigate('/dashboard'); // Redirect to dashboard
    } catch (error) {
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : "Invalid credentials"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 p-4">
      <div className="bg-card p-8 rounded-lg shadow-2xl w-full max-w-md text-center">
        <h1 className="text-4xl font-heading font-bold text-primary mb-2">Hustlr CRM</h1>
        <p className="text-muted-foreground mb-8">Sign in to continue to your dashboard.</p>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <Label htmlFor="email" className="text-left block mb-1 text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-left block mb-1 text-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          By signing in, you agree to our <Link to="#" className="underline hover:text-primary">Terms of Service</Link> and <Link to="#" className="underline hover:text-primary">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
