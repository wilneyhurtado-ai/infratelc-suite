import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import jsPDF from 'jspdf';
import { 
  Plus, 
  Calculator, 
  DollarSign, 
  FileText, 
  Download,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const PayrollManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isRatesDialogOpen, setIsRatesDialogOpen] = useState(false);
  const [isRunDialogOpen, setIsRunDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const [newRates, setNewRates] = useState({
    period: new Date().toISOString().slice(0, 7),
    minimum_wage: '500000',
    uf_value: '37000',
    utm_value: '65000',
    afp_worker_rate: '0.1027',
    fonasa_rate: '0.07',
    afc_worker_indefinite: '0.006',
    afc_worker_fixed_term: '0.008',
    afc_employer_indefinite: '0.024',
    afc_employer_fixed_term: '0.03',
    accident_rate: '0.0095',
    gratification_rate: '0.25',
    family_allowance_amount: '15000',
    afp_taxable_cap: '85.1',
    health_taxable_cap: '85.1',
    gratification_cap: '4.75'
  });

  // Get current user profile with tenant
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*, tenants(*)')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch payroll rates
  const { data: rates = [], isLoading: ratesLoading } = useQuery({
    queryKey: ['payroll-rates', profile?.tenant_id],
    queryFn: async () => {
      if (!profile?.tenant_id) return [];
      const { data, error } = await supabase
        .from('payroll_rates')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('period', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id,
  });

  // Fetch payroll runs
  const { data: payrollRuns = [], isLoading: runsLoading } = useQuery({
    queryKey: ['payroll-runs', profile?.tenant_id],
    queryFn: async () => {
      if (!profile?.tenant_id) return [];
      const { data, error } = await supabase
        .from('payroll_runs')
        .select('*, payroll_items(*)')
        .eq('tenant_id', profile.tenant_id)
        .order('period', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id,
  });

  // Fetch employees for payroll
  const { data: employees = [] } = useQuery({
    queryKey: ['payroll-employees', profile?.tenant_id],
    queryFn: async () => {
      if (!profile?.tenant_id) return [];
      const { data, error } = await supabase
        .from('personnel')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .eq('status', 'Activo');
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id,
  });

  // Create rates mutation
  const createRatesMutation = useMutation({
    mutationFn: async (ratesData: typeof newRates) => {
      if (!profile?.tenant_id) throw new Error('No se pudo obtener la información del tenant');
      
      const { error } = await supabase
        .from('payroll_rates')
        .insert({
          ...ratesData,
          minimum_wage: parseFloat(ratesData.minimum_wage),
          uf_value: parseFloat(ratesData.uf_value),
          utm_value: parseFloat(ratesData.utm_value),
          afp_worker_rate: parseFloat(ratesData.afp_worker_rate),
          fonasa_rate: parseFloat(ratesData.fonasa_rate),
          afc_worker_indefinite: parseFloat(ratesData.afc_worker_indefinite),
          afc_worker_fixed_term: parseFloat(ratesData.afc_worker_fixed_term),
          afc_employer_indefinite: parseFloat(ratesData.afc_employer_indefinite),
          afc_employer_fixed_term: parseFloat(ratesData.afc_employer_fixed_term),
          accident_rate: parseFloat(ratesData.accident_rate),
          gratification_rate: parseFloat(ratesData.gratification_rate),
          family_allowance_amount: parseFloat(ratesData.family_allowance_amount),
          afp_taxable_cap: parseFloat(ratesData.afp_taxable_cap),
          health_taxable_cap: parseFloat(ratesData.health_taxable_cap),
          gratification_cap: parseFloat(ratesData.gratification_cap),
          tenant_id: profile.tenant_id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Tasas actualizadas exitosamente' });
      queryClient.invalidateQueries({ queryKey: ['payroll-rates'] });
      setIsRatesDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error al actualizar tasas',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  // Create payroll run mutation
  const createPayrollRunMutation = useMutation({
    mutationFn: async (period: string) => {
      if (!profile?.tenant_id) throw new Error('No se pudo obtener la información del tenant');
      
      const currentRates = rates.find(r => r.period === period);
      if (!currentRates) {
        throw new Error('No hay tasas configuradas para este período');
      }

      const { error } = await supabase
        .from('payroll_runs')
        .insert({
          period,
          rates_id: currentRates.id,
          total_employees: employees.length,
          tenant_id: profile.tenant_id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Nómina iniciada exitosamente' });
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      setIsRunDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error al iniciar nómina',
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

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-500',
      calculated: 'bg-blue-500',
      approved: 'bg-green-500',
      paid: 'bg-purple-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Borrador',
      calculated: 'Calculada',
      approved: 'Aprobada',
      paid: 'Pagada'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getCurrentRates = () => {
    return rates.find(r => r.period === selectedPeriod);
  };

  const canCalculatePayroll = () => {
    const currentRates = getCurrentRates();
    return currentRates && employees.length > 0;
  };

  // Generate pay slip PDF
  const generatePaySlipPDF = async (runId: string, employeeId?: string) => {
    try {
      const { data: payrollItems, error } = await supabase
        .from('payroll_items')
        .select('*')
        .eq('payroll_run_id', runId)
        .eq(employeeId ? 'employee_id' : 'id', employeeId || runId);

      if (error) throw error;
      if (!payrollItems || payrollItems.length === 0) {
        toast({
          title: "Sin datos",
          description: "No se encontraron liquidaciones para este período",
          variant: "destructive"
        });
        return;
      }

      const doc = new jsPDF();
      
      // Generate liquidation for each employee
      payrollItems.forEach((item, index) => {
        if (index > 0) doc.addPage();
        
        // Header
        doc.setFontSize(18);
        doc.text('LIQUIDACIÓN DE SUELDO', 20, 20);
        doc.setFontSize(12);
        doc.text(`Período: ${item.payroll_run_id}`, 20, 35);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 140, 35);
        
        // Employee info
        doc.setFontSize(14);
        doc.text('DATOS DEL TRABAJADOR', 20, 55);
        doc.setFontSize(10);
        doc.text(`Nombre: ${item.employee_name}`, 20, 70);
        doc.text(`RUT: ${item.employee_rut || 'No especificado'}`, 20, 80);
        doc.text(`Cargo: ${item.position || 'No especificado'}`, 20, 90);
        
        // Earnings
        doc.setFontSize(14);
        doc.text('HABERES', 20, 110);
        doc.setFontSize(10);
        let yPos = 125;
        doc.text(`Sueldo Base: $${item.base_salary?.toLocaleString('es-CL') || '0'}`, 20, yPos);
        yPos += 10;
        if (item.overtime_amount > 0) {
          doc.text(`Horas Extra: $${item.overtime_amount.toLocaleString('es-CL')}`, 20, yPos);
          yPos += 10;
        }
        doc.text(`Total Haberes: $${item.gross_taxable?.toLocaleString('es-CL') || '0'}`, 20, yPos);
        
        // Deductions
        yPos += 20;
        doc.setFontSize(14);
        doc.text('DESCUENTOS', 20, yPos);
        doc.setFontSize(10);
        yPos += 15;
        doc.text(`AFP: $${item.afp_deduction?.toLocaleString('es-CL') || '0'}`, 20, yPos);
        yPos += 10;
        doc.text(`Salud: $${item.health_deduction?.toLocaleString('es-CL') || '0'}`, 20, yPos);
        yPos += 10;
        doc.text(`Impuestos: $${item.tax_deduction?.toLocaleString('es-CL') || '0'}`, 20, yPos);
        yPos += 10;
        doc.text(`AFC: $${item.afc_deduction?.toLocaleString('es-CL') || '0'}`, 20, yPos);
        
        // Net pay
        yPos += 20;
        doc.setFontSize(14);
        doc.text(`LÍQUIDO A PAGAR: $${item.net_pay?.toLocaleString('es-CL') || '0'}`, 20, yPos);
      });

      // Download PDF
      const fileName = employeeId 
        ? `liquidacion-${payrollItems[0].employee_name.replace(/\s+/g, '_')}-${runId}.pdf`
        : `liquidaciones-${runId}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Liquidación descargada",
        description: `Se ha generado la liquidación exitosamente`
      });
    } catch (error) {
      console.error('Error generating pay slip:', error);
      toast({
        title: "Error",
        description: "No se pudo generar la liquidación",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sistema de Remuneraciones</h2>
          <p className="text-muted-foreground">Gestión de nóminas y liquidaciones de sueldo - Chile</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">en nómina</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nóminas Este Año</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payrollRuns.filter(r => r.period.startsWith(new Date().getFullYear().toString())).length}
            </div>
            <p className="text-xs text-muted-foreground">procesadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salario Mínimo</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getCurrentRates() ? formatCurrency(getCurrentRates()!.minimum_wage) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">período {selectedPeriod}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor UF</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getCurrentRates() ? formatCurrency(getCurrentRates()!.uf_value) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">actualizado</p>
          </CardContent>
        </Card>
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Período de Trabajo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <Input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <div className="flex items-center space-x-2">
                {getCurrentRates() ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Tasas configuradas
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    Tasas no configuradas
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="rates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rates">Tasas y Parámetros</TabsTrigger>
          <TabsTrigger value="payroll">Nóminas</TabsTrigger>
          <TabsTrigger value="liquidations">Liquidaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tasas Previsionales y Parámetros</h3>
            <Dialog open={isRatesDialogOpen} onOpenChange={setIsRatesDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Actualizar Tasas
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Actualizar Tasas Mensuales - Chile</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="period">Período *</Label>
                    <Input
                      id="period"
                      type="month"
                      value={newRates.period}
                      onChange={(e) => setNewRates({ ...newRates, period: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimum_wage">Salario Mínimo (CLP)</Label>
                    <Input
                      id="minimum_wage"
                      type="number"
                      value={newRates.minimum_wage}
                      onChange={(e) => setNewRates({ ...newRates, minimum_wage: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uf_value">Valor UF (CLP)</Label>
                    <Input
                      id="uf_value"
                      type="number"
                      value={newRates.uf_value}
                      onChange={(e) => setNewRates({ ...newRates, uf_value: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="utm_value">Valor UTM (CLP)</Label>
                    <Input
                      id="utm_value"
                      type="number"
                      value={newRates.utm_value}
                      onChange={(e) => setNewRates({ ...newRates, utm_value: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="afp_worker">AFP Trabajador (%)</Label>
                    <Input
                      id="afp_worker"
                      type="number"
                      step="0.0001"
                      value={newRates.afp_worker_rate}
                      onChange={(e) => setNewRates({ ...newRates, afp_worker_rate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fonasa">Fonasa (%)</Label>
                    <Input
                      id="fonasa"
                      type="number"
                      step="0.0001"
                      value={newRates.fonasa_rate}
                      onChange={(e) => setNewRates({ ...newRates, fonasa_rate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="afc_worker_indefinite">AFC Trabajador Indefinido (%)</Label>
                    <Input
                      id="afc_worker_indefinite"
                      type="number"
                      step="0.0001"
                      value={newRates.afc_worker_indefinite}
                      onChange={(e) => setNewRates({ ...newRates, afc_worker_indefinite: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="afc_worker_fixed">AFC Trabajador Plazo Fijo (%)</Label>
                    <Input
                      id="afc_worker_fixed"
                      type="number"
                      step="0.0001"
                      value={newRates.afc_worker_fixed_term}
                      onChange={(e) => setNewRates({ ...newRates, afc_worker_fixed_term: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accident_rate">Seguro Accidentes (%)</Label>
                    <Input
                      id="accident_rate"
                      type="number"
                      step="0.0001"
                      value={newRates.accident_rate}
                      onChange={(e) => setNewRates({ ...newRates, accident_rate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gratification">Gratificación Legal (%)</Label>
                    <Input
                      id="gratification"
                      type="number"
                      step="0.01"
                      value={newRates.gratification_rate}
                      onChange={(e) => setNewRates({ ...newRates, gratification_rate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="family_allowance">Asignación Familiar (CLP)</Label>
                    <Input
                      id="family_allowance"
                      type="number"
                      value={newRates.family_allowance_amount}
                      onChange={(e) => setNewRates({ ...newRates, family_allowance_amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="afp_cap">Tope AFP (UF)</Label>
                    <Input
                      id="afp_cap"
                      type="number"
                      step="0.1"
                      value={newRates.afp_taxable_cap}
                      onChange={(e) => setNewRates({ ...newRates, afp_taxable_cap: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsRatesDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => createRatesMutation.mutate(newRates)}
                    disabled={createRatesMutation.isPending}
                  >
                    {createRatesMutation.isPending ? 'Guardando...' : 'Guardar Tasas'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              {ratesLoading ? (
                <div className="text-center py-4">Cargando tasas...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período</TableHead>
                      <TableHead>Salario Mínimo</TableHead>
                      <TableHead>UF / UTM</TableHead>
                      <TableHead>AFP Trabajador</TableHead>
                      <TableHead>Fonasa</TableHead>
                      <TableHead>AFC</TableHead>
                      <TableHead>Accidentes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rates.map((rate) => (
                      <TableRow key={rate.id}>
                        <TableCell className="font-medium">{rate.period}</TableCell>
                        <TableCell>{formatCurrency(rate.minimum_wage)}</TableCell>
                        <TableCell>
                          <div>
                            <div>UF: {formatCurrency(rate.uf_value)}</div>
                            <div className="text-sm text-muted-foreground">UTM: {formatCurrency(rate.utm_value)}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatPercentage(rate.afp_worker_rate)}</TableCell>
                        <TableCell>{formatPercentage(rate.fonasa_rate)}</TableCell>
                        <TableCell>
                          <div>
                            <div>{formatPercentage(rate.afc_worker_indefinite)} (Indef.)</div>
                            <div className="text-sm text-muted-foreground">{formatPercentage(rate.afc_worker_fixed_term)} (P.Fijo)</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatPercentage(rate.accident_rate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Cálculo de Nóminas</h3>
            <Dialog open={isRunDialogOpen} onOpenChange={setIsRunDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={!canCalculatePayroll()}>
                  <Calculator className="mr-2 h-4 w-4" />
                  Nueva Nómina
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Iniciar Cálculo de Nómina</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Período seleccionado: {selectedPeriod}</Label>
                    <p className="text-sm text-muted-foreground">
                      Se procesarán {employees.length} empleados activos
                    </p>
                  </div>
                  {getCurrentRates() ? (
                    <div className="space-y-2">
                      <h4 className="font-medium">Tasas a aplicar:</h4>
                      <div className="text-sm space-y-1">
                        <div>• Salario mínimo: {formatCurrency(getCurrentRates()!.minimum_wage)}</div>
                        <div>• AFP: {formatPercentage(getCurrentRates()!.afp_worker_rate)}</div>
                        <div>• Fonasa: {formatPercentage(getCurrentRates()!.fonasa_rate)}</div>
                        <div>• UF: {formatCurrency(getCurrentRates()!.uf_value)}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-600">
                      No hay tasas configuradas para este período
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsRunDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => createPayrollRunMutation.mutate(selectedPeriod)}
                    disabled={createPayrollRunMutation.isPending || !getCurrentRates()}
                  >
                    {createPayrollRunMutation.isPending ? 'Iniciando...' : 'Iniciar Cálculo'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              {runsLoading ? (
                <div className="text-center py-4">Cargando nóminas...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período</TableHead>
                      <TableHead>Empleados</TableHead>
                      <TableHead>Total Bruto</TableHead>
                      <TableHead>Total Descuentos</TableHead>
                      <TableHead>Total Líquido</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollRuns.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell className="font-medium">{run.period}</TableCell>
                        <TableCell>{run.total_employees}</TableCell>
                        <TableCell>{formatCurrency(run.total_gross_pay)}</TableCell>
                        <TableCell>{formatCurrency(run.total_deductions)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(run.total_net_pay)}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(run.status)} text-white`}>
                            {getStatusLabel(run.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => generatePaySlipPDF(run.id)}
                              title="Descargar todas las liquidaciones"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => generatePaySlipPDF(run.id)}
                              title="Descargar liquidaciones"
                            >
                              <Download className="h-4 w-4" />
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

        <TabsContent value="liquidations">
          <Card>
            <CardHeader>
              <CardTitle>Liquidaciones de Sueldo</CardTitle>
            </CardHeader>
            <CardContent>
              {payrollRuns.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Períodos Disponibles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {payrollRuns.map((run) => (
                      <Card key={run.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">{run.period}</h4>
                              <p className="text-sm text-muted-foreground">
                                {run.total_employees} empleados
                              </p>
                            </div>
                            <Badge className={`${getStatusColor(run.status)} text-white`}>
                              {getStatusLabel(run.status)}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total Bruto:</span>
                              <span className="font-medium">{formatCurrency(run.total_gross_pay)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Líquido:</span>
                              <span className="font-medium">{formatCurrency(run.total_net_pay)}</span>
                            </div>
                          </div>
                          <div className="mt-4 flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => generatePaySlipPDF(run.id)}
                              disabled={run.status === 'draft'}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Descargar Todas
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Liquidaciones Generadas</h3>
                  <p>Las liquidaciones aparecerán aquí una vez procesadas las nóminas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayrollManagement;