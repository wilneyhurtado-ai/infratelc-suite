import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "@/components/ui/stats-card";
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Users,
  AlertTriangle,
  CheckCircle,
  Briefcase,
  Clock,
  Calendar,
  Target
} from "lucide-react";

const Dashboard = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Real-time data from database
  const { data: sites = [] } = useQuery({
    queryKey: ['dashboard-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites_enhanced')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['dashboard-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('amount, expense_date')
        .gte('expense_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
      if (error) throw error;
      return data;
    }
  });

  const { data: personnel = [] } = useQuery({
    queryKey: ['dashboard-personnel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personnel')
        .select('*')
        .eq('status', 'Activo');
      if (error) throw error;
      return data;
    }
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ['dashboard-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: workOrders = [] } = useQuery({
    queryKey: ['dashboard-work-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .in('status', ['created', 'in_progress']);
      if (error) throw error;
      return data;
    }
  });

  const { data: timesheets = [] } = useQuery({
    queryKey: ['dashboard-timesheets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timesheets')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0]);
      if (error) throw error;
      return data;
    }
  });

  // Calculate real stats
  const totalBudget = sites.reduce((sum, site) => sum + (site.budget || 0), 0);
  const totalSpent = sites.reduce((sum, site) => sum + (site.spent || 0), 0);
  const monthlyExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const efficiency = totalBudget > 0 ? ((totalBudget - totalSpent) / totalBudget) * 100 : 100;
  const activeProjects = sites.filter(site => site.status === 'in_progress').length;
  const opportunitiesValue = opportunities.reduce((sum, opp) => sum + (opp.value_clp || 0), 0);

  const stats = [
    {
      title: "Sitios Activos",
      value: sites.length.toString(),
      change: `${activeProjects} en progreso`,
      changeType: "positive" as const,
      icon: Building2
    },
    {
      title: "Presupuesto Total",
      value: formatCurrency(totalBudget),
      change: `${formatCurrency(totalSpent)} ejecutado`, 
      changeType: totalSpent < totalBudget * 0.8 ? "positive" as const : "neutral" as const,
      icon: DollarSign
    },
    {
      title: "Eficiencia Presupuestal",
      value: `${efficiency.toFixed(1)}%`,
      change: `${formatCurrency(totalBudget - totalSpent)} disponible`,
      changeType: efficiency > 80 ? "positive" as const : efficiency > 60 ? "neutral" as const : "negative" as const,
      icon: TrendingUp
    },
    {
      title: "Personal Activo",
      value: personnel.length.toString(),
      change: "Distribuido en sitios",
      changeType: "neutral" as const,
      icon: Users
    },
    {
      title: "Oportunidades CRM",
      value: opportunities.length.toString(),
      change: formatCurrency(opportunitiesValue),
      changeType: "positive" as const,
      icon: Briefcase
    },
    {
      title: "Órdenes Activas",
      value: workOrders.length.toString(),
      change: "En ejecución",
      changeType: workOrders.length > 0 ? "positive" as const : "neutral" as const,
      icon: Target
    },
    {
      title: "Asistencia Hoy",
      value: timesheets.length.toString(),
      change: "Empleados registrados",
      changeType: "neutral" as const,
      icon: Clock
    },
    {
      title: "Gastos del Mes",
      value: formatCurrency(monthlyExpenses),
      change: `${expenses.length} registros`,
      changeType: "neutral" as const,
      icon: Calendar
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
              {sites.slice(0, 4).map((site, index) => {
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
                        {formatCurrency(site.spent || 0)} / {formatCurrency(site.budget || 0)}
                      </p>
                      <p className={`text-sm ${efficiency > 80 ? 'text-success' : efficiency > 60 ? 'text-warning' : 'text-destructive'}`}>
                        {efficiency.toFixed(1)}% disponible
                      </p>
                    </div>
                  </div>
                );
              })}
              {sites.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay sitios registrados</p>
                </div>
              )}
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
                  <span className="text-sm font-medium text-success">Presupuesto Disponible</span>
                  <span className="text-lg font-bold text-success">{formatCurrency(totalBudget - totalSpent)}</span>
                </div>
                <p className="text-xs text-success/80 mt-1">
                  {((totalBudget - totalSpent) / totalBudget * 100).toFixed(1)}% del presupuesto total
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">Presupuesto Total</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(totalBudget)}</span>
                </div>
                <p className="text-xs text-primary/80 mt-1">
                  {sites.length} sitios activos
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-accent-foreground">Ejecutado</span>
                  <span className="text-lg font-bold text-accent-foreground">{formatCurrency(totalSpent)}</span>
                </div>
                <p className="text-xs text-accent-foreground/80 mt-1">
                  {(totalSpent / totalBudget * 100).toFixed(1)}% del presupuesto total
                </p>
              </div>

              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-warning">Gastos del Mes</span>
                  <span className="text-lg font-bold text-warning">{formatCurrency(monthlyExpenses)}</span>
                </div>
                <p className="text-xs text-warning/80 mt-1">
                  {expenses.length} transacciones este mes
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