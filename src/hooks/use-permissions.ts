import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['permissions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          permissions (
            name,
            description,
            module,
            action
          )
        `)
        .eq('role', (await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()
        ).data?.role || 'trabajador');

      if (error) throw error;
      return data?.map(item => item.permissions).flat() || [];
    },
    enabled: !!user,
  });
};

export const useHasPermission = (permission: string) => {
  const { data: permissions = [] } = usePermissions();
  return permissions.some(p => p?.name === permission);
};