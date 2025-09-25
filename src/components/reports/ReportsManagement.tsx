import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText, Download, Building2, DollarSign, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Site {
  id: string;
  name: string;
  budget: number;
  spent: number;
  status: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  expense_date: string;
  sites?: { name: string };
  expense_categories?: { name: string; type: string };
  document_number?: string;
}

interface Personnel {
  id: string;
  full_name: string;
  position: string;
  salary?: number;
  status: string;
  sites?: { name: string };
  email?: string;
  phone?: string;
}

const ReportsManagement = () => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>('');
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  // Fetch sites
  const { data: sites = [] } = useQuery({
    queryKey: ['sites-for-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Site[];
    }
  });

  // Fetch expenses for reports
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses-for-reports', selectedSite, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select(`
          *,
          sites (name),
          expense_categories (name, type)
        `)
        .gte('expense_date', dateRange.from)
        .lte('expense_date', dateRange.to)
        .order('expense_date', { ascending: false });
      
      if (selectedSite) {
        query = query.eq('site_id', selectedSite);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Expense[];
    },
    enabled: reportType === 'expenses' || reportType === 'financial'
  });

  // Fetch personnel for reports
  const { data: personnel = [] } = useQuery({
    queryKey: ['personnel-for-reports', selectedSite],
    queryFn: async () => {
      let query = supabase
        .from('personnel')
        .select(`
          *,
          sites (name)
        `)
        .order('full_name');
      
      if (selectedSite) {
        query = query.eq('site_id', selectedSite);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Personnel[];
    },
    enabled: reportType === 'personnel'
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const generateSitesReportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(20);
    doc.text('Reporte de Sitios - Infratelc', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Generado: ${new Date().toLocaleString('es-CL')}`, pageWidth / 2, 30, { align: 'center' });

    // Table data
    const tableData = sites.map(site => [
      site.name,
      site.status,
      formatCurrency(site.budget),
      formatCurrency(site.spent),
      formatCurrency(site.budget - site.spent),
      `${((1 - site.spent / site.budget) * 100).toFixed(1)}%`
    ]);

    // Add table
    (doc as any).autoTable({
      head: [['Sitio', 'Estado', 'Presupuesto', 'Gastado', 'Disponible', 'Eficiencia']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [51, 122, 183] }
    });

    // Summary
    const totalBudget = sites.reduce((sum, site) => sum + site.budget, 0);
    const totalSpent = sites.reduce((sum, site) => sum + site.spent, 0);
    const finalY = (doc as any).lastAutoTable.finalY + 20;

    doc.text(`Total Presupuestado: ${formatCurrency(totalBudget)}`, 20, finalY);
    doc.text(`Total Gastado: ${formatCurrency(totalSpent)}`, 20, finalY + 10);
    doc.text(`Total Disponible: ${formatCurrency(totalBudget - totalSpent)}`, 20, finalY + 20);

    doc.save(`reporte-sitios-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateExpensesReportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(20);
    doc.text('Reporte de Gastos - Infratelc', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    const siteName = selectedSite ? sites.find(s => s.id === selectedSite)?.name : 'Todos los sitios';
    doc.text(`Sitio: ${siteName}`, 20, 35);
    doc.text(`Período: ${dateRange.from} a ${dateRange.to}`, 20, 45);
    doc.text(`Generado: ${new Date().toLocaleString('es-CL')}`, 20, 55);

    // Table data
    const tableData = expenses.map(expense => [
      new Date(expense.expense_date).toLocaleDateString('es-CL'),
      expense.sites?.name || '',
      expense.expense_categories?.name || '',
      expense.description,
      formatCurrency(expense.amount),
      expense.document_number || ''
    ]);

    // Add table
    (doc as any).autoTable({
      head: [['Fecha', 'Sitio', 'Categoría', 'Descripción', 'Monto', 'Documento']],
      body: tableData,
      startY: 65,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [51, 122, 183] },
      columnStyles: {
        3: { cellWidth: 40 },
        4: { halign: 'right' }
      }
    });

    // Summary
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    
    doc.setFontSize(12);
    doc.text(`Total de Gastos: ${formatCurrency(totalExpenses)}`, 20, finalY);
    doc.text(`Cantidad de Registros: ${expenses.length}`, 20, finalY + 10);

    doc.save(`reporte-gastos-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generatePersonnelReportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(20);
    doc.text('Reporte de Personal - Infratelc', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    const siteName = selectedSite ? sites.find(s => s.id === selectedSite)?.name : 'Todos los sitios';
    doc.text(`Sitio: ${siteName}`, 20, 35);
    doc.text(`Generado: ${new Date().toLocaleString('es-CL')}`, 20, 45);

    // Table data
    const tableData = personnel.map(person => [
      person.full_name,
      person.position,
      person.sites?.name || 'Sin asignar',
      person.status,
      person.salary ? formatCurrency(person.salary) : 'No especificado',
      person.email || '',
      person.phone || ''
    ]);

    // Add table
    (doc as any).autoTable({
      head: [['Nombre', 'Cargo', 'Sitio', 'Estado', 'Salario', 'Email', 'Teléfono']],
      body: tableData,
      startY: 55,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [51, 122, 183] },
      columnStyles: {
        4: { halign: 'right' }
      }
    });

    // Summary
    const activePersonnel = personnel.filter(p => p.status === 'Activo').length;
    const totalSalaries = personnel.reduce((sum, person) => sum + (person.salary || 0), 0);
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    
    doc.setFontSize(12);
    doc.text(`Total de Empleados: ${personnel.length}`, 20, finalY);
    doc.text(`Personal Activo: ${activePersonnel}`, 20, finalY + 10);
    doc.text(`Costo Total en Salarios: ${formatCurrency(totalSalaries)}`, 20, finalY + 20);

    doc.save(`reporte-personal-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateExcelReport = () => {
    const workbook = XLSX.utils.book_new();

    // Sites sheet
    if (reportType === 'sites' || reportType === 'financial') {
      const sitesData = sites.map(site => ({
        'Sitio': site.name,
        'Estado': site.status,
        'Presupuesto': site.budget,
        'Gastado': site.spent,
        'Disponible': site.budget - site.spent,
        'Eficiencia (%)': ((1 - site.spent / site.budget) * 100).toFixed(1)
      }));
      
      const sitesSheet = XLSX.utils.json_to_sheet(sitesData);
      XLSX.utils.book_append_sheet(workbook, sitesSheet, 'Sitios');
    }

    // Expenses sheet
    if (reportType === 'expenses' || reportType === 'financial') {
      const expensesData = expenses.map(expense => ({
        'Fecha': expense.expense_date,
        'Sitio': expense.sites?.name || '',
        'Categoría': expense.expense_categories?.name || '',
        'Tipo': expense.expense_categories?.type || '',
        'Descripción': expense.description,
        'Monto': expense.amount,
        'Documento': expense.document_number || ''
      }));
      
      const expensesSheet = XLSX.utils.json_to_sheet(expensesData);
      XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Gastos');
    }

    // Personnel sheet
    if (reportType === 'personnel') {
      const personnelData = personnel.map(person => ({
        'Nombre': person.full_name,
        'Cargo': person.position,
        'Sitio': person.sites?.name || 'Sin asignar',
        'Estado': person.status,
        'Salario': person.salary || 0,
        'Email': person.email || '',
        'Teléfono': person.phone || ''
      }));
      
      const personnelSheet = XLSX.utils.json_to_sheet(personnelData);
      XLSX.utils.book_append_sheet(workbook, personnelSheet, 'Personal');
    }

    XLSX.writeFile(workbook, `reporte-${reportType}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const generateReport = (format: 'pdf' | 'excel') => {
    if (!reportType) {
      toast({
        title: "Error",
        description: "Selecciona un tipo de reporte primero.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (format === 'pdf') {
        switch (reportType) {
          case 'sites':
            generateSitesReportPDF();
            break;
          case 'expenses':
            generateExpensesReportPDF();
            break;
          case 'personnel':
            generatePersonnelReportPDF();
            break;
          case 'financial':
            generateSitesReportPDF(); // For financial, we'll generate sites report
            break;
        }
      } else {
        generateExcelReport();
      }

      toast({
        title: "Reporte generado",
        description: `El reporte se ha descargado exitosamente en formato ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al generar el reporte. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const reportTypes = [
    { value: 'sites', label: 'Reporte de Sitios', icon: Building2 },
    { value: 'expenses', label: 'Reporte de Gastos', icon: DollarSign },
    { value: 'personnel', label: 'Reporte de Personal', icon: Users },
    { value: 'financial', label: 'Reporte Financiero Completo', icon: FileText }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Gestión de Reportes</h2>
        <p className="text-muted-foreground">
          Genera reportes detallados en PDF y Excel
        </p>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Configuración del Reporte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Reporte</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de reporte" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sitio (Opcional)</Label>
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
          </div>

          {(reportType === 'expenses' || reportType === 'financial') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha Inicio</Label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha Fin</Label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Generar Reportes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={() => generateReport('pdf')}
              className="flex-1"
              disabled={!reportType}
            >
              <FileText className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
            <Button 
              onClick={() => generateReport('excel')}
              variant="outline"
              className="flex-1"
              disabled={!reportType}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {reportType && (
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa del Reporte</CardTitle>
          </CardHeader>
          <CardContent>
            {reportType === 'sites' && (
              <div className="space-y-4">
                <h4 className="font-medium">Sitios a incluir: {sites.length}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-secondary/20 rounded">
                    <p className="font-medium">Total Presupuestado</p>
                    <p className="text-lg">{formatCurrency(sites.reduce((sum, site) => sum + site.budget, 0))}</p>
                  </div>
                  <div className="p-3 bg-secondary/20 rounded">
                    <p className="font-medium">Total Gastado</p>
                    <p className="text-lg">{formatCurrency(sites.reduce((sum, site) => sum + site.spent, 0))}</p>
                  </div>
                  <div className="p-3 bg-secondary/20 rounded">
                    <p className="font-medium">Eficiencia Promedio</p>
                    <p className="text-lg">{(sites.reduce((sum, site) => sum + (1 - site.spent / site.budget), 0) / sites.length * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            )}

            {reportType === 'expenses' && (
              <div className="space-y-4">
                <h4 className="font-medium">Gastos a incluir: {expenses.length}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-secondary/20 rounded">
                    <p className="font-medium">Total de Gastos</p>
                    <p className="text-lg">{formatCurrency(expenses.reduce((sum, expense) => sum + expense.amount, 0))}</p>
                  </div>
                  <div className="p-3 bg-secondary/20 rounded">
                    <p className="font-medium">Período</p>
                    <p className="text-lg">{dateRange.from} a {dateRange.to}</p>
                  </div>
                </div>
              </div>
            )}

            {reportType === 'personnel' && (
              <div className="space-y-4">
                <h4 className="font-medium">Personal a incluir: {personnel.length}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-secondary/20 rounded">
                    <p className="font-medium">Personal Activo</p>
                    <p className="text-lg">{personnel.filter(p => p.status === 'Activo').length}</p>
                  </div>
                  <div className="p-3 bg-secondary/20 rounded">
                    <p className="font-medium">En Vacaciones</p>
                    <p className="text-lg">{personnel.filter(p => p.status === 'Vacaciones').length}</p>
                  </div>
                  <div className="p-3 bg-secondary/20 rounded">
                    <p className="font-medium">Costo Total Salarios</p>
                    <p className="text-lg">{formatCurrency(personnel.reduce((sum, person) => sum + (person.salary || 0), 0))}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsManagement;