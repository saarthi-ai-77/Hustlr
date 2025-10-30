
import { Link } from "react-router-dom";
import { VibeSwitch } from "./VibeSwitch";
import { LayoutDashboard, Briefcase, FileText, Users } from "lucide-react"; // Icons for nav

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard }, // Updated path
  { path: "/projects", label: "Projects", icon: Briefcase },
  { path: "/invoices", label: "Invoices", icon: FileText },
  { path: "/clients", label: "Clients", icon: Users },
];

export function Navbar() {
  return (
    <nav className="bg-card border-b border-border p-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/dashboard" className="text-2xl font-heading font-bold text-primary"> {/* Updated path */}
        Hustlr CRM
      </Link>
      <div className="flex items-center space-x-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
            title={item.label}
          >
            <item.icon className="h-5 w-5" />
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        ))}
        <VibeSwitch />
      </div>
    </nav>
  );
}
