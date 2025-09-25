-- Fix multi-tenant architecture migration - handle existing columns
-- Step 1: Create tenants table
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  settings JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 2: Create comprehensive roles enum
CREATE TYPE public.user_role AS ENUM (
  'owner',
  'admin', 
  'rrhh',
  'finanzas',
  'jefe_obra',
  'supervisor',
  'tecnico',
  'trabajador',
  'auditor',
  'cliente_invitado'
);

-- Step 3: Update the existing role column to use the new enum
-- First drop the existing role column if it's just text
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
-- Add the new role column with proper enum type
ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'trabajador';

-- Step 4: Create permissions system
CREATE TABLE public.permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 5: Create role permissions mapping
CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role user_role NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- Step 6: Create cost centers
CREATE TABLE public.cost_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'obra' CHECK (type IN ('obra', 'proyecto', 'centro_costo')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  budget NUMERIC DEFAULT 0,
  spent NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  manager_id UUID,
  client_name TEXT,
  location JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);

-- Step 7: Add missing columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS employee_code TEXT,
  ADD COLUMN IF NOT EXISTS hire_date DATE,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS cost_center_assignments UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS permissions_override JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Step 8: Create user cost center assignments table
CREATE TABLE public.user_cost_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  cost_center_id UUID NOT NULL REFERENCES cost_centers(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, cost_center_id)
);

-- Step 9: Add tenant_id to existing tables for multi-tenancy
ALTER TABLE public.sites 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL;

ALTER TABLE public.expenses 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS approved_by UUID,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE public.personnel 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS employee_code TEXT,
  ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'trabajador',
  ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'indefinido' CHECK (contract_type IN ('indefinido', 'plazo_fijo', 'honorarios')),
  ADD COLUMN IF NOT EXISTS base_salary NUMERIC,
  ADD COLUMN IF NOT EXISTS rut TEXT;

ALTER TABLE public.expense_categories 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 10: Insert basic permissions
INSERT INTO public.permissions (name, description, module, action) VALUES
-- Auth & Users
('users.create', 'Crear usuarios', 'users', 'create'),
('users.read', 'Ver usuarios', 'users', 'read'),
('users.update', 'Actualizar usuarios', 'users', 'update'),
('users.delete', 'Eliminar usuarios', 'users', 'delete'),
('users.impersonate', 'Impersonar usuarios', 'users', 'impersonate'),
-- Roles & Permissions
('roles.manage', 'Gestionar roles y permisos', 'roles', 'manage'),
-- Cost Centers
('cost_centers.create', 'Crear centros de costo', 'cost_centers', 'create'),
('cost_centers.read', 'Ver centros de costo', 'cost_centers', 'read'),
('cost_centers.update', 'Actualizar centros de costo', 'cost_centers', 'update'),
('cost_centers.delete', 'Eliminar centros de costo', 'cost_centers', 'delete'),
-- Expenses
('expenses.create', 'Crear gastos', 'expenses', 'create'),
('expenses.read', 'Ver gastos', 'expenses', 'read'),
('expenses.update', 'Actualizar gastos', 'expenses', 'update'),
('expenses.delete', 'Eliminar gastos', 'expenses', 'delete'),
('expenses.approve', 'Aprobar gastos', 'expenses', 'approve'),
-- Sites/Projects
('sites.create', 'Crear sitios/proyectos', 'sites', 'create'),
('sites.read', 'Ver sitios/proyectos', 'sites', 'read'),
('sites.update', 'Actualizar sitios/proyectos', 'sites', 'update'),
('sites.delete', 'Eliminar sitios/proyectos', 'sites', 'delete'),
-- Personnel/HR
('personnel.create', 'Crear personal', 'personnel', 'create'),
('personnel.read', 'Ver personal', 'personnel', 'read'),
('personnel.update', 'Actualizar personal', 'personnel', 'update'),
('personnel.delete', 'Eliminar personal', 'personnel', 'delete'),
-- Reports
('reports.view', 'Ver reportes', 'reports', 'read'),
('reports.export', 'Exportar reportes', 'reports', 'export'),
-- Dashboard
('dashboard.view', 'Ver dashboard', 'dashboard', 'read'),
('dashboard.admin', 'Ver dashboard administrativo', 'dashboard', 'admin');

-- Step 11: Assign permissions to roles
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'owner', id FROM public.permissions;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions 
WHERE name NOT IN ('users.impersonate', 'roles.manage');

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'supervisor', id FROM public.permissions 
WHERE name IN (
  'expenses.read', 'expenses.approve', 'expenses.create',
  'sites.read', 'sites.update',
  'personnel.read', 'personnel.update',
  'reports.view', 'dashboard.view',
  'cost_centers.read'
);

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'trabajador', id FROM public.permissions 
WHERE name IN (
  'expenses.create', 'expenses.read',
  'sites.read',
  'personnel.read',
  'dashboard.view'
);

-- Step 12: Create audit log table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 13: Enable RLS on all new tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Step 14: Create RLS policies
CREATE POLICY "Users can view their tenant" ON public.tenants
  FOR SELECT USING (
    id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Permissions are viewable by authenticated users" ON public.permissions
  FOR SELECT USING (true);

CREATE POLICY "Role permissions are viewable by authenticated users" ON public.role_permissions
  FOR SELECT USING (true);

CREATE POLICY "Users can view cost centers from their tenant" ON public.cost_centers
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage cost centers from their tenant" ON public.cost_centers
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view their cost center assignments" ON public.user_cost_centers
  FOR SELECT USING (
    user_id IN (SELECT user_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view audit logs from their tenant" ON public.audit_logs
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Step 15: Create helper functions
CREATE OR REPLACE FUNCTION public.user_has_permission(
  _user_id UUID,
  _permission_name TEXT
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.role_permissions rp ON rp.role = p.role
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.user_id = _user_id 
      AND perm.name = _permission_name
      AND p.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_tenant(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE user_id = _user_id;
$$;

-- Step 16: Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cost_centers_updated_at
  BEFORE UPDATE ON public.cost_centers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Step 17: Insert demo tenant
INSERT INTO public.tenants (name, slug, description) VALUES
  ('Infratelc Demo', 'infratelc-demo', 'Empresa demo de telecomunicaciones');