import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/ui/stats-card";
import { 
  Users, 
  UserPlus, 
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Briefcase
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  position: string;
  site: string;
  status: "active" | "leave" | "vacation";
  startDate: string;
  phone: string;
  email: string;
  salary: number;
}

const HRManagement = () => {
  // Sample employee data
  const employees: Employee[] = [
    {
      id: "1",
      name: "Carlos Rodriguez",
      position: "Supervisor de Obra",
      site: "Tetillas",
      status: "active",
      startDate: "2024-01-15",
      phone: "+56 9 8765 4321",
      email: "carlos.rodriguez@infratelc.cl",
      salary: 1200000
    },
    {
      id: "2",
      name: "María González",
      position: "Ingeniera Civil",
      site: "Isla Riesco", 
      status: "active",
      startDate: "2023-11-10",
      phone: "+56 9 8765 4322",
      email: "maria.gonzalez@infratelc.cl",
      salary: 1800000
    },
    {
      id: "3",
      name: "Pedro Silva",
      position: "Operador de Equipos",
      site: "B-55",
      status: "vacation",
      startDate: "2024-03-01",
      phone: "+56 9 8765 4323", 
      email: "pedro.silva@infratelc.cl",
      salary: 950000
    },
    {
      id: "4",
      name: "Ana Martínez",
      position: "Técnico Eléctrico",
      site: "Contenedor Petrosismic",
      status: "active",
      startDate: "2024-02-20",
      phone: "+56 9 8765 4324",
      email: "ana.martinez@infratelc.cl",
      salary: 1100000
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success text-success-foreground";
      case "vacation":
        return "bg-warning text-warning-foreground";
      case "leave":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "vacation":
        return "Vacaciones";
      case "leave":
        return "Licencia";
      default:
        return status;
    }
  };

  // Calculate stats
  const stats = {
    total: employees.length,
    active: employees.filter(emp => emp.status === "active").length,
    onVacation: employees.filter(emp => emp.status === "vacation").length,
    totalPayroll: employees.reduce((sum, emp) => sum + emp.salary, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Recursos Humanos</h2>
          <p className="text-muted-foreground">
            Gestión del personal y nómina por sitios de trabajo
          </p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover">
          <UserPlus className="w-4 h-4 mr-2" />
          Nuevo Empleado
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Personal"
          value={stats.total.toString()}
          change="Distribuido en sitios"
          changeType="neutral"
          icon={Users}
        />
        <StatsCard
          title="Personal Activo"
          value={stats.active.toString()}
          change={`${((stats.active / stats.total) * 100).toFixed(1)}% del total`}
          changeType="positive"
          icon={Briefcase}
        />
        <StatsCard
          title="En Vacaciones"
          value={stats.onVacation.toString()}
          change="Personal en descanso"
          changeType="neutral"
          icon={Clock}
        />
        <StatsCard
          title="Nómina Total"
          value={formatCurrency(stats.totalPayroll)}
          change="Salarios base mensuales"
          changeType="neutral"
          icon={Users}
        />
      </div>

      {/* Employee Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {employees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{employee.name}</CardTitle>
                <Badge className={getStatusColor(employee.status)}>
                  {getStatusText(employee.status)}
                </Badge>
              </div>
              <p className="text-muted-foreground">{employee.position}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Site and Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>Sitio: {employee.site}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Inicio: {new Date(employee.startDate).toLocaleDateString('es-CL')}</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{employee.email}</span>
                </div>
              </div>

              {/* Salary Information */}
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Salario Base</span>
                  <span className="font-medium text-primary">{formatCurrency(employee.salary)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Ver Perfil
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="p-6 h-auto flex-col gap-2">
              <Users className="w-8 h-8 text-primary" />
              <span>Generar Nómina</span>
              <span className="text-xs text-muted-foreground">Procesar pagos mensuales</span>
            </Button>
            <Button variant="outline" className="p-6 h-auto flex-col gap-2">
              <Calendar className="w-8 h-8 text-primary" />
              <span>Gestionar Turnos</span>
              <span className="text-xs text-muted-foreground">Asignar personal a sitios</span>
            </Button>
            <Button variant="outline" className="p-6 h-auto flex-col gap-2">
              <Clock className="w-8 h-8 text-primary" />
              <span>Control de Asistencia</span>
              <span className="text-xs text-muted-foreground">Revisar horas trabajadas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HRManagement;