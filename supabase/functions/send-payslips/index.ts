import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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

    // Get payroll run and all items
    const { data: payrollRun, error: runError } = await supabaseClient
      .from('payroll_runs')
      .select('*')
      .eq('id', payrollRunId)
      .single();

    if (runError) throw runError;

    const { data: payrollItems, error: itemsError } = await supabaseClient
      .from('payroll_items')
      .select(`
        *,
        personnel!inner(email)
      `)
      .eq('payroll_run_id', payrollRunId)
      .not('personnel.email', 'is', null);

    if (itemsError) throw itemsError;

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const item of payrollItems) {
      try {
        // Generate PDF content for this employee
        const pdfResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-payslip-pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({ payrollItemId: item.id })
        });

        const pdfData = await pdfResponse.json();
        
        if (!pdfData.success) {
          throw new Error(`Failed to generate PDF: ${pdfData.error}`);
        }

        // Send email with payslip
        const emailResponse = await resend.emails.send({
          from: 'noreply@wayco.cl',
          to: [item.personnel.email],
          subject: `Liquidación de Sueldo - ${payrollRun.period}`,
          html: `
            <h2>Liquidación de Sueldo</h2>
            <p>Estimado/a ${item.employee_name},</p>
            <p>Adjunto encontrará su liquidación de sueldo correspondiente al período ${payrollRun.period}.</p>
            <p>Su sueldo líquido para este período es: <strong>$${item.net_pay.toLocaleString('es-CL')}</strong></p>
            <br>
            <p>Saludos cordiales,<br>
            Departamento de Recursos Humanos<br>
            WAYCO LIMITADA</p>
            <hr>
            <div style="font-size: 12px; color: #666;">
              ${pdfData.htmlContent}
            </div>
          `
        });

        if (emailResponse.error) {
          throw new Error(`Email error: ${emailResponse.error.message}`);
        }

        // Update payroll item to mark email as sent
        await supabaseClient
          .from('payroll_items')
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString()
          })
          .eq('id', item.id);

        successCount++;

      } catch (error: any) {
        console.error(`Error sending payslip to ${item.employee_name}:`, error);
        errors.push(`${item.employee_name}: ${error.message}`);
        errorCount++;
      }
    }

    // Update payroll run status if all emails sent successfully
    if (errorCount === 0) {
      await supabaseClient
        .from('payroll_runs')
        .update({ status: 'completed' })
        .eq('id', payrollRunId);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        totalEmails: payrollItems.length,
        successCount,
        errorCount,
        errors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error sending payslips:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});