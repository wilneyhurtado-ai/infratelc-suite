import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { payrollItemId } = await req.json();

    // Get payroll item with related data
    const { data: payrollItem, error: payrollError } = await supabaseClient
      .from('payroll_items')
      .select(`
        *,
        payroll_runs (
          period,
          payroll_rates (*)
        )
      `)
      .eq('id', payrollItemId)
      .single();

    if (payrollError) throw payrollError;

    // Generate PDF content (using a simplified approach for now)
    const pdfContent = generatePayslipHTML(payrollItem);

    // In a real implementation, you'd use a library like puppeteer or jsPDF
    // For now, returning HTML that can be converted to PDF on frontend
    return new Response(
      JSON.stringify({ 
        success: true,
        htmlContent: pdfContent,
        fileName: `liquidacion_${payrollItem.employee_name.replace(/\s+/g, '_')}_${payrollItem.payroll_runs.period}.html`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating payslip PDF:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generatePayslipHTML(payrollItem: any): string {
  const period = payrollItem.payroll_runs.period;
  const [year, month] = period.split('-');
  const monthNames = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Liquidación de Sueldo</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .company-info { text-align: center; margin-bottom: 15px; }
        .title { font-size: 14px; font-weight: bold; text-align: center; margin: 15px 0; }
        .employee-info { display: flex; justify-content: space-between; margin-bottom: 15px; }
        .info-box { border: 1px solid #000; padding: 8px; width: 48%; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .table th, .table td { border: 1px solid #000; padding: 6px; text-align: left; }
        .table th { background-color: #f0f0f0; font-weight: bold; }
        .amount { text-align: right; }
        .total-row { font-weight: bold; background-color: #f0f0f0; }
        .signature-section { margin-top: 30px; display: flex; justify-content: space-between; }
        .signature-box { width: 45%; text-align: center; border-top: 1px solid #000; padding-top: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <strong>WAYCO LIMITADA</strong><br>
          RUT: 76.123.456-7<br>
          Dirección: Av. Principal 123, Santiago<br>
          Teléfono: +56 2 1234 5678
        </div>
        
        <div class="title">
          LIQUIDACIÓN DE SUELDO<br>
          ${monthNames[parseInt(month)]} ${year}
        </div>
      </div>

      <div class="employee-info">
        <div class="info-box">
          <strong>DATOS DEL TRABAJADOR</strong><br>
          Nombre: ${payrollItem.employee_name}<br>
          RUT: ${payrollItem.employee_rut}<br>
          Cargo: ${payrollItem.position}<br>
          Días Trabajados: ${payrollItem.worked_days}
        </div>
        
        <div class="info-box">
          <strong>PERÍODO DE PAGO</strong><br>
          Desde: 01/${month}/${year}<br>
          Hasta: ${new Date(parseInt(year), parseInt(month), 0).getDate()}/${month}/${year}<br>
          Horas Normales: ${payrollItem.normal_hours.toFixed(2)}<br>
          Horas Extras: ${payrollItem.overtime_hours.toFixed(2)}
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th colspan="2">HABERES</th>
            <th class="amount">MONTO</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>001</td>
            <td>Sueldo Base</td>
            <td class="amount">$${payrollItem.base_salary.toLocaleString('es-CL')}</td>
          </tr>
          ${payrollItem.overtime_amount > 0 ? `
          <tr>
            <td>002</td>
            <td>Horas Extras</td>
            <td class="amount">$${payrollItem.overtime_amount.toLocaleString('es-CL')}</td>
          </tr>
          ` : ''}
          ${payrollItem.bonus_amounts.gratification > 0 ? `
          <tr>
            <td>003</td>
            <td>Gratificación Legal</td>
            <td class="amount">$${payrollItem.bonus_amounts.gratification.toLocaleString('es-CL')}</td>
          </tr>
          ` : ''}
          ${payrollItem.bonus_amounts.family_allowance > 0 ? `
          <tr>
            <td>004</td>
            <td>Asignación Familiar</td>
            <td class="amount">$${payrollItem.bonus_amounts.family_allowance.toLocaleString('es-CL')}</td>
          </tr>
          ` : ''}
          <tr class="total-row">
            <td colspan="2"><strong>TOTAL HABERES</strong></td>
            <td class="amount"><strong>$${(payrollItem.gross_taxable + payrollItem.gross_non_taxable).toLocaleString('es-CL')}</strong></td>
          </tr>
        </tbody>
      </table>

      <table class="table">
        <thead>
          <tr>
            <th colspan="2">DESCUENTOS</th>
            <th class="amount">MONTO</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>101</td>
            <td>AFP (${(payrollItem.payroll_runs.payroll_rates.afp_worker_rate * 100).toFixed(2)}%)</td>
            <td class="amount">$${payrollItem.afp_deduction.toLocaleString('es-CL')}</td>
          </tr>
          <tr>
            <td>102</td>
            <td>Salud (${(payrollItem.payroll_runs.payroll_rates.fonasa_rate * 100).toFixed(2)}%)</td>
            <td class="amount">$${payrollItem.health_deduction.toLocaleString('es-CL')}</td>
          </tr>
          <tr>
            <td>103</td>
            <td>AFC</td>
            <td class="amount">$${payrollItem.afc_deduction.toLocaleString('es-CL')}</td>
          </tr>
          ${payrollItem.tax_deduction > 0 ? `
          <tr>
            <td>104</td>
            <td>Impuesto</td>
            <td class="amount">$${payrollItem.tax_deduction.toLocaleString('es-CL')}</td>
          </tr>
          ` : ''}
          <tr class="total-row">
            <td colspan="2"><strong>TOTAL DESCUENTOS</strong></td>
            <td class="amount"><strong>$${(payrollItem.afp_deduction + payrollItem.health_deduction + payrollItem.afc_deduction + payrollItem.tax_deduction).toLocaleString('es-CL')}</strong></td>
          </tr>
        </tbody>
      </table>

      <table class="table">
        <tbody>
          <tr class="total-row">
            <td colspan="2"><strong>SUELDO LÍQUIDO A PAGAR</strong></td>
            <td class="amount"><strong>$${payrollItem.net_pay.toLocaleString('es-CL')}</strong></td>
          </tr>
        </tbody>
      </table>

      <div class="signature-section">
        <div class="signature-box">
          FIRMA EMPLEADOR<br><br><br>
          _______________________
        </div>
        <div class="signature-box">
          FIRMA TRABAJADOR<br><br><br>
          _______________________
        </div>
      </div>
    </body>
    </html>
  `;
}