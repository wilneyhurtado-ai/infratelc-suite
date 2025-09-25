-- Limpiar todos los gastos existentes para evitar duplicados
DELETE FROM expenses;

-- Insertar gastos reales del sitio TETILLAS basados en el archivo Excel
INSERT INTO expenses (
  amount,
  description,
  expense_date,
  site_id,
  category_id,
  approval_status,
  created_at,
  notes
) 
SELECT 
  750000,
  'Combustible, camioneta y generador x 30 días',
  '2024-09-21',
  s.id,
  c.id,
  'approved',
  now(),
  'Gasto transferido según documento de respaldo'
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
  1200000,
  'Materiales de ferretería para varios emplantillado y otros',
  '2024-09-21',
  s.id,
  c.id,
  'pending',
  now()
FROM sites s, expense_categories c 
WHERE s.name = 'TETILLAS' AND c.name = 'Materiales de Ferretería';

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
  45000,
  'Hidratantes y agua',
  '2024-09-21',
  s.id,
  c.id,
  'pending',
  now()
FROM sites s, expense_categories c 
WHERE s.name = 'TETILLAS' AND c.name = 'Hidratantes y Agua';

INSERT INTO expenses (
  amount,
  description,
  expense_date,
  site_id,
  category_id,
  approval_status,
  created_at,
  document_number
) 
SELECT 
  1440000,
  'Alimentación x 10.000 x persona',
  '2024-09-21',
  s.id,
  c.id,
  'approved',
  now(),
  '22 y 23 Septiembre'
FROM sites s, expense_categories c 
WHERE s.name = 'TETILLAS' AND c.name = 'Alimentación Personal';

INSERT INTO expenses (
  amount,
  description,
  expense_date,
  site_id,
  category_id,
  approval_status,
  created_at,
  document_number
) 
SELECT 
  1773100,
  'Alojamiento 70.000',
  '2024-09-21',
  s.id,
  c.id,
  'approved',
  now(),
  '22 y 23 Septiembre'
FROM sites s, expense_categories c 
WHERE s.name = 'TETILLAS' AND c.name = 'Alojamiento';

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
  3080000,
  'Sueldos personal',
  '2024-09-21',
  s.id,
  c.id,
  'pending',
  now()
FROM sites s, expense_categories c 
WHERE s.name = 'TETILLAS' AND c.name = 'Sueldos';

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
  35000,
  'Peajes',
  '2024-09-21',
  s.id,
  c.id,
  'approved',
  now()
FROM sites s, expense_categories c 
WHERE s.name = 'TETILLAS' AND c.name = 'Peajes';

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
  714000,
  'Retro (retroexcavadora)',
  '2024-09-21',
  s.id,
  c.id,
  'pending',
  now()
FROM sites s, expense_categories c 
WHERE s.name = 'TETILLAS' AND c.name = 'Retro';

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
  714000,
  'Camión pluma',
  '2024-09-21',
  s.id,
  c.id,
  'pending',
  now()
FROM sites s, expense_categories c 
WHERE s.name = 'TETILLAS' AND c.name = 'Camión Pluma';

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
  2500000,
  'Flete torre',
  '2024-09-21',
  s.id,
  c.id,
  'pending',
  now()
FROM sites s, expense_categories c 
WHERE s.name = 'TETILLAS' AND c.name = 'Flete Torre';

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
  1049134,
  'Materiales eléctricos torre',
  '2024-09-21',
  s.id,
  c.id,
  'pending',
  now()
FROM sites s, expense_categories c 
WHERE s.name = 'TETILLAS' AND c.name = 'Materiales Eléctricos Torre';

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
  371280,
  'Tonina (equipos especializados)',
  '2024-09-21',
  s.id,
  c.id,
  'pending',
  now()
FROM sites s, expense_categories c 
WHERE s.name = 'TETILLAS' AND c.name = 'Tonina';

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
  416500,
  'Bodegaje estructura',
  '2024-09-21',
  s.id,
  c.id,
  'pending',
  now()
FROM sites s, expense_categories c 
WHERE s.name = 'TETILLAS' AND c.name = 'Bodegaje Estructura';

-- Gastos del sitio ISLA RIESCO
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
  5950000,
  'Flete torre SCL - Punta Arenas',
  '2024-09-15',
  s.id,
  c.id,
  'pending',
  now()
FROM sites s, expense_categories c 
WHERE s.name = 'ISLA RIESCO' AND c.name = 'Flete Torre';

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

-- Actualizar los totales gastados en los sitios
UPDATE sites SET spent = (
  SELECT COALESCE(SUM(amount), 0) 
  FROM expenses 
  WHERE expenses.site_id = sites.id AND approval_status = 'approved'
) WHERE name IN ('TETILLAS', 'ISLA RIESCO', 'B-55', 'CONTENEDOR PETROSISMIC');