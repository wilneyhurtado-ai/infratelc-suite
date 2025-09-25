import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navigation from "@/components/ui/navigation";
import Dashboard from "@/components/dashboard/Dashboard";
import SitesManagement from "@/components/sites/SitesManagement";
import ExpensesManagement from "@/components/expenses/ExpensesManagement";
import HRManagement from "@/components/hr/HRManagement";
import ReportsManagement from "@/components/reports/ReportsManagement";
import UserManagement from '@/components/admin/UserManagement';
import WorkerDashboard from '@/components/worker/WorkerDashboard';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Get user profile and role
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Auto-redirect workers to their dashboard
    if (profile?.role === 'trabajador' || profile?.role === 'tecnico') {
      setActiveTab('worker-dashboard');
    }
  }, [profile?.role]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const renderContent = () => {
    // Worker Dashboard for trabajador and tecnico roles
    if (profile?.role === 'trabajador' || profile?.role === 'tecnico') {
      return <WorkerDashboard />;
    }

    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "sites":
        return <SitesManagement />;
      case "expenses":
        return <ExpensesManagement />;
      case "hr":
        return <HRManagement />;
      case "reports":
        return <ReportsManagement />;
      case "users":
        return <UserManagement />;
      case "worker-dashboard":
        return <WorkerDashboard />;
      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Configuración</h2>
            <p className="text-muted-foreground">Próximamente: configuración del sistema</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-64 p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;