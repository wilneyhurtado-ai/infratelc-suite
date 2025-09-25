-- Create sites table
CREATE TABLE public.sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  budget DECIMAL(15,2) NOT NULL DEFAULT 0,
  spent DECIMAL(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Planificado' CHECK (status IN ('Planificado', 'En progreso', 'Completado', 'Suspendido')),
  description TEXT,
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expense categories table
CREATE TABLE public.expense_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('Personal', 'Operacional', 'Materiales', 'Ingresos')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.expense_categories(id),
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  expense_date DATE NOT NULL,
  document_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create personnel table
CREATE TABLE public.personnel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  site_id UUID REFERENCES public.sites(id),
  salary DECIMAL(12,2),
  hire_date DATE,
  status TEXT NOT NULL DEFAULT 'Activo' CHECK (status IN ('Activo', 'Inactivo', 'Vacaciones')),
  email TEXT,
  phone TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sites
CREATE POLICY "Sites are viewable by authenticated users" 
ON public.sites FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create sites" 
ON public.sites FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update sites" 
ON public.sites FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete sites" 
ON public.sites FOR DELETE TO authenticated USING (true);

-- Create RLS policies for expense_categories
CREATE POLICY "Expense categories are viewable by authenticated users" 
ON public.expense_categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage expense categories" 
ON public.expense_categories FOR ALL TO authenticated USING (true);

-- Create RLS policies for expenses
CREATE POLICY "Expenses are viewable by authenticated users" 
ON public.expenses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create expenses" 
ON public.expenses FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update expenses" 
ON public.expenses FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete expenses" 
ON public.expenses FOR DELETE TO authenticated USING (true);

-- Create RLS policies for personnel
CREATE POLICY "Personnel are viewable by authenticated users" 
ON public.personnel FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage personnel" 
ON public.personnel FOR ALL TO authenticated USING (true);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personnel_updated_at
  BEFORE UPDATE ON public.personnel
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial expense categories based on Excel templates
INSERT INTO public.expense_categories (name, type) VALUES
-- Personal expenses
('Alimentación', 'Personal'),
('Alojamiento', 'Personal'),
('Sueldos', 'Personal'),
('Gratificaciones', 'Personal'),
('Leyes Sociales', 'Personal'),
-- Operational expenses
('Combustible', 'Operacional'),
('Lubricantes', 'Operacional'),
('Repuestos', 'Operacional'),
('Fletes', 'Operacional'),
('Mantención', 'Operacional'),
('Arriendo', 'Operacional'),
('Seguros', 'Operacional'),
('Varios', 'Operacional'),
-- Materials
('Materiales', 'Materiales'),
('Herramientas', 'Materiales'),
-- Income
('Estimado', 'Ingresos'),
('Real', 'Ingresos');

-- Insert initial sites based on Excel data
INSERT INTO public.sites (name, budget, spent, status, description) VALUES
('Tetillas', 13897614, 1773100, 'En progreso', 'Proyecto de infraestructura en Tetillas'),
('B-55', 14246664, 0, 'Planificado', 'Proyecto B-55 en fase de planificación'),
('Isla Riesco', 11282692, 5332692, 'En progreso', 'Proyecto en Isla Riesco'),
('Contenedor Petrosismic', 20673624, 0, 'Planificado', 'Proyecto contenedor Petrosismic');