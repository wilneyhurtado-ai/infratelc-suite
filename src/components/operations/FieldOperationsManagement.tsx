import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Radio, 
  MapPin, 
  CheckSquare, 
  AlertTriangle,
  Wrench,
  Calendar,
  Clock,
  User,
  Building,
  Signal,
  Zap,
  Wifi
} from 'lucide-react';

const FieldOperationsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSiteDialogOpen, setIsSiteDialogOpen] = useState(false);
  const [isWorkOrderDialogOpen, setIsWorkOrderDialogOpen] = useState(false);

  const [newSite, setNewSite] = useState({
    site_code: '',
    name: '',
    description: '',
    site_type: 'antenna',
    address: '',
    region: '',
    comuna: '',
    height_meters: '',
    structure_type: 'tower',
    power_available: false,
    fiber_available: false,
    budget: '',
    priority: 'medium'
  });

  const [newWorkOrder, setNewWorkOrder] = useState({
    site_id: '',
    order_number: '',
    title: '',
    description: '',
    work_type: 'site_survey',
    priority: 'medium',
    estimated_hours: '',
    scheduled_date: '',
    materials_needed: '',
    safety_requirements: ''
  });

  // Fetch sites
  const { data: sites = [], isLoading: sitesLoading } = useQuery({
    queryKey: ['sites-enhanced'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites_enhanced')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch work orders
  const { data: workOrders = [], isLoading: workOrdersLoading } = useQuery({
    queryKey: ['work-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          sites_enhanced (name, site_code)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch incidents
  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          sites_enhanced (name, site_code)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  // Create site mutation
  const createSiteMutation = useMutation({
    mutationFn: async (siteData: typeof newSite) => {
      const { error } = await supabase
        .from('sites_enhanced')
        .insert({
          ...siteData,
          height_meters: parseFloat(siteData.height_meters) || null,
          budget: parseFloat(siteData.budget) || 0,
          tenant_id: 'demo-tenant-id' // In real app, get from user context
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Sitio creado exitosamente' });
      queryClient.invalidateQueries({ queryKey: ['sites-enhanced'] });
      setIsSiteDialogOpen(false);
      setNewSite({
        site_code: '',
        name: '',
        description: '',
        site_type: 'antenna',
        address: '',
        region: '',
        comuna: '',
        height_meters: '',
        structure_type: 'tower',
        power_available: false,
        fiber_available: false,
        budget: '',
        priority: 'medium'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error al crear sitio',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  // Create work order mutation
  const createWorkOrderMutation = useMutation({
    mutationFn: async (workOrderData: typeof newWorkOrder) => {
      const { error } = await supabase
        .from('work_orders')
        .insert({
          ...workOrderData,
          estimated_hours: parseFloat(workOrderData.estimated_hours) || 0,
          materials_needed: workOrderData.materials_needed.split(',').map(m => m.trim()),
          safety_requirements: workOrderData.safety_requirements.split(',').map(s => s.trim()),
          tenant_id: 'demo-tenant-id'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Orden de trabajo creada exitosamente' });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      setIsWorkOrderDialogOpen(false);
      setNewWorkOrder({
        site_id: '',
        order_number: '',
        title: '',
        description: '',
        work_type: 'site_survey',
        priority: 'medium',
        estimated_hours: '',
        scheduled_date: '',
        materials_needed: '',
        safety_requirements: ''
      });
    },
  });

  const getSiteTypeIcon = (type: string) => {
    const icons = {
      antenna: Radio,
      tower: Building,
      rooftop: Building,
      ground: MapPin,
      indoor: Building
    };
    return icons[type as keyof typeof icons] || Radio;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planned: 'bg-blue-500',
      survey: 'bg-yellow-500',
      design: 'bg-orange-500',
      construction: 'bg-purple-500',
      testing: 'bg-indigo-500',
      operational: 'bg-green-500',
      maintenance: 'bg-amber-500',
      decommissioned: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500',
      emergency: 'bg-red-600'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500';
  };

  const getWorkTypeLabel = (type: string) => {
    const labels = {
      site_survey: 'Relevamiento',
      civil_work: 'Obra Civil',
      tower_installation: 'Instalación Torre',
      antenna_installation: 'Instalación Antena',
      alignment: 'Alineación',
      integration: 'Integración',
      maintenance: 'Mantenimiento',
      repair: 'Reparación',
      inspection: 'Inspección'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Operaciones de Campo</h2>
          <p className="text-muted-foreground">Gestión de sitios, órdenes de trabajo e incidentes</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sitios</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sites.length}</div>
            <p className="text-xs text-muted-foreground">
              {sites.filter(s => s.status === 'operational').length} operativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Activas</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workOrders.filter(wo => ['created', 'assigned', 'in_progress'].includes(wo.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {workOrders.filter(wo => wo.status === 'in_progress').length} en progreso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidentes Abiertos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {incidents.filter(i => i.status === 'open').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {incidents.filter(i => i.severity === 'critical').length} críticos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Construcción</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sites.filter(s => s.status === 'construction').length}
            </div>
            <p className="text-xs text-muted-foreground">sitios en obra</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mantenimientos</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workOrders.filter(wo => wo.work_type === 'maintenance').length}
            </div>
            <p className="text-xs text-muted-foreground">programados</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sites">Sitios</TabsTrigger>
          <TabsTrigger value="work-orders">Órdenes de Trabajo</TabsTrigger>
          <TabsTrigger value="incidents">Incidentes</TabsTrigger>
        </TabsList>

        <TabsContent value="sites" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Sitios de Telecomunicaciones</h3>
            <Dialog open={isSiteDialogOpen} onOpenChange={setIsSiteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Sitio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Sitio</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="site_code">Código del Sitio *</Label>
                    <Input
                      id="site_code"
                      value={newSite.site_code}
                      onChange={(e) => setNewSite({ ...newSite, site_code: e.target.value })}
                      placeholder="ST-RM-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site_name">Nombre del Sitio *</Label>
                    <Input
                      id="site_name"
                      value={newSite.name}
                      onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                      placeholder="Torre Las Condes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site_type">Tipo de Sitio</Label>
                    <Select value={newSite.site_type} onValueChange={(value) => setNewSite({ ...newSite, site_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="antenna">Antena</SelectItem>
                        <SelectItem value="tower">Torre</SelectItem>
                        <SelectItem value="rooftop">Azotea</SelectItem>
                        <SelectItem value="ground">Terreno</SelectItem>
                        <SelectItem value="indoor">Interior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="structure_type">Tipo de Estructura</Label>
                    <Select value={newSite.structure_type} onValueChange={(value) => setNewSite({ ...newSite, structure_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tower">Torre</SelectItem>
                        <SelectItem value="mast">Mástil</SelectItem>
                        <SelectItem value="monopole">Monopolo</SelectItem>
                        <SelectItem value="building">Edificio</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={newSite.address}
                      onChange={(e) => setNewSite({ ...newSite, address: e.target.value })}
                      placeholder="Av. Las Condes 123, Las Condes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Región</Label>
                    <Input
                      id="region"
                      value={newSite.region}
                      onChange={(e) => setNewSite({ ...newSite, region: e.target.value })}
                      placeholder="Metropolitana"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comuna">Comuna</Label>
                    <Input
                      id="comuna"
                      value={newSite.comuna}
                      onChange={(e) => setNewSite({ ...newSite, comuna: e.target.value })}
                      placeholder="Las Condes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (metros)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={newSite.height_meters}
                      onChange={(e) => setNewSite({ ...newSite, height_meters: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Presupuesto</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={newSite.budget}
                      onChange={(e) => setNewSite({ ...newSite, budget: e.target.value })}
                      placeholder="50000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridad</Label>
                    <Select value={newSite.priority} onValueChange={(value) => setNewSite({ ...newSite, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="power_available"
                          checked={newSite.power_available}
                          onChange={(e) => setNewSite({ ...newSite, power_available: e.target.checked })}
                        />
                        <Label htmlFor="power_available" className="flex items-center">
                          <Zap className="mr-1 h-4 w-4" />
                          Energía Disponible
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="fiber_available"
                          checked={newSite.fiber_available}
                          onChange={(e) => setNewSite({ ...newSite, fiber_available: e.target.checked })}
                        />
                        <Label htmlFor="fiber_available" className="flex items-center">
                          <Wifi className="mr-1 h-4 w-4" />
                          Fibra Disponible
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={newSite.description}
                      onChange={(e) => setNewSite({ ...newSite, description: e.target.value })}
                      placeholder="Descripción detallada del sitio..."
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsSiteDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => createSiteMutation.mutate(newSite)}
                    disabled={createSiteMutation.isPending}
                  >
                    {createSiteMutation.isPending ? 'Creando...' : 'Crear Sitio'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              {sitesLoading ? (
                <div className="text-center py-4">Cargando sitios...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sitio</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Características</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sites.map((site) => {
                      const SiteIcon = getSiteTypeIcon(site.site_type);
                      return (
                        <TableRow key={site.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <SiteIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{site.name}</div>
                                <div className="text-sm text-muted-foreground">{site.site_code}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">{site.site_type}</div>
                              <div className="text-xs text-muted-foreground">{site.structure_type}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">{site.comuna}, {site.region}</div>
                              {site.height_meters && (
                                <div className="text-xs text-muted-foreground">{site.height_meters}m altura</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(site.status)} text-white`}>
                              {site.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getPriorityColor(site.priority)} text-white`}>
                              {site.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              {site.power_available && <Zap className="h-4 w-4 text-green-500" />}
                              {site.fiber_available && <Wifi className="h-4 w-4 text-blue-500" />}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work-orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Órdenes de Trabajo</h3>
            <Dialog open={isWorkOrderDialogOpen} onOpenChange={setIsWorkOrderDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Orden
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Orden de Trabajo</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order_number">Número de Orden *</Label>
                    <Input
                      id="order_number"
                      value={newWorkOrder.order_number}
                      onChange={(e) => setNewWorkOrder({ ...newWorkOrder, order_number: e.target.value })}
                      placeholder="WO-2024-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="work_site">Sitio *</Label>
                    <Select value={newWorkOrder.site_id} onValueChange={(value) => setNewWorkOrder({ ...newWorkOrder, site_id: value })}>
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
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="work_title">Título *</Label>
                    <Input
                      id="work_title"
                      value={newWorkOrder.title}
                      onChange={(e) => setNewWorkOrder({ ...newWorkOrder, title: e.target.value })}
                      placeholder="Instalación de antena 5G"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="work_type">Tipo de Trabajo</Label>
                    <Select value={newWorkOrder.work_type} onValueChange={(value) => setNewWorkOrder({ ...newWorkOrder, work_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="site_survey">Relevamiento</SelectItem>
                        <SelectItem value="civil_work">Obra Civil</SelectItem>
                        <SelectItem value="tower_installation">Instalación Torre</SelectItem>
                        <SelectItem value="antenna_installation">Instalación Antena</SelectItem>
                        <SelectItem value="alignment">Alineación</SelectItem>
                        <SelectItem value="integration">Integración</SelectItem>
                        <SelectItem value="maintenance">Mantenimiento</SelectItem>
                        <SelectItem value="repair">Reparación</SelectItem>
                        <SelectItem value="inspection">Inspección</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="work_priority">Prioridad</Label>
                    <Select value={newWorkOrder.priority} onValueChange={(value) => setNewWorkOrder({ ...newWorkOrder, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="emergency">Emergencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimated_hours">Horas Estimadas</Label>
                    <Input
                      id="estimated_hours"
                      type="number"
                      value={newWorkOrder.estimated_hours}
                      onChange={(e) => setNewWorkOrder({ ...newWorkOrder, estimated_hours: e.target.value })}
                      placeholder="8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_date">Fecha Programada</Label>
                    <Input
                      id="scheduled_date"
                      type="datetime-local"
                      value={newWorkOrder.scheduled_date}
                      onChange={(e) => setNewWorkOrder({ ...newWorkOrder, scheduled_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="work_description">Descripción</Label>
                    <Textarea
                      id="work_description"
                      value={newWorkOrder.description}
                      onChange={(e) => setNewWorkOrder({ ...newWorkOrder, description: e.target.value })}
                      placeholder="Descripción detallada del trabajo a realizar..."
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="materials">Materiales Necesarios (separados por coma)</Label>
                    <Textarea
                      id="materials"
                      value={newWorkOrder.materials_needed}
                      onChange={(e) => setNewWorkOrder({ ...newWorkOrder, materials_needed: e.target.value })}
                      placeholder="Antena 5G, Cables coaxiales, Conectores, Herramientas"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="safety">Requisitos de Seguridad (separados por coma)</Label>
                    <Textarea
                      id="safety"
                      value={newWorkOrder.safety_requirements}
                      onChange={(e) => setNewWorkOrder({ ...newWorkOrder, safety_requirements: e.target.value })}
                      placeholder="Casco, Arnés, Guantes dieléctricos, Detector de gases"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsWorkOrderDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => createWorkOrderMutation.mutate(newWorkOrder)}
                    disabled={createWorkOrderMutation.isPending}
                  >
                    {createWorkOrderMutation.isPending ? 'Creando...' : 'Crear Orden'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              {workOrdersLoading ? (
                <div className="text-center py-4">Cargando órdenes...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Orden</TableHead>
                      <TableHead>Sitio</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Programada</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.title}</div>
                            <div className="text-sm text-muted-foreground">{order.order_number}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{order.sites_enhanced?.name}</div>
                            <div className="text-xs text-muted-foreground">{order.sites_enhanced?.site_code}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getWorkTypeLabel(order.work_type)}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(order.status)} text-white`}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getPriorityColor(order.priority)} text-white`}>
                            {order.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.scheduled_date 
                            ? new Date(order.scheduled_date).toLocaleString()
                            : '-'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents">
          <Card>
            <CardHeader>
              <CardTitle>Incidentes Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incidente</TableHead>
                    <TableHead>Sitio</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Severidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Reportado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{incident.title}</div>
                          <div className="text-sm text-muted-foreground">{incident.incident_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {incident.sites_enhanced?.name || '-'}
                      </TableCell>
                      <TableCell>{incident.incident_type}</TableCell>
                      <TableCell>
                        <Badge className={`${getPriorityColor(incident.severity)} text-white`}>
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={incident.status === 'open' ? 'bg-red-500' : 'bg-green-500'}>
                          {incident.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(incident.occurred_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FieldOperationsManagement;