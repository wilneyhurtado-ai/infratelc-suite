-- Módulo CRM, Operaciones de Campo y Remuneraciones
-- Step 1: Módulo CRM
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rut TEXT,
  business_name TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  region TEXT,
  industry TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  value_clp NUMERIC DEFAULT 0,
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  stage TEXT NOT NULL DEFAULT 'prospecting' CHECK (stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  expected_close_date DATE,
  assigned_to UUID,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 2: Operaciones de Campo (Telecom)
CREATE TABLE public.sites_enhanced (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  site_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  site_type TEXT NOT NULL DEFAULT 'antenna' CHECK (site_type IN ('antenna', 'tower', 'rooftop', 'ground', 'indoor')),
  coordinates JSONB, -- {lat, lng, altitude}
  address TEXT,
  region TEXT,
  comuna TEXT,
  height_meters NUMERIC,
  structure_type TEXT CHECK (structure_type IN ('tower', 'mast', 'monopole', 'building', 'other')),
  power_available BOOLEAN DEFAULT false,
  fiber_available BOOLEAN DEFAULT false,
  access_road TEXT,
  land_owner TEXT,
  permits_status TEXT DEFAULT 'pending' CHECK (permits_status IN ('pending', 'approved', 'rejected', 'in_progress')),
  budget NUMERIC DEFAULT 0,
  spent NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'survey', 'design', 'construction', 'testing', 'operational', 'maintenance', 'decommissioned')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  start_date DATE,
  end_date DATE,
  project_manager_id UUID,
  supervisor_id UUID,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, site_code)
);

CREATE TABLE public.work_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES sites_enhanced(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  work_type TEXT NOT NULL CHECK (work_type IN ('site_survey', 'civil_work', 'tower_installation', 'antenna_installation', 'alignment', 'integration', 'maintenance', 'repair', 'inspection')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'assigned', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  assigned_to UUID,
  estimated_hours NUMERIC DEFAULT 0,
  actual_hours NUMERIC DEFAULT 0,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  materials_needed TEXT[],
  safety_requirements TEXT[],
  client_signature TEXT, -- Base64 signature
  technician_signature TEXT, -- Base64 signature
  completion_notes TEXT,
  photos JSONB DEFAULT '[]', -- Array of photo URLs/metadata
  checklist_completed BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, order_number)
);

CREATE TABLE public.checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  checklist_type TEXT NOT NULL CHECK (checklist_type IN ('safety', 'technical', 'quality', 'hse', 'pre_work', 'post_work')),
  item_text TEXT NOT NULL,
  is_required BOOLEAN DEFAULT true,
  is_completed BOOLEAN DEFAULT false,
  completed_by UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  photo_evidence TEXT, -- URL to photo
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites_enhanced(id) ON DELETE SET NULL,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
  incident_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('safety', 'security', 'equipment', 'environmental', 'quality', 'near_miss')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  reported_by UUID,
  assigned_to UUID,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  root_cause TEXT,
  corrective_actions TEXT,
  preventive_actions TEXT,
  photos JSONB DEFAULT '[]',
  witnesses TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, incident_number)
);

-- Step 3: Sistema de Rates para Remuneraciones (Chile)
CREATE TABLE public.payroll_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- YYYY-MM format
  minimum_wage NUMERIC NOT NULL DEFAULT 0,
  uf_value NUMERIC NOT NULL DEFAULT 0,
  utm_value NUMERIC NOT NULL DEFAULT 0,
  -- AFP rates
  afp_worker_rate NUMERIC NOT NULL DEFAULT 0.1027, -- 10.27%
  afp_employer_rate NUMERIC NOT NULL DEFAULT 0,
  -- Health rates (Fonasa)
  fonasa_rate NUMERIC NOT NULL DEFAULT 0.07, -- 7%
  -- AFC (Unemployment insurance)
  afc_worker_indefinite NUMERIC NOT NULL DEFAULT 0.006, -- 0.6%
  afc_worker_fixed_term NUMERIC NOT NULL DEFAULT 0.008, -- 0.8%
  afc_employer_indefinite NUMERIC NOT NULL DEFAULT 0.024, -- 2.4%
  afc_employer_fixed_term NUMERIC NOT NULL DEFAULT 0.03, -- 3.0%
  -- Work accident insurance
  accident_rate NUMERIC NOT NULL DEFAULT 0.0095, -- 0.95% average
  -- Gratification
  gratification_rate NUMERIC NOT NULL DEFAULT 0.25, -- 25% of 4.75 minimum wages
  -- Family allowance
  family_allowance_amount NUMERIC NOT NULL DEFAULT 0,
  -- Caps and limits
  afp_taxable_cap NUMERIC NOT NULL DEFAULT 0, -- Cap in UF
  health_taxable_cap NUMERIC NOT NULL DEFAULT 0, -- Cap in UF
  gratification_cap NUMERIC NOT NULL DEFAULT 0, -- Cap in UF
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, period)
);

CREATE TABLE public.payroll_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- YYYY-MM format
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'approved', 'paid')),
  rates_id UUID NOT NULL REFERENCES payroll_rates(id),
  total_employees INTEGER DEFAULT 0,
  total_gross_pay NUMERIC DEFAULT 0,
  total_deductions NUMERIC DEFAULT 0,
  total_net_pay NUMERIC DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, period)
);

CREATE TABLE public.payroll_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL, -- References personnel table
  employee_rut TEXT,
  employee_name TEXT NOT NULL,
  position TEXT,
  -- Work days and hours
  worked_days INTEGER DEFAULT 0,
  normal_hours NUMERIC DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  -- Base amounts
  base_salary NUMERIC DEFAULT 0,
  overtime_amount NUMERIC DEFAULT 0,
  bonus_amounts JSONB DEFAULT '{}', -- Various bonuses
  -- Taxable amounts
  gross_taxable NUMERIC DEFAULT 0,
  gross_non_taxable NUMERIC DEFAULT 0,
  -- Deductions
  afp_deduction NUMERIC DEFAULT 0,
  health_deduction NUMERIC DEFAULT 0,
  afc_deduction NUMERIC DEFAULT 0,
  tax_deduction NUMERIC DEFAULT 0,
  other_deductions JSONB DEFAULT '{}',
  -- Final amounts
  net_pay NUMERIC DEFAULT 0,
  -- Metadata
  pdf_url TEXT, -- S3 URL to PDF
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 4: Timesheets and Attendance
CREATE TABLE public.timesheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL, -- References personnel
  site_id UUID REFERENCES sites_enhanced(id) ON DELETE SET NULL,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  break_start_time TIMESTAMP WITH TIME ZONE,
  break_end_time TIMESTAMP WITH TIME ZONE,
  total_hours NUMERIC DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  location_check_in JSONB, -- GPS coordinates
  location_check_out JSONB, -- GPS coordinates
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, employee_id, date)
);

-- Step 5: Purchase Requests (for worker dashboard)
CREATE TABLE public.purchase_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL,
  site_id UUID REFERENCES sites_enhanced(id) ON DELETE SET NULL,
  cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
  request_number TEXT NOT NULL,
  description TEXT NOT NULL,
  justification TEXT,
  estimated_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'CLP',
  urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'emergency')),
  supplier_suggested TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'purchased', 'cancelled')),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  purchase_order_number TEXT,
  actual_amount NUMERIC,
  delivery_date DATE,
  items JSONB DEFAULT '[]', -- Array of item objects
  attachments JSONB DEFAULT '[]', -- Array of file URLs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, request_number)
);

-- Step 6: Enable RLS on new tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies (tenant-isolated)
CREATE POLICY "Tenant isolation" ON public.clients FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Tenant isolation" ON public.opportunities FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Tenant isolation" ON public.sites_enhanced FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Tenant isolation" ON public.work_orders FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Tenant isolation" ON public.checklists FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Tenant isolation" ON public.incidents FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Tenant isolation" ON public.payroll_rates FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Tenant isolation" ON public.payroll_runs FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Tenant isolation" ON public.payroll_items FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Tenant isolation" ON public.timesheets FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Tenant isolation" ON public.purchase_requests FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

-- Step 8: Create triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sites_enhanced_updated_at BEFORE UPDATE ON public.sites_enhanced FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payroll_rates_updated_at BEFORE UPDATE ON public.payroll_rates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payroll_runs_updated_at BEFORE UPDATE ON public.payroll_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payroll_items_updated_at BEFORE UPDATE ON public.payroll_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_timesheets_updated_at BEFORE UPDATE ON public.timesheets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchase_requests_updated_at BEFORE UPDATE ON public.purchase_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Step 9: Insert demo data for current month rates (Chile 2024)
INSERT INTO public.payroll_rates (
  tenant_id,
  period,
  minimum_wage,
  uf_value,
  utm_value,
  afp_worker_rate,
  fonasa_rate,
  afc_worker_indefinite,
  afc_worker_fixed_term,
  afc_employer_indefinite,
  afc_employer_fixed_term,
  accident_rate,
  gratification_rate,
  family_allowance_amount,
  afp_taxable_cap,
  health_taxable_cap,
  gratification_cap
) 
SELECT 
  t.id,
  '2024-12',
  500000, -- Minimum wage CLP
  37000, -- UF value (approximate)
  65000, -- UTM value (approximate)
  0.1027, -- AFP worker rate
  0.07, -- Fonasa rate
  0.006, -- AFC worker indefinite
  0.008, -- AFC worker fixed term
  0.024, -- AFC employer indefinite
  0.03, -- AFC employer fixed term
  0.0095, -- Accident rate
  0.25, -- Gratification rate
  15000, -- Family allowance
  85.1, -- AFP cap in UF
  85.1, -- Health cap in UF
  4.75 -- Gratification cap in minimum wages
FROM public.tenants t;