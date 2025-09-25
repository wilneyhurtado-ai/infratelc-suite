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
  Building, 
  Users, 
  TrendingUp, 
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Edit,
  Eye
} from 'lucide-react';

const CRMManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isOpportunityDialogOpen, setIsOpportunityDialogOpen] = useState(false);

  const [newClient, setNewClient] = useState({
    name: '',
    rut: '',
    business_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    industry: '',
    notes: ''
  });

  const [newOpportunity, setNewOpportunity] = useState({
    client_id: '',
    name: '',
    description: '',
    value_clp: '',
    probability: 50,
    stage: 'prospecting',
    expected_close_date: ''
  });

  // Fetch clients
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch opportunities
  const { data: opportunities = [], isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          clients (name, contact_person)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (clientData: typeof newClient) => {
      const { error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          tenant_id: 'demo-tenant-id' // In real app, get from user context
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Cliente creado exitosamente' });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsClientDialogOpen(false);
      setNewClient({
        name: '',
        rut: '',
        business_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        region: '',
        industry: '',
        notes: ''
      });
    },
    onError: (error) => {
      toast({
        title: 'Error al crear cliente',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  // Create opportunity mutation
  const createOpportunityMutation = useMutation({
    mutationFn: async (opportunityData: typeof newOpportunity) => {
      const { error } = await supabase
        .from('opportunities')
        .insert({
          ...opportunityData,
          value_clp: parseFloat(opportunityData.value_clp),
          tenant_id: 'demo-tenant-id' // In real app, get from user context
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Oportunidad creada exitosamente' });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      setIsOpportunityDialogOpen(false);
      setNewOpportunity({
        client_id: '',
        name: '',
        description: '',
        value_clp: '',
        probability: 50,
        stage: 'prospecting',
        expected_close_date: ''
      });
    },
    onError: (error) => {
      toast({
        title: 'Error al crear oportunidad',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const getStageColor = (stage: string) => {
    const colors = {
      prospecting: 'bg-blue-500',
      qualification: 'bg-yellow-500',
      proposal: 'bg-orange-500',
      negotiation: 'bg-purple-500',
      closed_won: 'bg-green-500',
      closed_lost: 'bg-red-500'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-500';
  };

  const getStageLabel = (stage: string) => {
    const labels = {
      prospecting: 'Prospectando',
      qualification: 'Calificación',
      proposal: 'Propuesta',
      negotiation: 'Negociación',
      closed_won: 'Ganada',
      closed_lost: 'Perdida'
    };
    return labels[stage as keyof typeof labels] || stage;
  };

  const getTotalPipeline = () => {
    return opportunities
      .filter(opp => !['closed_won', 'closed_lost'].includes(opp.stage))
      .reduce((sum, opp) => sum + (opp.value_clp * opp.probability / 100), 0);
  };

  const getWonDeals = () => {
    return opportunities
      .filter(opp => opp.stage === 'closed_won')
      .reduce((sum, opp) => sum + opp.value_clp, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CRM - Gestión de Clientes</h2>
          <p className="text-muted-foreground">Administra clientes, oportunidades y pipeline de ventas</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              {clients.filter(c => c.status === 'active').length} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opportunities.length}</div>
            <p className="text-xs text-muted-foreground">
              {opportunities.filter(o => !['closed_won', 'closed_lost'].includes(o.stage)).length} activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalPipeline())}</div>
            <p className="text-xs text-muted-foreground">valor ponderado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Negocios Ganados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getWonDeals())}</div>
            <p className="text-xs text-muted-foreground">este período</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Clientes</h3>
            <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Cliente</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      placeholder="Nombre del cliente"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rut">RUT</Label>
                    <Input
                      id="rut"
                      value={newClient.rut}
                      onChange={(e) => setNewClient({ ...newClient, rut: e.target.value })}
                      placeholder="12.345.678-9"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="business_name">Razón Social</Label>
                    <Input
                      id="business_name"
                      value={newClient.business_name}
                      onChange={(e) => setNewClient({ ...newClient, business_name: e.target.value })}
                      placeholder="Razón social de la empresa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_person">Persona de Contacto</Label>
                    <Input
                      id="contact_person"
                      value={newClient.contact_person}
                      onChange={(e) => setNewClient({ ...newClient, contact_person: e.target.value })}
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industria</Label>
                    <Select value={newClient.industry} onValueChange={(value) => setNewClient({ ...newClient, industry: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar industria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="telecomunicaciones">Telecomunicaciones</SelectItem>
                        <SelectItem value="mineria">Minería</SelectItem>
                        <SelectItem value="energia">Energía</SelectItem>
                        <SelectItem value="construccion">Construcción</SelectItem>
                        <SelectItem value="gobierno">Gobierno</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      placeholder="contacto@empresa.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={newClient.address}
                      onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                      placeholder="Dirección completa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={newClient.city}
                      onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                      placeholder="Santiago"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Región</Label>
                    <Input
                      id="region"
                      value={newClient.region}
                      onChange={(e) => setNewClient({ ...newClient, region: e.target.value })}
                      placeholder="Metropolitana"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="notes">Notas</Label>
                    <Textarea
                      id="notes"
                      value={newClient.notes}
                      onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                      placeholder="Notas adicionales sobre el cliente"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsClientDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => createClientMutation.mutate(newClient)}
                    disabled={createClientMutation.isPending}
                  >
                    {createClientMutation.isPending ? 'Creando...' : 'Crear Cliente'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              {clientsLoading ? (
                <div className="text-center py-4">Cargando clientes...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Industria</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{client.name}</div>
                            <div className="text-sm text-muted-foreground">{client.business_name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center text-sm">
                              <Users className="mr-1 h-3 w-3" />
                              {client.contact_person}
                            </div>
                            {client.email && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Mail className="mr-1 h-3 w-3" />
                                {client.email}
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Phone className="mr-1 h-3 w-3" />
                                {client.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{client.industry || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <MapPin className="mr-1 h-3 w-3" />
                            {client.city && client.region ? `${client.city}, ${client.region}` : '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={client.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                            {client.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Oportunidades</h3>
            <Dialog open={isOpportunityDialogOpen} onOpenChange={setIsOpportunityDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Oportunidad
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Oportunidad</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="opp_client">Cliente *</Label>
                    <Select value={newOpportunity.client_id} onValueChange={(value) => setNewOpportunity({ ...newOpportunity, client_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opp_stage">Etapa</Label>
                    <Select value={newOpportunity.stage} onValueChange={(value) => setNewOpportunity({ ...newOpportunity, stage: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospecting">Prospectando</SelectItem>
                        <SelectItem value="qualification">Calificación</SelectItem>
                        <SelectItem value="proposal">Propuesta</SelectItem>
                        <SelectItem value="negotiation">Negociación</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="opp_name">Nombre de la Oportunidad *</Label>
                    <Input
                      id="opp_name"
                      value={newOpportunity.name}
                      onChange={(e) => setNewOpportunity({ ...newOpportunity, name: e.target.value })}
                      placeholder="Instalación Torre 5G - Región Metropolitana"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opp_value">Valor (CLP) *</Label>
                    <Input
                      id="opp_value"
                      type="number"
                      value={newOpportunity.value_clp}
                      onChange={(e) => setNewOpportunity({ ...newOpportunity, value_clp: e.target.value })}
                      placeholder="50000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opp_probability">Probabilidad (%)</Label>
                    <Input
                      id="opp_probability"
                      type="number"
                      min="0"
                      max="100"
                      value={newOpportunity.probability}
                      onChange={(e) => setNewOpportunity({ ...newOpportunity, probability: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opp_close_date">Fecha Estimada de Cierre</Label>
                    <Input
                      id="opp_close_date"
                      type="date"
                      value={newOpportunity.expected_close_date}
                      onChange={(e) => setNewOpportunity({ ...newOpportunity, expected_close_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="opp_description">Descripción</Label>
                    <Textarea
                      id="opp_description"
                      value={newOpportunity.description}
                      onChange={(e) => setNewOpportunity({ ...newOpportunity, description: e.target.value })}
                      placeholder="Detalles del proyecto y requisitos..."
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpportunityDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => createOpportunityMutation.mutate(newOpportunity)}
                    disabled={createOpportunityMutation.isPending}
                  >
                    {createOpportunityMutation.isPending ? 'Creando...' : 'Crear Oportunidad'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              {opportunitiesLoading ? (
                <div className="text-center py-4">Cargando oportunidades...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Oportunidad</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Etapa</TableHead>
                      <TableHead>Probabilidad</TableHead>
                      <TableHead>Fecha de Cierre</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opportunities.map((opportunity) => (
                      <TableRow key={opportunity.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{opportunity.name}</div>
                            <div className="text-sm text-muted-foreground">{opportunity.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{opportunity.clients?.name}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(opportunity.value_clp)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStageColor(opportunity.stage)} text-white`}>
                            {getStageLabel(opportunity.stage)}
                          </Badge>
                        </TableCell>
                        <TableCell>{opportunity.probability}%</TableCell>
                        <TableCell>
                          {opportunity.expected_close_date 
                            ? new Date(opportunity.expected_close_date).toLocaleDateString()
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CRMManagement;