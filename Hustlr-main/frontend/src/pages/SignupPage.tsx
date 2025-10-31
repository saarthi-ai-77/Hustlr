import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "@/lib/auth";
import { UserPlus } from "lucide-react";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both passwords are the same."
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await signUp({ email, password });
      toast.success("Account created successfully! 🎉", {
        description: "Welcome to Hustlr CRM! Redirecting to dashboard..."
      });
      navigate("/dashboard"); // Redirect to dashboard
    } catch (error) {
      if (error instanceof Error && error.message.includes("already exists")) {
        toast.error("Email already in use", {
          description: "Please try another email address or log in."
        });
      } else {
        toast.error("Failed to create account", {
          description: error instanceof Error ? error.message : "An unknown error occurred"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-millennial-pink to-cyber-teal p-4">
      <div className="bg-card p-8 rounded-lg shadow-2xl w-full max-w-md text-center">
        <h1 className="text-4xl font-heading font-bold text-primary mb-2">Create Account</h1>
        <p className="text-muted-foreground mb-8">Join Hustlr CRM and start growing your business.</p>
        
        <form className="space-y-6" onSubmit={handleSignup}>
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
              minLength={8}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="text-left block mb-1 text-foreground">Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </>
            )}
          </Button>
        </form>

        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          By signing up, you agree to our <Link to="#" className="underline hover:text-primary">Terms of Service</Link> and <Link to="#" className="underline hover:text-primary">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
