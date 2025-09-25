import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  Plus, 
  Filter,
  Search,
  FileText,
  Users,
  Wrench,
  TrendingUp,
  Download
} from "lucide-react";

interface Expense {
  id: string;
  description: string;
  amount: number;
  estimatedAmount: number;
  category: "personal" | "operational" | "materials" | "services";
  type: "alimentacion" | "alojamiento" | "sueldos" | "combustible" | "materiales" | "flete" | "otros";
  site: string;
  date: string;
  documentNumber?: string;
  status: "planned" | "executed" | "approved";
}

const ExpensesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSite, setSelectedSite] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Sample data based on Excel templates
  const expenses: Expense[] = [
    {
      id: "1",
      description: "Combustible, camioneta y generador x 30 días",
      amount: 750000,
      estimatedAmount: 750000,
      category: "operational",
      type: "combustible",
      site: "Tetillas",
      date: "2024-09-21",
      status: "executed"
    },
    {
      id: "2", 
      description: "Materiales de ferretería para emplantillado",
      amount: 0,
      estimatedAmount: 1200000,
      category: "materials",
      type: "materiales",
      site: "Tetillas",
      date: "2024-09-21",
      status: "planned"
    },
    {
      id: "3",
      description: "Alimentación x 10.000 x persona",
      amount: 0,
      estimatedAmount: 1440000,
      category: "personal",
      type: "alimentacion",
      site: "Tetillas",
      date: "2024-09-21",
      documentNumber: "22 y 23.Septiembre",
      status: "planned"
    },
    {
      id: "4",
      description: "Alojamiento 70.000",
      amount: 1773100,
      estimatedAmount: 1582700,
      category: "personal",
      type: "alojamiento",
      site: "Tetillas", 
      date: "2024-09-21",
      documentNumber: "22 y 23.Septiembre",
      status: "executed"
    },
    {
      id: "5",
      description: "Sueldos",
      amount: 0,
      estimatedAmount: 3080000,
      category: "personal",
      type: "sueldos",
      site: "Tetillas",
      date: "2024-09-21",
      status: "planned"
    },
    {
      id: "6",
      description: "Flete torre",
      amount: 0,
      estimatedAmount: 2500000,
      category: "services",
      type: "flete",
      site: "Tetillas",
      date: "2024-09-21",
      status: "planned"
    }
  ];

  const sites = ["Tetillas", "B-55", "Isla Riesco", "Contenedor Petrosismic"];
  
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = selectedSite === "all" || expense.site === selectedSite;
    const matchesCategory = selectedCategory === "all" || expense.category === selectedCategory;
    return matchesSearch && matchesSite && matchesCategory;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "personal":
        return <Users className="w-4 h-4" />;
      case "operational":
        return <Wrench className="w-4 h-4" />;
      case "materials":
        return <FileText className="w-4 h-4" />;
      case "services":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "executed":
        return "bg-success text-success-foreground";
      case "approved":
        return "bg-primary text-primary-foreground";
      case "planned":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "executed":
        return "Ejecutado";
      case "approved":
        return "Aprobado";
      case "planned":
        return "Planificado";
      default:
        return status;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case "personal":
        return "Personal";
      case "operational":
        return "Operacional";
      case "materials":
        return "Materiales";
      case "services":
        return "Servicios";
      default:
        return category;
    }
  };

  // Calculate totals
  const totals = {
    estimated: filteredExpenses.reduce((sum, exp) => sum + exp.estimatedAmount, 0),
    actual: filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    get difference() { return this.estimated - this.actual; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Gestión de Gastos</h2>
          <p className="text-muted-foreground">
            Control y seguimiento de gastos por sitio y categoría
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-gradient-primary hover:bg-primary-hover">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Gasto
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Presupuestado</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totals.estimated)}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ejecutado</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totals.actual)}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Diferencia</p>
                <p className={`text-2xl font-bold ${totals.difference >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(totals.difference)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                totals.difference >= 0 ? 'bg-success/10' : 'bg-destructive/10'
              }`}>
                <TrendingUp className={`w-6 h-6 ${
                  totals.difference >= 0 ? 'text-success' : 'text-destructive'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar gastos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Seleccionar sitio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los sitios</SelectItem>
                {sites.map(site => (
                  <SelectItem key={site} value={site}>{site}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="operational">Operacional</SelectItem>
                <SelectItem value="materials">Materiales</SelectItem>
                <SelectItem value="services">Servicios</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getCategoryIcon(expense.category)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{expense.description}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-muted-foreground">{expense.site}</span>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryText(expense.category)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString('es-CL')}
                      </span>
                      {expense.documentNumber && (
                        <span className="text-sm text-muted-foreground">
                          Doc: {expense.documentNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Estimado</p>
                    <p className="font-medium">{formatCurrency(expense.estimatedAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Real</p>
                    <p className="font-medium">{formatCurrency(expense.amount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Diferencia</p>
                    <p className={`font-medium ${
                      (expense.estimatedAmount - expense.amount) >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {formatCurrency(expense.estimatedAmount - expense.amount)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(expense.status)}>
                    {getStatusText(expense.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          {filteredExpenses.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No se encontraron gastos
              </h3>
              <p className="text-muted-foreground">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesManagement;