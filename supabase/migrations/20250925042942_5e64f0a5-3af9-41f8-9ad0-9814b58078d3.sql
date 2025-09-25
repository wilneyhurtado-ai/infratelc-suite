-- Limpiar datos de sitios existentes que sean de prueba
DELETE FROM sites WHERE name LIKE 'Site%' OR name = 'Test Site';

-- Insertar sitios reales con información de los archivos Excel
INSERT INTO sites (
  name, 
  description, 
  status, 
  budget, 
  spent, 
  start_date, 
  end_date,
  created_at,
  updated_at
) VALUES 
(
  'TETILLAS',
  'Sitio de antena en Tetillas - Proyecto de instalación de torre de comunicaciones',
  'En progreso',
  13897614,
  1773100,
  '2024-09-01',
  '2024-12-31',
  now(),
  now()
),
(
  'B-55',
  'Sitio B-55 - Proyecto de instalación de infraestructura de telecomunicaciones',
  'Planificado',
  14246664,
  0,
  '2024-10-01',
  '2025-03-31',
  now(),
  now()
),
(
  'ISLA RIESCO',
  'Sitio Isla Riesco - Proyecto en Punta Arenas, instalación de torre con flete especializado',
  'En progreso',
  11282692,
  5332692,
  '2024-09-15',
  '2025-01-31',
  now(),
  now()
),
(
  'CONTENEDOR PETROSISMIC',
  'Contenedores de Explosivos - Proyecto especializado para almacenamiento seguro',
  'Planificado',
  20673624,
  0,
  '2024-11-01',
  '2025-06-30',
  now(),
  now()
);

-- Insertar categorías de gastos específicas basadas en los archivos
INSERT INTO expense_categories (name, description, type) VALUES 
('Combustible y Generador', 'Gastos de combustible para vehículos y generadores', 'Operacional'),
('Materiales de Ferretería', 'Materiales diversos para construcción y montaje', 'Materiales'),
('Hidratantes y Agua', 'Suministros de hidratación para personal', 'Personal'),
('Alimentación Personal', 'Gastos de alimentación para trabajadores', 'Personal'),
('Alojamiento', 'Gastos de hospedaje para personal', 'Personal'),
('Sueldos', 'Pagos de sueldos a trabajadores', 'Personal'),
('Peajes', 'Gastos de peajes y transporte', 'Operacional'),
('Retro', 'Alquiler de retroexcavadora', 'Operacional'),
('Camión Pluma', 'Alquiler de camión grúa', 'Operacional'),
('Flete Torre', 'Transporte de estructuras de torre', 'Operacional'),
('Materiales Eléctricos Torre', 'Componentes eléctricos para torres', 'Materiales'),
('Tonina', 'Equipos especializados', 'Operacional'),
('Bodegaje Estructura', 'Almacenamiento de estructuras', 'Operacional'),
('Cruces', 'Gastos de cruces y conexiones', 'Operacional'),
('Contenedores', 'Contenedores especializados para explosivos', 'Materiales'),
('Apoyos', 'Estructuras de apoyo', 'Materiales')
ON CONFLICT (name) DO NOTHING;

-- Insertar algunos gastos reales del sitio TETILLAS
INSERT INTO expenses (
  amount,
  description,
  expense_date,
  site_id,
  category_id,
  approval_status,
  created_at
) 
SELECT 
  750000,
  'Combustible, camioneta y generador x 30 días',
  '2024-09-21',
  s.id,
  c.id,
  'approved',
  now()
FROM sites s, expense_categories c 
WHERE s.name = 'TETILLAS' AND c.name = 'Combustible y Generador';

INSERT INTO expenses (
  amount,
  description,
  expense_date,
  site_id,
  category_id,
  approval_status,
  created_at
) 
SELECT 
  1440000,
  'Alimentación x 10.000 por persona',
  '2024-09-21',
  s.id,
  c.id,
  'approved',
  now()
FROM sites s, expense_categories c 
WHERE s.name = 'TETILLAS' AND c.name = 'Alimentación Personal';

INSERT INTO expenses (
  amount,
  description,
  expense_date,
  site_id,
  category_id,
  approval_status,
  created_at
) 
SELECT 
  1773100,
  'Alojamiento 70.000',
  '2024-09-21',
  s.id,
  c.id,
  'approved',
  now()
FROM sites s, expense_categories c 
WHERE s.name = 'TETILLAS' AND c.name = 'Alojamiento';

-- Insertar gastos del sitio ISLA RIESCO
INSERT INTO expenses (
  amount,
  description,
  expense_date,
  site_id,
  category_id,
  approval_status,
  created_at
) 
SELECT 
  87228,
  'Combustible, camioneta y generador x 30 días',
  '2024-09-15',
  s.id,
  c.id,
  'approved',
  now()
FROM sites s, expense_categories c 
WHERE s.name = 'ISLA RIESCO' AND c.name = 'Combustible y Generador';

INSERT INTO expenses (
  amount,
  description,
  expense_date,
  site_id,
  category_id,
  approval_status,
  created_at
) 
SELECT 
  70000,
  'Cruces',
  '2024-09-15',
  s.id,
  c.id,
  'approved',
  now()
FROM sites s, expense_categories c 
WHERE s.name = 'ISLA RIESCO' AND c.name = 'Cruces';

INSERT INTO expenses (
  amount,
  description,
  expense_date,
  site_id,
  category_id,
  approval_status,
  created_at
) 
SELECT 
  3793000,
  'Sueldos personal',
  '2024-09-15',
  s.id,
  c.id,
  'approved',
  now()
FROM sites s, expense_categories c 
WHERE s.name = 'ISLA RIESCO' AND c.name = 'Sueldos';

INSERT INTO expenses (
  amount,
  description,
  expense_date,
  site_id,
  category_id,
  approval_status,
  created_at
) 
SELECT 
  1382464,
  'Materiales eléctricos de torre',
  '2024-09-15',
  s.id,
  c.id,
  'approved',
  now()
FROM sites s, expense_categories c 
WHERE s.name = 'ISLA RIESCO' AND c.name = 'Materiales Eléctricos Torre';