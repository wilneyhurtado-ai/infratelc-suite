import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Building2, 
  DollarSign, 
  Users, 
  FileText, 
  Settings,
  LogOut
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "sites", label: "Sitios", icon: Building2 },
  { id: "expenses", label: "Gastos", icon: DollarSign },
  { id: "hr", label: "RRHH", icon: Users },
  { id: "reports", label: "Reportes", icon: FileText },
  { id: "settings", label: "Configuración", icon: Settings },
];

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const { signOut, user } = useAuth();

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border/40 shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-md">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Infratelc</h1>
            <p className="text-xs text-muted-foreground">Gestión Administrativa</p>
          </div>
        </div>
        {user && (
          <div className="mt-4 p-3 bg-secondary/20 rounded-lg">
            <p className="text-sm text-foreground font-medium truncate">
              {user.email}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 hover:bg-secondary/50",
                  activeTab === item.id
                    ? "bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-border/40">
        <Button
          onClick={signOut}
          variant="outline"
          className="w-full flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;