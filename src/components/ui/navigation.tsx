import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  BarChart3, 
  Users, 
  FileText, 
  Settings,
  DollarSign
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "sites", label: "Sitios", icon: Building2 },
    { id: "expenses", label: "Gastos", icon: DollarSign },
    { id: "hr", label: "RRHH", icon: Users },
    { id: "reports", label: "Reportes", icon: FileText },
    { id: "settings", label: "Configuración", icon: Settings },
  ];

  return (
    <nav className="bg-card border-r border-border h-screen w-64 fixed left-0 top-0 z-30">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Infratelc</h1>
            <p className="text-sm text-muted-foreground">Gestión Administrativa</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  activeTab === item.id 
                    ? "bg-gradient-primary text-primary-foreground shadow-md" 
                    : "hover:bg-secondary/80"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;