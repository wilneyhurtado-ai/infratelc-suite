import { useState } from "react";
import Navigation from "@/components/ui/navigation";
import Dashboard from "@/components/dashboard/Dashboard";
import SitesManagement from "@/components/sites/SitesManagement";
import ExpensesManagement from "@/components/expenses/ExpensesManagement";
import HRManagement from "@/components/hr/HRManagement";
import ReportsManagement from "@/components/reports/ReportsManagement";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
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
