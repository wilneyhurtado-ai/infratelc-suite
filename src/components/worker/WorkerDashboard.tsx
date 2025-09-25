import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Receipt, 
  ShoppingCart, 
  CheckSquare, 
  DollarSign, 
  Clock,
  FileText,
  Camera,
  MapPin,
  Plus
} from 'lucide-react';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('expenses');
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);

  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    category_id: '',
    site_id: '',
    notes: '',
    document_number: ''
  });

  const [newPurchase, setNewPurchase] = useState({
    description: '',
    estimated_amount: '',
    site_id: '',
    urgency: 'normal' as const,
    supplier: '',
    notes: ''
  });

  // Fetch worker's expenses
  const { data: expenses = [] } = useQuery({
    queryKey: ['worker-expenses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          sites (name),
          expense_categories (name)
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Get user profile for tenant_id
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

  // Fetch sites for selection
  const { data: sites = [] } = useQuery({
    queryKey: ['sites', userProfile?.tenant_id],
    queryFn: async () => {
      if (!userProfile?.tenant_id) return [];
      const { data, error } = await supabase
        .from('sites_enhanced')
        .select('*')
        .eq('tenant_id', userProfile.tenant_id)
        .eq('status', 'operational');
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.tenant_id,
  });

  // Fetch expense categories
  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: typeof newExpense) => {
      const { error } = await supabase
        .from('expenses')
        .insert({
          ...expenseData,
          amount: parseFloat(expenseData.amount),
          expense_date: new Date().toISOString().split('T')[0],
          created_by: user?.id,
          approval_status: 'pending'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Gasto registrado exitosamente' });
      queryClient.invalidateQueries({ queryKey: ['worker-expenses'] });
      setIsExpenseDialogOpen(false);
      setNewExpense({
        amount: '',
        description: '',
        category_id: '',
        site_id: '',
        notes: '',
        document_number: ''
      });
    },
    onError: (error) => {
      toast({
        title: 'Error al registrar gasto',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const handleCreateExpense = () => {
    if (!newExpense.amount || !newExpense.description || !newExpense.category_id) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor complete todos los campos obligatorios',
        variant: 'destructive'
      });
      return;
    }
    createExpenseMutation.mutate(newExpense);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    const labels = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado'
    };
    return (
      <Badge className={`${colors[status as keyof typeof colors]} text-white`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const renderExpensesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Mis Rendiciones de Gastos</h3>
        <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Rendir Gasto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Rendir Nuevo Gasto</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document_number">N° Documento</Label>
                <Input
                  id="document_number"
                  value={newExpense.document_number}
                  onChange={(e) => setNewExpense({ ...newExpense, document_number: e.target.value })}
                  placeholder="Factura/Boleta"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Descripción *</Label>
                <Input
                  id="description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="Descripción del gasto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select value={newExpense.category_id} onValueChange={(value) => setNewExpense({ ...newExpense, category_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="site">Obra/Proyecto</Label>
                <Select value={newExpense.site_id} onValueChange={(value) => setNewExpense({ ...newExpense, site_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar obra" />
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
              <div className="space-y-2 col-span-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  placeholder="Notas adicionales"
                />
              </div>
              <div className="col-span-2">
                <Button variant="outline" className="w-full">
                  <Camera className="mr-2 h-4 w-4" />
                  Adjuntar Foto de Boleta/Factura
                </Button>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsExpenseDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateExpense}
                disabled={createExpenseMutation.isPending}
              >
                {createExpenseMutation.isPending ? 'Guardando...' : 'Rendir Gasto'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Obra</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {new Date(expense.expense_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{expense.description}</div>
                      {expense.document_number && (
                        <div className="text-sm text-muted-foreground">
                          Doc: {expense.document_number}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{expense.expense_categories?.name}</TableCell>
                  <TableCell>{expense.sites?.name || '-'}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(expense.approval_status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gastos Pendientes</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {expenses.filter(e => e.approval_status === 'pending').length}
          </div>
          <p className="text-xs text-muted-foreground">rendiciones por aprobar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Mes</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(expenses
              .filter(e => new Date(e.expense_date).getMonth() === new Date().getMonth())
              .reduce((sum, e) => sum + e.amount, 0)
            )}
          </div>
          <p className="text-xs text-muted-foreground">gastos del mes actual</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mis Órdenes</CardTitle>
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">órdenes asignadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Horas Trabajadas</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">40h</div>
          <p className="text-xs text-muted-foreground">esta semana</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Dashboard</h1>
        <p className="text-muted-foreground">Gestiona tus gastos, órdenes y obligaciones</p>
      </div>

      {renderDashboard()}

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`pb-2 px-1 ${
            activeTab === 'expenses'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Receipt className="inline mr-2 h-4 w-4" />
          Rendiciones
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`pb-2 px-1 ${
            activeTab === 'purchases'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShoppingCart className="inline mr-2 h-4 w-4" />
          Compras
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-2 px-1 ${
            activeTab === 'tasks'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <CheckSquare className="inline mr-2 h-4 w-4" />
          Mis Órdenes
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`pb-2 px-1 ${
            activeTab === 'payroll'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="inline mr-2 h-4 w-4" />
          Liquidación
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'expenses' && renderExpensesTab()}
      
      {activeTab === 'purchases' && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <ShoppingCart className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Solicitudes de Compra</h3>
              <p>Próximamente podrás solicitar compras y materiales</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'tasks' && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <CheckSquare className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Mis Órdenes de Trabajo</h3>
              <p>Aquí verás las órdenes asignadas y checklists</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'payroll' && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Mi Liquidación</h3>
              <p>Descarga tu liquidación de sueldo mensual</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkerDashboard;