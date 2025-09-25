import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Site {
  id: string;
  name: string;
  budget: number;
  spent: number;
  status: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

const SitesManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [selectedSiteForExpenses, setSelectedSiteForExpenses] = useState<Site | null>(null);
  const [newSite, setNewSite] = useState({
    name: '',
    budget: '',
    description: '',
    status: 'Planificado'
  });

  // Fetch sites
  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Site[];
    }
  });

  // Create site mutation
  const createSiteMutation = useMutation({
    mutationFn: async (siteData: any) => {
      const { data, error } = await supabase
        .from('sites')
        .insert([{
          name: siteData.name,
          budget: parseFloat(siteData.budget),
          description: siteData.description,
          status: siteData.status
        }])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setIsAddDialogOpen(false);
      setNewSite({ name: '', budget: '', description: '', status: 'Planificado' });
      toast({
        title: "Sitio creado",
        description: "El sitio se ha creado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al crear el sitio: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Update site mutation
  const updateSiteMutation = useMutation({
    mutationFn: async ({ id, ...siteData }: any) => {
      const { data, error } = await supabase
        .from('sites')
        .update({
          name: siteData.name,
          budget: parseFloat(siteData.budget),
          description: siteData.description,
          status: siteData.status
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setIsEditDialogOpen(false);
      setEditingSite(null);
      toast({
        title: "Sitio actualizado",
        description: "El sitio se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar el sitio: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete site mutation
  const deleteSiteMutation = useMutation({
    mutationFn: async (siteId: string) => {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', siteId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast({
        title: "Sitio eliminado",
        description: "El sitio se ha eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al eliminar el sitio: ${error.message}`,
        variant: "destructive"
      });
    }
  });
    e.preventDefault();
    if (!newSite.name || !newSite.budget) {
      toast({
        title: "Error de validación",
        description: "Nombre y presupuesto son requeridos.",
        variant: "destructive"
      });
      return;
    }
    createSiteMutation.mutate(newSite);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En progreso':
        return 'bg-warning/20 text-warning';
      case 'Completado':
        return 'bg-success/20 text-success';
      case 'Suspendido':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const calculateEfficiency = (budget: number, spent: number) => {
    if (budget === 0) return 100;
    return ((budget - spent) / budget) * 100;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Gestión de Sitios</h2>
          <p className="text-muted-foreground">Cargando sitios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Gestión de Sitios</h2>
          <p className="text-muted-foreground">
            Administra los proyectos y sitios de construcción
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Sitio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Sitio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Sitio</Label>
                <Input
                  id="name"
                  value={newSite.name}
                  onChange={(e) => setNewSite(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Proyecto Norte"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="budget">Presupuesto (CLP)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={newSite.budget}
                  onChange={(e) => setNewSite(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="15000000"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={newSite.status} onValueChange={(value) => setNewSite(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planificado">Planificado</SelectItem>
                    <SelectItem value="En progreso">En progreso</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                    <SelectItem value="Suspendido">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newSite.description}
                  onChange={(e) => setNewSite(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del proyecto"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={createSiteMutation.isPending}>
                  {createSiteMutation.isPending ? 'Creando...' : 'Crear Sitio'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Site Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Sitio</DialogTitle>
            </DialogHeader>
            {editingSite && (
              <form onSubmit={handleUpdateSite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nombre del Sitio</Label>
                  <Input
                    id="edit-name"
                    value={editingSite.name}
                    onChange={(e) => setEditingSite(prev => prev ? { ...prev, name: e.target.value } : null)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-budget">Presupuesto (CLP)</Label>
                  <Input
                    id="edit-budget"
                    type="number"
                    value={editingSite.budget}
                    onChange={(e) => setEditingSite(prev => prev ? { ...prev, budget: parseFloat(e.target.value) } : null)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select value={editingSite.status} onValueChange={(value) => setEditingSite(prev => prev ? { ...prev, status: value } : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planificado">Planificado</SelectItem>
                      <SelectItem value="En progreso">En progreso</SelectItem>
                      <SelectItem value="Completado">Completado</SelectItem>
                      <SelectItem value="Suspendido">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descripción</Label>
                  <Textarea
                    id="edit-description"
                    value={editingSite.description || ''}
                    onChange={(e) => setEditingSite(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={updateSiteMutation.isPending}>
                    {updateSiteMutation.isPending ? 'Actualizando...' : 'Actualizar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Expenses Dialog */}
        {selectedSiteForExpenses && (
          <Dialog open={!!selectedSiteForExpenses} onOpenChange={() => setSelectedSiteForExpenses(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Gastos de {selectedSiteForExpenses.name}</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <p className="text-muted-foreground">
                  Funcionalidad de gastos por sitio - Se implementará en la sección de Gastos
                </p>
                <Button 
                  onClick={() => {
                    setSelectedSiteForExpenses(null);
                    // Aquí podrías navegar a la pestaña de gastos con el sitio seleccionado
                  }}
                  className="mt-4"
                >
                  Ir a Gestión de Gastos
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => {
          const efficiency = calculateEfficiency(site.budget, site.spent);
          
          return (
            <Card key={site.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{site.name}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(site.status)}>
                    {site.status}
                  </Badge>
                </div>
                {site.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {site.description}
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Presupuesto:</span>
                    <span className="font-medium">{formatCurrency(site.budget)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gastado:</span>
                    <span className="font-medium">{formatCurrency(site.spent)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Disponible:</span>
                    <span className={`font-medium ${efficiency > 80 ? 'text-success' : efficiency > 60 ? 'text-warning' : 'text-destructive'}`}>
                      {formatCurrency(site.budget - site.spent)} ({efficiency.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progreso del presupuesto</span>
                    <span>{((site.spent / site.budget) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        (site.spent / site.budget) < 0.7 ? 'bg-success' : 
                        (site.spent / site.budget) < 0.9 ? 'bg-warning' : 'bg-destructive'
                      }`}
                      style={{ width: `${Math.min((site.spent / site.budget) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleEditSite(site)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedSiteForExpenses(site)}
                  >
                    Ver Gastos
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleDeleteSite(site.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sites.length === 0 && (
        <Card className="p-8 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No hay sitios registrados</h3>
          <p className="text-muted-foreground mb-4">
            Comienza creando tu primer sitio de construcción
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Primer Sitio
          </Button>
        </Card>
      )}
    </div>
  );
};

export default SitesManagement;