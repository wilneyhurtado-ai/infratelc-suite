import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Eye,
  Calendar,
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  Filter
} from "lucide-react";

interface Report {
  id: string;
  name: string;
  type: "financial" | "site" | "hr" | "operational";
  description: string;
  lastGenerated: string;
  format: "PDF" | "Excel" | "CSV";
  frequency: "daily" | "weekly" | "monthly" | "on-demand";
}

const ReportsManagement = () => {
  const reports: Report[] = [
    {
      id: "1",
      name: "Resumen Financiero por Sitio",
      type: "financial",
      description: "Comparativo de gastos estimados vs reales por cada sitio de trabajo",
      lastGenerated: "2024-09-24",
      format: "Excel",
      frequency: "weekly"
    },
    {
      id: "2",
      name: "Estado de Proyectos",
      type: "site", 
      description: "Avance general de todos los sitios y proyectos activos",
      lastGenerated: "2024-09-24",
      format: "PDF",
      frequency: "monthly"
    },
    {
      id: "3",
      name: "Nómina y Personal",
      type: "hr",
      description: "Distribución de personal por sitio y costos salariales",
      lastGenerated: "2024-09-20",
      format: "Excel",
      frequency: "monthly"
    },
    {
      id: "4",
      name: "Gastos Operacionales",
      type: "operational",
      description: "Desglose detallado de gastos operacionales por categoría",
      lastGenerated: "2024-09-23",
      format: "PDF",
      frequency: "weekly"
    },
    {
      id: "5",
      name: "Análisis de Eficiencia",
      type: "financial",
      description: "Indicadores de eficiencia presupuestal y desviaciones",
      lastGenerated: "2024-09-22",
      format: "PDF",
      frequency: "monthly"
    },
    {
      id: "6",
      name: "Control de Gastos Personal",
      type: "hr",
      description: "Gastos de alimentación, alojamiento y sueldos por sitio",
      lastGenerated: "2024-09-24",
      format: "Excel",
      frequency: "weekly"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "financial":
        return <DollarSign className="w-4 h-4" />;
      case "site":
        return <Building2 className="w-4 h-4" />;
      case "hr":
        return <Users className="w-4 h-4" />;
      case "operational":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "financial":
        return "bg-success/10 text-success border-success/20";
      case "site":
        return "bg-primary/10 text-primary border-primary/20";
      case "hr":
        return "bg-accent/10 text-accent-foreground border-accent/20";
      case "operational":
        return "bg-warning/10 text-warning-foreground border-warning/20";
      default:
        return "bg-secondary/10 text-secondary-foreground border-secondary/20";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "financial":
        return "Financiero";
      case "site":
        return "Sitios";
      case "hr":
        return "RRHH";
      case "operational":
        return "Operacional";
      default:
        return type;
    }
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "Diario";
      case "weekly":
        return "Semanal";
      case "monthly":
        return "Mensual";
      case "on-demand":
        return "Bajo demanda";
      default:
        return frequency;
    }
  };

  const quickReports = [
    {
      name: "Gastos Tetillas",
      description: "Reporte inmediato del sitio Tetillas",
      icon: Building2,
      color: "primary"
    },
    {
      name: "Resumen Financiero",
      description: "Estado financiero consolidado",
      icon: DollarSign,
      color: "success"
    },
    {
      name: "Personal Activo",
      description: "Lista de personal por sitio",
      icon: Users,
      color: "accent"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Reportes</h2>
          <p className="text-muted-foreground">
            Genera y gestiona reportes administrativos y financieros
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button className="bg-gradient-primary hover:bg-primary-hover">
            <FileText className="w-4 h-4 mr-2" />
            Nuevo Reporte
          </Button>
        </div>
      </div>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickReports.map((report, index) => {
              const Icon = report.icon;
              return (
                <Button 
                  key={index}
                  variant="outline" 
                  className="p-6 h-auto flex-col gap-3 hover:shadow-md transition-all"
                >
                  <Icon className="w-8 h-8 text-primary" />
                  <div className="text-center">
                    <p className="font-medium">{report.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getTypeIcon(report.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-foreground">{report.name}</h3>
                      <Badge variant="outline" className={getTypeColor(report.type)}>
                        {getTypeText(report.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Último: {new Date(report.lastGenerated).toLocaleDateString('es-CL')}
                      </div>
                      <span>Formato: {report.format}</span>
                      <span>Frecuencia: {getFrequencyText(report.frequency)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Descargar
                  </Button>
                  <Button size="sm" className="bg-gradient-primary hover:bg-primary-hover">
                    Generar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas Personalizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Crear Plantilla</h3>
                <p className="text-sm text-muted-foreground">
                  Diseña un reporte personalizado para tus necesidades específicas
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-medium">Gastos por Categoría</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Análisis detallado de gastos agrupados por categoría y tipo
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Usar Plantilla
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-success/10 rounded flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-success" />
                  </div>
                  <h3 className="font-medium">Eficiencia Presupuestal</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Comparativo de eficiencia entre sitios y períodos
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Usar Plantilla
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsManagement;