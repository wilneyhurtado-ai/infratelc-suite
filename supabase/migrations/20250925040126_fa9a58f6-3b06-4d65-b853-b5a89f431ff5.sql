-- Update existing user profile to admin role or create if doesn't exist
INSERT INTO profiles (
  user_id,
  full_name,
  role,
  tenant_id,
  is_active,
  company_position,
  department
) VALUES (
  'eb978b4f-5eee-480f-a686-8403a7acd121'::uuid,
  'Administrador Sistema',
  'admin',
  (SELECT id FROM tenants LIMIT 1),
  true,
  'Administrador del Sistema',
  'TI'
) ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin',
  is_active = true,
  company_position = 'Administrador del Sistema',
  department = 'TI',
  full_name = 'Administrador Sistema';

-- Ensure admin role has all permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions 
  WHERE role = 'admin' AND permission_id = permissions.id
);

-- Also ensure owner role has all permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'owner', id FROM permissions
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions 
  WHERE role = 'owner' AND permission_id = permissions.id
);