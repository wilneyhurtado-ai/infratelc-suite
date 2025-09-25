import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle,
  XCircle,
  Timer,
  User,
  Building,
  MoreHorizontal
} from 'lucide-react';

const TimesheetsManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isTimesheetDialogOpen, setIsTimesheetDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [newTimesheet, setNewTimesheet] = useState({
    employee_id: '',
    site_id: '',
    work_order_id: '',
    date: new Date().toISOString().split('T')[0],
    check_in_time: '',
    check_out_time: '',
    break_start_time: '',
    break_end_time: '',
    notes: ''
  });

  // Fetch timesheets
  const { data: timesheets = [], isLoading: timesheetsLoading } = useQuery({
    queryKey: ['timesheets', selectedDate],
    queryFn: async () => {
      const startDate = selectedDate;
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 6); // Week view
      
      const { data, error } = await supabase
        .from('timesheets')
        .select(`
          *,
          sites_enhanced (name, site_code),
          work_orders (title, order_number)
        `)
        .gte('date', startDate)
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch employees
  const { data: employees = [] } = useQuery({
    queryKey: ['timesheet-employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personnel')
        .select('*')
        .eq('status', 'Activo');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch sites
  const { data: sites = [] } = useQuery({
    queryKey: ['timesheet-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites_enhanced')
        .select('*')
        .in('status', ['construction', 'testing', 'operational', 'maintenance']);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch work orders
  const { data: workOrders = [] } = useQuery({
    queryKey: ['timesheet-workorders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .in('status', ['assigned', 'in_progress']);
      
      if (error) throw error;
      return data;
    },
  });

  // Create timesheet mutation
  const createTimesheetMutation = useMutation({
    mutationFn: async (timesheetData: typeof newTimesheet) => {
      // Calculate total hours
      const checkIn = new Date(`${timesheetData.date}T${timesheetData.check_in_time}`);
      const checkOut = new Date(`${timesheetData.date}T${timesheetData.check_out_time}`);
      const breakStart = timesheetData.break_start_time ? new Date(`${timesheetData.date}T${timesheetData.break_start_time}`) : null;
      const breakEnd = timesheetData.break_end_time ? new Date(`${timesheetData.date}T${timesheetData.break_end_time}`) : null;
      
      let totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
      
      if (breakStart && breakEnd) {
        const breakHours = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60);
        totalHours -= breakHours;
      }

      const overtimeHours = Math.max(0, totalHours - 8); // Standard 8-hour workday

      const { error } = await supabase
        .from('timesheets')
        .insert({
          ...timesheetData,
          check_in_time: `${timesheetData.date}T${timesheetData.check_in_time}:00.000Z`,
          check_out_time: `${timesheetData.date}T${timesheetData.check_out_time}:00.000Z`,
          break_start_time: timesheetData.break_start_time ? `${timesheetData.date}T${timesheetData.break_start_time}:00.000Z` : null,
          break_end_time: timesheetData.break_end_time ? `${timesheetData.date}T${timesheetData.break_end_time}:00.000Z` : null,
          total_hours: totalHours,
          overtime_hours: overtimeHours,
          tenant_id: 'demo-tenant-id'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Registro de tiempo creado exitosamente' });
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      setIsTimesheetDialogOpen(false);
      setNewTimesheet({
        employee_id: '',
        site_id: '',
        work_order_id: '',
        date: new Date().toISOString().split('T')[0],
        check_in_time: '',
        check_out_time: '',
        break_start_time: '',
        break_end_time: '',
        notes: ''
      });
    },
    onError: (error) => {
      toast({
        title: 'Error al crear registro',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  // Approve timesheet mutation
  const approveTimesheetMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('timesheets')
        .update({
          status,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Estado actualizado exitosamente' });
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });

  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (hours: number) => {
    if (!hours) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTotalHoursForWeek = () => {
    return timesheets.reduce((total, timesheet) => total + (timesheet.total_hours || 0), 0);
  };

  const getOvertimeHoursForWeek = () => {
    return timesheets.reduce((total, timesheet) => total + (timesheet.overtime_hours || 0), 0);
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? employee.full_name : 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Control de Asistencia</h2>
          <p className="text-muted-foreground">Gestión de horarios, asistencia y horas trabajadas</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia Hoy</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timesheets.filter(t => t.date === new Date().toISOString().split('T')[0]).length}
            </div>
            <p className="text-xs text-muted-foreground">de {employees.length} empleados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Semana</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(getTotalHoursForWeek())}</div>
            <p className="text-xs text-muted-foreground">trabajadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Extra</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(getOvertimeHoursForWeek())}</div>
            <p className="text-xs text-muted-foreground">esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timesheets.filter(t => t.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">por aprobar</p>
          </CardContent>
        </Card>
      </div>

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selección de Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="space-y-2">
              <Label>Fecha de inicio de semana</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Período mostrado</Label>
              <p className="text-sm text-muted-foreground">
                {selectedDate} al {new Date(new Date(selectedDate).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="timesheets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timesheets">Registros de Tiempo</TabsTrigger>
          <TabsTrigger value="attendance">Asistencia Diaria</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="timesheets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Registros de Tiempo</h3>
            <Dialog open={isTimesheetDialogOpen} onOpenChange={setIsTimesheetDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Registro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Registro de Tiempo</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee">Empleado *</Label>
                    <Select value={newTimesheet.employee_id} onValueChange={(value) => setNewTimesheet({ ...newTimesheet, employee_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar empleado" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.full_name} - {employee.employee_code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newTimesheet.date}
                      onChange={(e) => setNewTimesheet({ ...newTimesheet, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site">Sitio</Label>
                    <Select value={newTimesheet.site_id} onValueChange={(value) => setNewTimesheet({ ...newTimesheet, site_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar sitio" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites.map((site) => (
                          <SelectItem key={site.id} value={site.id}>
                            {site.name} ({site.site_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="work_order">Orden de Trabajo</Label>
                    <Select value={newTimesheet.work_order_id} onValueChange={(value) => setNewTimesheet({ ...newTimesheet, work_order_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar orden" />
                      </SelectTrigger>
                      <SelectContent>
                        {workOrders.map((order) => (
                          <SelectItem key={order.id} value={order.id}>
                            {order.title} ({order.order_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="check_in">Hora de Entrada *</Label>
                    <Input
                      id="check_in"
                      type="time"
                      value={newTimesheet.check_in_time}
                      onChange={(e) => setNewTimesheet({ ...newTimesheet, check_in_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="check_out">Hora de Salida *</Label>
                    <Input
                      id="check_out"
                      type="time"
                      value={newTimesheet.check_out_time}
                      onChange={(e) => setNewTimesheet({ ...newTimesheet, check_out_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="break_start">Inicio Descanso</Label>
                    <Input
                      id="break_start"
                      type="time"
                      value={newTimesheet.break_start_time}
                      onChange={(e) => setNewTimesheet({ ...newTimesheet, break_start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="break_end">Fin Descanso</Label>
                    <Input
                      id="break_end"
                      type="time"
                      value={newTimesheet.break_end_time}
                      onChange={(e) => setNewTimesheet({ ...newTimesheet, break_end_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="notes">Notas</Label>
                    <Input
                      id="notes"
                      value={newTimesheet.notes}
                      onChange={(e) => setNewTimesheet({ ...newTimesheet, notes: e.target.value })}
                      placeholder="Notas adicionales sobre el trabajo realizado"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsTimesheetDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => createTimesheetMutation.mutate(newTimesheet)}
                    disabled={createTimesheetMutation.isPending}
                  >
                    {createTimesheetMutation.isPending ? 'Creando...' : 'Crear Registro'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              {timesheetsLoading ? (
                <div className="text-center py-4">Cargando registros...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Sitio/Orden</TableHead>
                      <TableHead>Entrada</TableHead>
                      <TableHead>Salida</TableHead>
                      <TableHead>Horas</TableHead>
                      <TableHead>H. Extra</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timesheets.map((timesheet) => (
                      <TableRow key={timesheet.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            {getEmployeeName(timesheet.employee_id)}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(timesheet.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div>
                            {timesheet.sites_enhanced?.name && (
                              <div className="flex items-center text-sm">
                                <Building className="mr-1 h-3 w-3" />
                                {timesheet.sites_enhanced.name}
                              </div>
                            )}
                            {timesheet.work_orders?.title && (
                              <div className="text-xs text-muted-foreground">
                                {timesheet.work_orders.title}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatTime(timesheet.check_in_time)}</TableCell>
                        <TableCell>{formatTime(timesheet.check_out_time)}</TableCell>
                        <TableCell className="font-medium">
                          {formatDuration(timesheet.total_hours)}
                        </TableCell>
                        <TableCell>
                          {timesheet.overtime_hours > 0 ? (
                            <span className="text-orange-600 font-medium">
                              {formatDuration(timesheet.overtime_hours)}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(timesheet.status)} text-white`}>
                            {getStatusLabel(timesheet.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {timesheet.status === 'pending' && (
                            <div className="flex space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => approveTimesheetMutation.mutate({ id: timesheet.id, status: 'approved' })}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => approveTimesheetMutation.mutate({ id: timesheet.id, status: 'rejected' })}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Asistencia Diaria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Vista de Calendario</h3>
                <p>Aquí se mostrará un calendario con la asistencia diaria de todos los empleados</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reportes de Asistencia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Reportes Detallados</h3>
                <p>Generar reportes por empleado, período, sitio u orden de trabajo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimesheetsManagement;