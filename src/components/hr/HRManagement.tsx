import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Edit, Trash2, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Personnel {
  id: string;
  full_name: string;
  position: string;
  site_id?: string;
  salary?: number;
  hire_date?: string;
  status: string;
  email?: string;
  phone?: string;
  sites?: { name: string };
}

interface Site {
  id: string;
  name: string;
}

const HRManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile to get tenant_id
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [newPersonnel, setNewPersonnel] = useState({
    full_name: '',
    position: '',
    site_id: '',
    salary: '',
    email: '',
    phone: '',
    status: 'Activo'
  });

  // Fetch personnel
  const { data: personnel = [], isLoading } = useQuery({
    queryKey: ['personnel', userProfile?.tenant_id],
    queryFn: async () => {
      if (!userProfile?.tenant_id) return [];
      const { data, error } = await supabase
        .from('personnel')
        .select(`
          *,
          sites_enhanced!sites_enhanced_id_fkey (
            name
          )
        `)
        .eq('tenant_id', userProfile.tenant_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Personnel[];
    },
    enabled: !!userProfile?.tenant_id,
  });

  // Fetch sites for dropdown
  const { data: sites = [] } = useQuery({
    queryKey: ['sites-for-personnel', userProfile?.tenant_id],
    queryFn: async () => {
      if (!userProfile?.tenant_id) return [];
      const { data, error } = await supabase
        .from('sites_enhanced')
        .select('id, name')
        .eq('tenant_id', userProfile.tenant_id)
        .order('name');
      
      if (error) throw error;
      return data as Site[];
    },
    enabled: !!userProfile?.tenant_id,
  });

  // Create personnel mutation
  const createPersonnelMutation = useMutation({
    mutationFn: async (personnelData: any) => {
      if (!userProfile?.tenant_id) throw new Error('No tenant found');
      const { data, error } = await supabase
        .from('personnel')
        .insert([{
          full_name: personnelData.full_name,
          position: personnelData.position,
          site_id: personnelData.site_id || null,
          salary: personnelData.salary ? parseFloat(personnelData.salary) : null,
          email: personnelData.email || null,
          phone: personnelData.phone || null,
          status: personnelData.status,
          tenant_id: userProfile.tenant_id,
          hire_date: new Date().toISOString().split('T')[0]
        }])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel', userProfile?.tenant_id] });
      setIsAddDialogOpen(false);
      setNewPersonnel({
        full_name: '',
        position: '',
        site_id: '',
        salary: '',
        email: '',
        phone: '',
        status: 'Activo'
      });
      toast({
        title: "Personal registrado",
        description: "El empleado se ha registrado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al registrar personal: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Update personnel mutation
  const updatePersonnelMutation = useMutation({
    mutationFn: async ({ id, ...personnelData }: any) => {
      const { data, error } = await supabase
        .from('personnel')
        .update({
          full_name: personnelData.full_name,
          position: personnelData.position,
          site_id: personnelData.site_id || null,
          salary: personnelData.salary ? parseFloat(personnelData.salary.toString()) : null,
          email: personnelData.email || null,
          phone: personnelData.phone || null,
          status: personnelData.status
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel', userProfile?.tenant_id] });
      setIsEditDialogOpen(false);
      setEditingPersonnel(null);
      toast({
        title: "Personal actualizado",
        description: "Los datos del empleado se han actualizado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar personal: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete personnel mutation
  const deletePersonnelMutation = useMutation({
    mutationFn: async (personnelId: string) => {
      const { error } = await supabase
        .from('personnel')
        .delete()
        .eq('id', personnelId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel', userProfile?.tenant_id] });
      toast({
        title: "Personal eliminado",
        description: "El empleado se ha eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al eliminar personal: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleCreatePersonnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonnel.full_name || !newPersonnel.position) {
      toast({
        title: "Error de validación",
        description: "Nombre y cargo son requeridos.",
        variant: "destructive"
      });
      return;
    }
    createPersonnelMutation.mutate(newPersonnel);
  };

  const handleEditPersonnel = (person: Personnel) => {
    setEditingPersonnel({
      ...person,
      salary: person.salary || 0,
      site_id: person.site_id || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePersonnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPersonnel) return;
    updatePersonnelMutation.mutate(editingPersonnel);
  };

  const handleDeletePersonnel = (personnelId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      deletePersonnelMutation.mutate(personnelId);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No especificado';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo':
        return 'bg-success/20 text-success';
      case 'Inactivo':
        return 'bg-destructive/20 text-destructive';
      case 'Vacaciones':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Gestión de RRHH</h2>
          <p className="text-muted-foreground">Cargando personal...</p>
        </div>
      </div>
    );
  }

  // Group personnel by status
  const activePersonnel = personnel.filter(p => p.status === 'Activo');
  const inactivePersonnel = personnel.filter(p => p.status === 'Inactivo');
  const onVacation = personnel.filter(p => p.status === 'Vacaciones');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Gestión de RRHH</h2>
          <p className="text-muted-foreground">
            Administra el personal y recursos humanos
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Empleado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Empleado</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePersonnel} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input
                  id="full_name"
                  value={newPersonnel.full_name}
                  onChange={(e) => setNewPersonnel(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  value={newPersonnel.position}
                  onChange={(e) => setNewPersonnel(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Ingeniero Civil"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_id">Sitio Asignado</Label>
                <Select value={newPersonnel.site_id} onValueChange={(value) => setNewPersonnel(prev => ({ ...prev, site_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sitio (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salary">Salario (CLP)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={newPersonnel.salary}
                  onChange={(e) => setNewPersonnel(prev => ({ ...prev, salary: e.target.value }))}
                  placeholder="800000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPersonnel.email}
                  onChange={(e) => setNewPersonnel(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="juan@infratelc.cl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={newPersonnel.phone}
                  onChange={(e) => setNewPersonnel(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+56 9 1234 5678"
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={createPersonnelMutation.isPending}>
                  {createPersonnelMutation.isPending ? 'Registrando...' : 'Registrar'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Personnel Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Empleado</DialogTitle>
            </DialogHeader>
            {editingPersonnel && (
              <form onSubmit={handleUpdatePersonnel} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-full_name">Nombre Completo</Label>
                  <Input
                    id="edit-full_name"
                    value={editingPersonnel.full_name}
                    onChange={(e) => setEditingPersonnel(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-position">Cargo</Label>
                  <Input
                    id="edit-position"
                    value={editingPersonnel.position}
                    onChange={(e) => setEditingPersonnel(prev => prev ? { ...prev, position: e.target.value } : null)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-site_id">Sitio Asignado</Label>
                  <Select 
                    value={editingPersonnel.site_id || ''} 
                    onValueChange={(value) => setEditingPersonnel(prev => prev ? { ...prev, site_id: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar sitio (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Sin asignar</SelectItem>
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-salary">Salario (CLP)</Label>
                  <Input
                    id="edit-salary"
                    type="number"
                    value={editingPersonnel.salary}
                    onChange={(e) => setEditingPersonnel(prev => prev ? { ...prev, salary: parseFloat(e.target.value) || 0 } : null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select 
                    value={editingPersonnel.status} 
                    onValueChange={(value) => setEditingPersonnel(prev => prev ? { ...prev, status: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
                      <SelectItem value="Vacaciones">Vacaciones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingPersonnel.email || ''}
                    onChange={(e) => setEditingPersonnel(prev => prev ? { ...prev, email: e.target.value } : null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Teléfono</Label>
                  <Input
                    id="edit-phone"
                    value={editingPersonnel.phone || ''}
                    onChange={(e) => setEditingPersonnel(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={updatePersonnelMutation.isPending}>
                    {updatePersonnelMutation.isPending ? 'Actualizando...' : 'Actualizar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-success" />
              Personal Activo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success mb-1">{activePersonnel.length}</div>
            <p className="text-sm text-muted-foreground">Empleados trabajando</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-warning" />
              En Vacaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning mb-1">{onVacation.length}</div>
            <p className="text-sm text-muted-foreground">Empleados de vacaciones</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{personnel.length}</div>
            <p className="text-sm text-muted-foreground">Total empleados</p>
          </CardContent>
        </Card>
      </div>

      {/* Personnel List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Personal</CardTitle>
        </CardHeader>
        <CardContent>
          {personnel.length > 0 ? (
            <div className="space-y-4">
              {personnel.map((person) => (
                <div key={person.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{person.full_name}</h4>
                      <p className="text-sm text-muted-foreground">{person.position}</p>
                      {person.sites && (
                        <p className="text-xs text-muted-foreground">Sitio: {person.sites.name}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(person.salary)}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {person.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span>{person.email}</span>
                          </div>
                        )}
                        {person.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{person.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Badge className={getStatusColor(person.status)}>
                      {person.status}
                    </Badge>
                    
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditPersonnel(person)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeletePersonnel(person.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No hay personal registrado</h3>
              <p className="text-muted-foreground mb-4">
                Comienza registrando tu primer empleado
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Primer Empleado
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HRManagement;