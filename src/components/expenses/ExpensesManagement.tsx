import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Edit, Trash2, Calendar, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Expense {
  id: string;
  site_id: string;
  category_id: string;
  description: string;
  amount: number;
  expense_date: string;
  document_number?: string;
  notes?: string;
  sites?: { name: string };
  expense_categories?: { name: string; type: string };
}

interface Site {
  id: string;
  name: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
  type: string;
}

const ExpensesManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [newExpense, setNewExpense] = useState({
    site_id: '',
    category_id: '',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    document_number: '',
    notes: ''
  });

  // Fetch expenses
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', selectedSite],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select(`
          *,
          sites (name),
          expense_categories (name, type)
        `)
        .order('expense_date', { ascending: false });
      
      if (selectedSite) {
        query = query.eq('site_id', selectedSite);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Expense[];
    }
  });

  // Fetch sites for dropdown
  const { data: sites = [] } = useQuery({
    queryKey: ['sites-for-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data as Site[];
    }
  });

  // Fetch expense categories
  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('type', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as ExpenseCategory[];
    }
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          site_id: expenseData.site_id,
          category_id: expenseData.category_id,
          description: expenseData.description,
          amount: parseFloat(expenseData.amount),
          expense_date: expenseData.expense_date,
          document_number: expenseData.document_number || null,
          notes: expenseData.notes || null
        }])
        .select();
      
      if (error) throw error;
      
      // Update site spent amount
      try {
        await supabase.rpc('update_site_spent', {
          site_id: expenseData.site_id
        });
      } catch (updateError) {
        console.warn('Error updating site spent:', updateError);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setIsAddDialogOpen(false);
      setNewExpense({
        site_id: '',
        category_id: '',
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        document_number: '',
        notes: ''
      });
      toast({
        title: "Gasto registrado",
        description: "El gasto se ha registrado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al registrar gasto: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast({
        title: "Gasto eliminado",
        description: "El gasto se ha eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al eliminar gasto: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.site_id || !newExpense.category_id || !newExpense.description || !newExpense.amount) {
      toast({
        title: "Error de validación",
        description: "Todos los campos marcados son requeridos.",
        variant: "destructive"
      });
      return;
    }
    createExpenseMutation.mutate(newExpense);
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      deleteExpenseMutation.mutate(expenseId);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'Personal':
        return 'bg-blue-100 text-blue-800';
      case 'Operacional':
        return 'bg-green-100 text-green-800';
      case 'Materiales':
        return 'bg-orange-100 text-orange-800';
      case 'Ingresos':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Gestión de Gastos</h2>
          <p className="text-muted-foreground">Cargando gastos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Gestión de Gastos</h2>
          <p className="text-muted-foreground">
            Control y seguimiento de gastos por sitio
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Gasto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site_id">Sitio *</Label>
                <Select value={newExpense.site_id} onValueChange={(value) => setNewExpense(prev => ({ ...prev, site_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sitio" />
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
                <Label htmlFor="category_id">Categoría *</Label>
                <Select value={newExpense.category_id} onValueChange={(value) => setNewExpense(prev => ({ ...prev, category_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({category.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Input
                  id="description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del gasto"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Monto (CLP) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="50000"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expense_date">Fecha</Label>
                <Input
                  id="expense_date"
                  type="date"
                  value={newExpense.expense_date}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, expense_date: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="document_number">Número de Documento</Label>
                <Input
                  id="document_number"
                  value={newExpense.document_number}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, document_number: e.target.value }))}
                  placeholder="Factura #12345"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notas adicionales"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={createExpenseMutation.isPending}>
                  {createExpenseMutation.isPending ? 'Registrando...' : 'Registrar Gasto'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Label htmlFor="site-filter">Filtrar por Sitio</Label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los sitios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los sitios</SelectItem>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              Total: <span className="font-bold text-foreground">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{expense.description}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{expense.sites?.name}</span>
                        <span>•</span>
                        <Badge className={getCategoryColor(expense.expense_categories?.type || '')}>
                          {expense.expense_categories?.name}
                        </Badge>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(expense.expense_date).toLocaleDateString('es-CL')}
                        </div>
                      </div>
                      {expense.document_number && (
                        <p className="text-xs text-muted-foreground">Doc: {expense.document_number}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{formatCurrency(expense.amount)}</p>
                      {expense.notes && (
                        <p className="text-xs text-muted-foreground max-w-40 truncate">
                          {expense.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteExpense(expense.id)}
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
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No hay gastos registrados</h3>
              <p className="text-muted-foreground mb-4">
                {selectedSite ? 'No hay gastos para el sitio seleccionado' : 'Comienza registrando tu primer gasto'}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Primer Gasto
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesManagement;