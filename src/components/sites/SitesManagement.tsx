import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  Plus, 
  Eye, 
  Edit,
  MapPin,
  Calendar,
  DollarSign,
  Search
} from "lucide-react";

interface Site {
  id: string;
  name: string;
  location: string;
  status: "En progreso" | "Planificado" | "Completado" | "Pausado";
  budget: number;
  spent: number;
  startDate: string;
  endDate?: string;
  category: string;
}

const SitesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Sample data based on Excel templates
  const sites: Site[] = [
    {
      id: "1",
      name: "Tetillas",
      location: "Región de Magallanes",
      status: "En progreso",
      budget: 13897614,
      spent: 1773100,
      startDate: "2024-09-21",
      category: "Torres eléctricas"
    },
    {
      id: "2", 
      name: "B-55",
      location: "Región de Magallanes",
      status: "Planificado",
      budget: 14246664,
      spent: 0,
      startDate: "2024-10-15",
      category: "Torres eléctricas"
    },
    {
      id: "3",
      name: "Isla Riesco",
      location: "Región de Magallanes",
      status: "En progreso", 
      budget: 11282692,
      spent: 5332692,
      startDate: "2024-08-01",
      category: "Torres eléctricas"
    },
    {
      id: "4",
      name: "Contenedor Petrosismic",
      location: "Región de Magallanes",
      status: "Planificado",
      budget: 20673624,
      spent: 0,
      startDate: "2024-11-01",
      category: "Contenedores explosivos"
    }
  ];

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En progreso":
        return "bg-warning text-warning-foreground";
      case "Completado":
        return "bg-success text-success-foreground";
      case "Planificado":
        return "bg-primary text-primary-foreground";
      case "Pausado":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getProgressPercentage = (spent: number, budget: number) => {
    return budget > 0 ? (spent / budget) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Gestión de Sitios</h2>
          <p className="text-muted-foreground">
            Administra todos los sitios y proyectos de construcción
          </p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Sitio
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar sitios por nombre, ubicación o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSites.map((site) => {
          const progress = getProgressPercentage(site.spent, site.budget);
          const remaining = site.budget - site.spent;
          
          return (
            <Card key={site.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    {site.name}
                  </CardTitle>
                  <Badge className={getStatusColor(site.status)}>
                    {site.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {site.location}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Budget Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progreso presupuestal</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-gradient-primary rounded-full h-2 transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Financial Info */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Presupuesto</span>
                    <span className="font-medium">{formatCurrency(site.budget)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ejecutado</span>
                    <span className="font-medium text-primary">{formatCurrency(site.spent)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Disponible</span>
                    <span className={`font-medium ${remaining > 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                </div>

                {/* Project Details */}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4" />
                    Inicio: {new Date(site.startDate).toLocaleDateString('es-CL')}
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    Categoría: {site.category}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Gastos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {filteredSites.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No se encontraron sitios
            </h3>
            <p className="text-muted-foreground">
              Intenta ajustar los criterios de búsqueda
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SitesManagement;