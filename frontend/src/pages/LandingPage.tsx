
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 p-4 text-center">
      <header className="mb-12">
        <h1 className="text-6xl md:text-7xl font-heading font-bold text-white mb-6 animate-fade-in">
          Hustlr CRM
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-10 animate-fade-in animation-delay-300">
          Stop juggling, start hustling. The CRM that gets your grind.
        </p>
        <Link to="/auth">
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 hover-scale text-lg px-8 py-6 animate-fade-in animation-delay-600"
          >
            <Rocket className="mr-2 h-5 w-5" />
            Get Started
          </Button>
        </Link>
      </header>

      <section className="w-full max-w-4xl grid md:grid-cols-3 gap-8 mb-12">
        {[
          { title: "Track Projects", description: "Never miss a deadline. Keep your projects on point." },
          { title: "Manage Clients", description: "Build relationships that last. Know your clients better." },
          { title: "Send Invoices", description: "Get paid faster. Professional invoices, simplified." },
        ].map((feature, index) => (
          <div
            key={feature.title}
            className={`bg-white/10 p-6 rounded-lg shadow-xl backdrop-blur-md animate-fade-in animation-delay-${900 + index * 200}`}
          >
            <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
            <p className="text-white/80">{feature.description}</p>
          </div>
        ))}
      </section>

      <footer className="text-white/70 animate-fade-in animation-delay-1500">
        <p>&copy; {new Date().getFullYear()} Hustlr CRM. Get that bread 🍞</p>
      </footer>

      <style dangerouslySetInnerHTML={{
        __html: `
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-900 { animation-delay: 0.9s; }
        .animation-delay-1100 { animation-delay: 1.1s; }
        .animation-delay-1300 { animation-delay: 1.3s; }
        .animation-delay-1500 { animation-delay: 1.5s; }
        .animate-fade-in {
          animation-name: fadeIn;
          animation-duration: 0.8s;
          animation-fill-mode: both;
          opacity: 0;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default LandingPage;
