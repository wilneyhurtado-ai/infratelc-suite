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

  // Generate pay slip PDF with exact format from template
  const generatePaySlipPDF = async (runId: string, employeeId?: string) => {
    try {
      // Get payroll run details
      const { data: payrollRun, error: runError } = await supabase
        .from('payroll_runs')
        .select('*')
        .eq('id', runId)
        .single();

      if (runError) throw runError;

      // Get payroll items
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

      // Get company info from profiles
      const { data: companyProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      const doc = new jsPDF();
      
      // Generate liquidation for each employee
      payrollItems.forEach((item, index) => {
        if (index > 0) doc.addPage();
        
        // Website header
        doc.setFontSize(8);
        doc.text('www.infratelc.cl', 14, 15);
        
        // Main title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('LIQUIDACION DE SUELDO', 75, 25);
        
        // Period header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const periodDate = new Date(payrollRun.period + '-01');
        const monthName = periodDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
        doc.text(`REMUNERACIONES MES DE: ${monthName.toUpperCase()}`, 55, 35);
        
        // Company info table
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.rect(14, 45, 182, 25);
        doc.line(14, 55, 196, 55);
        doc.line(14, 65, 196, 65);
        doc.line(100, 45, 100, 70);
        doc.line(140, 45, 140, 70);
        
        doc.text('RAZON SOCIAL:', 16, 52);
        doc.text('INFRATELC SPA', 45, 52);
        doc.text('RUT EMPRESA:', 142, 52);
        doc.text('76.XXX.XXX-X', 170, 52);
        
        // Employee info
        doc.text('R.U.T.', 16, 62);
        doc.text('TRABAJADOR', 45, 62);
        doc.text('C.C.', 175, 62);
        doc.text(item.employee_rut || '00.000.000-0', 16, 68);
        doc.text(item.employee_name.toUpperCase(), 45, 68);
        doc.text('001', 175, 68);
        
        // AFP and Health info table
        doc.rect(14, 75, 182, 25);
        doc.line(14, 85, 196, 85);
        doc.line(14, 95, 196, 95);
        doc.line(60, 75, 60, 100);
        doc.line(120, 75, 120, 100);
        doc.line(160, 75, 160, 100);
        
        doc.text('A.F.P.', 16, 82);
        doc.text('ISAPRE', 122, 82);
        doc.text('UNO', 16, 92);
        doc.text('FONASA', 122, 92);
        doc.text('10,49%', 16, 98);
        doc.text(`${item.health_deduction?.toLocaleString('es-CL') || '0'}`, 122, 98);
        doc.text('7%', 162, 98);
        
        // Work days table
        doc.rect(14, 105, 182, 25);
        doc.line(14, 115, 196, 115);
        doc.line(40, 105, 40, 130);
        doc.line(70, 105, 70, 130);
        doc.line(100, 105, 100, 130);
        doc.line(130, 105, 130, 130);
        doc.line(160, 105, 160, 130);
        
        doc.text('DIAS', 16, 112);
        doc.text('HH EXTRAS', 42, 112);
        doc.text('HH FALTADAS', 72, 112);
        doc.text('CARGAS', 102, 112);
        doc.text('IMPONIBLE', 132, 112);
        doc.text('TRIBUTABLE', 162, 112);
        
        doc.text(item.worked_days?.toString() || '30', 20, 125);
        doc.text(item.overtime_hours?.toString() || '0', 48, 125);
        doc.text('0', 80, 125);
        doc.text('0', 108, 125);
        doc.text((item.gross_taxable || 0).toLocaleString('es-CL'), 135, 125);
        doc.text((item.net_pay || 0).toLocaleString('es-CL'), 165, 125);
        
        // Earnings and deductions table
        doc.rect(14, 135, 90, 80);
        doc.rect(106, 135, 90, 80);
        doc.line(14, 145, 104, 145);
        doc.line(106, 145, 196, 145);
        
        // Earnings section
        doc.setFont('helvetica', 'bold');
        doc.text('HABERES', 45, 142);
        doc.text('DESCUENTOS', 135, 142);
        
        doc.setFont('helvetica', 'normal');
        let yPos = 155;
        doc.text('SUELDO BASE', 16, yPos);
        doc.text((item.base_salary || 0).toLocaleString('es-CL'), 75, yPos);
        
        yPos += 10;
        const gratificationAmount = Math.round((item.base_salary || 0) * 0.25);
        doc.text('GRATIFICACION LEGAL', 16, yPos);
        doc.text(gratificationAmount.toLocaleString('es-CL'), 75, yPos);
        
        yPos += 10;
        doc.text('TOTAL IMPONIBLE', 16, yPos);
        doc.text((item.gross_taxable || 0).toLocaleString('es-CL'), 75, yPos);
        
        yPos += 10;
        doc.text('TOTAL NO IMPONIBLE', 16, yPos);
        doc.text('0', 75, yPos);
        
        // Deductions section
        yPos = 165;
        doc.text('PREVISION', 108, yPos);
        doc.text((item.afp_deduction || 0).toLocaleString('es-CL'), 175, yPos);
        
        yPos += 10;
        doc.text('SALUD', 108, yPos);
        doc.text((item.health_deduction || 0).toLocaleString('es-CL'), 175, yPos);
        
        yPos += 10;
        doc.text('SEGURO CESANTIA', 108, yPos);
        doc.text('0', 175, yPos);
        
        yPos += 10;
        const totalLegalDeductions = (item.afp_deduction || 0) + (item.health_deduction || 0);
        doc.text('TOTAL DESC. LEGALES', 108, yPos);
        doc.text(totalLegalDeductions.toLocaleString('es-CL'), 175, yPos);
        
        yPos += 10;
        doc.text('TOTAL OTROS DESC.', 108, yPos);
        doc.text('0', 175, yPos);
        
        // Totals
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL HABERES: ${(item.gross_taxable || 0).toLocaleString('es-CL')}`, 14, 225);
        doc.text(`TOTAL DESCUENTOS: ${totalLegalDeductions.toLocaleString('es-CL')}`, 14, 235);
        doc.text(`FECHA: ${new Date().toLocaleDateString('es-CL')}`, 14, 245);
        doc.text(`ALCANCE LIQUIDO: ${(item.net_pay || 0).toLocaleString('es-CL')}`, 14, 255);
        
        // Amount in words
        const numberInWords = convertNumberToWords(item.net_pay || 0);
        doc.text(`SON: ${numberInWords.toUpperCase()} PESOS.`, 14, 265);
        
        // Footer text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('Recibí conforme el alcance líquido de la presente liquidación, no teniendo cargo o cobro alguno que hacer por otro concepto.', 14, 280);
        
        // Signature lines
        doc.setFontSize(10);
        doc.text('FIRMA DEL EMPLEADOR', 40, 295);
        doc.text('FIRMA DEL TRABAJADOR', 140, 295);
        doc.line(14, 290, 80, 290);
        doc.line(120, 290, 186, 290);
      });

      // Download PDF
      const fileName = employeeId 
        ? `LIQ_${payrollRun.period}_${payrollItems[0].employee_name.replace(/\s+/g, '_')}.pdf`
        : `LIQ_${payrollRun.period}_TODAS.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Liquidación descargada",
        description: `Se ha generado la liquidación con formato oficial`
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

  // Helper function to convert numbers to words (simplified version)
  const convertNumberToWords = (num: number): string => {
    if (num === 0) return "CERO";
    
    const units = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
    const teens = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
    const tens = ["", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
    const hundreds = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];
    
    const convertHundreds = (n: number): string => {
      let result = "";
      
      if (n >= 100) {
        if (n === 100) {
          result += "CIEN";
        } else {
          result += hundreds[Math.floor(n / 100)];
        }
        n %= 100;
        if (n > 0) result += " ";
      }
      
      if (n >= 20) {
        result += tens[Math.floor(n / 10)];
        n %= 10;
        if (n > 0) result += " Y " + units[n];
      } else if (n >= 10) {
        result += teens[n - 10];
      } else if (n > 0) {
        result += units[n];
      }
      
      return result;
    };
    
    if (num < 1000) {
      return convertHundreds(num);
    } else if (num < 1000000) {
      const thousands = Math.floor(num / 1000);
      const remainder = num % 1000;
      let result = thousands === 1 ? "MIL" : convertHundreds(thousands) + " MIL";
      if (remainder > 0) {
        result += " " + convertHundreds(remainder);
      }
      return result;
    } else {
      const millions = Math.floor(num / 1000000);
      const remainder = num % 1000000;
      let result = millions === 1 ? "UN MILLON" : convertHundreds(millions) + " MILLONES";
      if (remainder > 0) {
        if (remainder >= 1000) {
          result += " " + convertNumberToWords(remainder);
        } else {
          result += " " + convertHundreds(remainder);
        }
      }
      return result;
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