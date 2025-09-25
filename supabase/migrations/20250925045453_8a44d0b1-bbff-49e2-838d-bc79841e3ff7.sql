-- Clear and restore data using existing categories
BEGIN;

-- Clear existing data
DELETE FROM expenses;
DELETE FROM sites;

-- Insert sites from Excel data
INSERT INTO sites (name, budget, spent, status, description, start_date, end_date)
VALUES
  ('TETILLAS', 50000000, 0, 'Planificado', 'Sitio de telecomunicaciones en región de Los Lagos', '2024-01-15', '2024-12-31'),
  ('B-55', 35000000, 0, 'Planificado', 'Sitio base para antenas de comunicación', '2024-03-01', '2024-10-15'),
  ('ISLA RIESCO', 75000000, 0, 'Planificado', 'Proyecto de infraestructura en isla remota', '2024-02-01', '2024-11-30'),
  ('CONTENEDOR PETROSISMIC', 28000000, 0, 'Planificado', 'Contenedor especializado para equipos sísmicos', '2024-04-01', '2024-08-30');

-- Insert expenses for TETILLAS using existing categories
INSERT INTO expenses (site_id, category_id, description, amount, expense_date, document_number, approval_status, notes)
SELECT s.id, ec.id, 'Combustible y mantenimiento de generador', 2500000, '2024-01-20', 'FC-001-2024', 'approved', 'Combustible para generador principal'
FROM sites s
JOIN expense_categories ec ON ec.name = 'Combustible y Generador'
WHERE s.name = 'TETILLAS'
LIMIT 1;

INSERT INTO expenses (site_id, category_id, description, amount, expense_date, document_number, approval_status, notes)
SELECT s.id, ec.id, 'Alojamiento equipo técnico - 15 días', 1950000, '2024-01-25', 'FC-002-2024', 'approved', 'Hospedaje para personal técnico'
FROM sites s
JOIN expense_categories ec ON ec.name = 'Alojamiento'
WHERE s.name = 'TETILLAS'
LIMIT 1;

INSERT INTO expenses (site_id, category_id, description, amount, expense_date, document_number, approval_status, notes)
SELECT s.id, ec.id, 'Materiales de construcción y herramientas', 4000000, '2024-02-01', 'FC-003-2024', 'approved', 'Materiales para instalación de base'
FROM sites s
JOIN expense_categories ec ON ec.name = 'Materiales'
WHERE s.name = 'TETILLAS'
LIMIT 1;

-- Insert expenses for ISLA RIESCO using existing categories
INSERT INTO expenses (site_id, category_id, description, amount, expense_date, document_number, approval_status, notes)
SELECT s.id, ec.id, 'Transporte especializado vía marítima', 8500000, '2024-02-10', 'FC-010-2024', 'approved', 'Transporte de equipos a la isla'
FROM sites s
JOIN expense_categories ec ON ec.name = 'Fletes'
WHERE s.name = 'ISLA RIESCO'
LIMIT 1;

INSERT INTO expenses (site_id, category_id, description, amount, expense_date, document_number, approval_status, notes)
SELECT s.id, ec.id, 'Equipo de comunicaciones satelital', 3800000, '2024-02-15', 'FC-011-2024', 'approved', 'Equipos de comunicación para sitio remoto'
FROM sites s
JOIN expense_categories ec ON ec.name = 'Herramientas'
WHERE s.name = 'ISLA RIESCO'
LIMIT 1;

-- Update spent amounts for all sites
UPDATE sites SET spent = (
  SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE expenses.site_id = sites.id
);

COMMIT;