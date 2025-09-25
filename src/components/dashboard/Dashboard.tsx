import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "@/components/ui/stats-card";
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Users,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const Dashboard = () => {
  // Sample data based on Excel templates
  const stats = [
    {
      title: "Sitios Activos",
      value: "4",
      change: "+1 este mes",
      changeType: "positive" as const,
      icon: Building2
    },
    {
      title: "Gastos Totales",
      value: "$60.1M",
      change: "-5.2% vs estimado", 
      changeType: "positive" as const,
      icon: DollarSign
    },
    {
      title: "Eficiencia Presupuestal",
      value: "94.8%",
      change: "+2.1% este mes",
      changeType: "positive" as const,
      icon: TrendingUp
    },
    {
      title: "Personal Activo",
      value: "47",
      change: "Distribuido en sitios",
      changeType: "neutral" as const,
      icon: Users
    }
  ];

  const sitesSummary = [
    {
      name: "Tetillas",
      budget: 13897614,
      spent: 1773100,
      status: "En progreso"
    },
    {
      name: "B-55", 
      budget: 14246664,
      spent: 0,
      status: "Planificado"
    },
    {
      name: "Isla Riesco",
      budget: 11282692,
      spent: 5332692,
      status: "En progreso"
    },
    {
      name: "Contenedor Petrosismic",
      budget: 20673624,
      spent: 0,
      status: "Planificado"
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "En progreso":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "Completado":
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <Building2 className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">
          Resumen ejecutivo de operaciones Infratelc
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Sites Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Resumen de Sitios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sitesSummary.map((site, index) => {
                const efficiency = site.budget > 0 ? ((site.budget - site.spent) / site.budget) * 100 : 100;
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(site.status)}
                      <div>
                        <p className="font-medium text-foreground">{site.name}</p>
                        <p className="text-sm text-muted-foreground">{site.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {formatCurrency(site.spent)} / {formatCurrency(site.budget)}
                      </p>
                      <p className={`text-sm ${efficiency > 80 ? 'text-success' : efficiency > 60 ? 'text-warning' : 'text-destructive'}`}>
                        {efficiency.toFixed(1)}% disponible
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Análisis Financiero
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-success">Ahorro Total</span>
                  <span className="text-lg font-bold text-success">$53.0M</span>
                </div>
                <p className="text-xs text-success/80 mt-1">
                  Diferencia entre presupuestado y ejecutado
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">Presupuesto Total</span>
                  <span className="text-lg font-bold text-primary">$60.1M</span>
                </div>
                <p className="text-xs text-primary/80 mt-1">
                  Suma de todos los sitios
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-accent-foreground">Ejecutado</span>
                  <span className="text-lg font-bold text-accent-foreground">$7.1M</span>
                </div>
                <p className="text-xs text-accent-foreground/80 mt-1">
                  11.8% del presupuesto total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;