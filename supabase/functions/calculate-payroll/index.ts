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

    const { payrollRunId } = await req.json();

    // Get payroll run details
    const { data: payrollRun, error: payrollError } = await supabaseClient
      .from('payroll_runs')
      .select('*, payroll_rates(*)')
      .eq('id', payrollRunId)
      .single();

    if (payrollError) throw payrollError;

    // Get all active personnel for the tenant
    const { data: personnel, error: personnelError } = await supabaseClient
      .from('personnel')
      .select('*')
      .eq('tenant_id', payrollRun.tenant_id)
      .eq('status', 'Activo');

    if (personnelError) throw personnelError;

    // Get timesheets for the payroll period
    const periodStart = new Date(payrollRun.period + '-01');
    const periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);

    const payrollItems = [];
    let totalGrossPay = 0;
    let totalDeductions = 0;
    let totalNetPay = 0;

    for (const employee of personnel) {
      // Get employee timesheets for the period
      const { data: timesheets } = await supabaseClient
        .from('timesheets')
        .select('*')
        .eq('employee_id', employee.id)
        .gte('date', periodStart.toISOString().split('T')[0])
        .lte('date', periodEnd.toISOString().split('T')[0])
        .eq('status', 'approved');

      // Calculate worked days and hours
      const workedDays = timesheets?.length || 0;
      const normalHours = timesheets?.reduce((sum, ts) => sum + (ts.total_hours || 0), 0) || 0;
      const overtimeHours = timesheets?.reduce((sum, ts) => sum + (ts.overtime_hours || 0), 0) || 0;

      // Base calculations
      const baseSalary = employee.salary || employee.base_salary || 0;
      const dailySalary = baseSalary / 30;
      const normalPay = dailySalary * workedDays;
      const overtimeRate = (baseSalary / 30 / 8) * 1.5; // 50% extra for overtime
      const overtimeAmount = overtimeHours * overtimeRate;

      // Gratification (25% of taxable income, capped)
      const taxableIncome = normalPay + overtimeAmount;
      const gratificationAmount = Math.min(
        taxableIncome * payrollRun.payroll_rates.gratification_rate,
        payrollRun.payroll_rates.gratification_cap
      );

      // Family allowance
      const familyAllowanceAmount = payrollRun.payroll_rates.family_allowance_amount;

      // Gross pay calculation
      const grossTaxable = normalPay + overtimeAmount + gratificationAmount;
      const grossNonTaxable = familyAllowanceAmount;

      // Deductions
      const afpDeduction = Math.min(
        grossTaxable * payrollRun.payroll_rates.afp_worker_rate,
        payrollRun.payroll_rates.afp_taxable_cap
      );

      const healthDeduction = Math.min(
        grossTaxable * payrollRun.payroll_rates.fonasa_rate,
        payrollRun.payroll_rates.health_taxable_cap
      );

      // AFC deduction based on contract type
      const afcRate = employee.contract_type === 'indefinido' 
        ? payrollRun.payroll_rates.afc_worker_indefinite
        : payrollRun.payroll_rates.afc_worker_fixed_term;
      const afcDeduction = grossTaxable * afcRate;

      // Tax deduction (simplified - would need tax tables for accurate calculation)
      const taxableForTax = grossTaxable - afpDeduction - healthDeduction;
      const taxDeduction = taxableForTax > payrollRun.payroll_rates.utm_value * 13.5 
        ? taxableForTax * 0.05 // Simplified tax rate
        : 0;

      // Net pay
      const totalDeductionsEmployee = afpDeduction + healthDeduction + afcDeduction + taxDeduction;
      const netPay = grossTaxable + grossNonTaxable - totalDeductionsEmployee;

      const payrollItem = {
        payroll_run_id: payrollRunId,
        employee_id: employee.id,
        employee_name: employee.full_name,
        employee_rut: employee.rut,
        position: employee.position,
        worked_days: workedDays,
        normal_hours: normalHours,
        overtime_hours: overtimeHours,
        base_salary: baseSalary,
        overtime_amount: overtimeAmount,
        gross_taxable: grossTaxable,
        gross_non_taxable: grossNonTaxable,
        afp_deduction: afpDeduction,
        health_deduction: healthDeduction,
        afc_deduction: afcDeduction,
        tax_deduction: taxDeduction,
        net_pay: netPay,
        bonus_amounts: {
          gratification: gratificationAmount,
          family_allowance: familyAllowanceAmount
        },
        other_deductions: {},
        tenant_id: payrollRun.tenant_id
      };

      payrollItems.push(payrollItem);
      totalGrossPay += grossTaxable + grossNonTaxable;
      totalDeductions += totalDeductionsEmployee;
      totalNetPay += netPay;
    }

    // Insert payroll items
    const { error: insertError } = await supabaseClient
      .from('payroll_items')
      .insert(payrollItems);

    if (insertError) throw insertError;

    // Update payroll run totals
    const { error: updateError } = await supabaseClient
      .from('payroll_runs')
      .update({
        total_employees: personnel.length,
        total_gross_pay: totalGrossPay,
        total_deductions: totalDeductions,
        total_net_pay: totalNetPay,
        calculated_at: new Date().toISOString(),
        status: 'calculated'
      })
      .eq('id', payrollRunId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalEmployees: personnel.length,
        totalGrossPay,
        totalDeductions,
        totalNetPay
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error calculating payroll:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});