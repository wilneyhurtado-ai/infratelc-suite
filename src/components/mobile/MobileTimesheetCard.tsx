import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Clock, MapPin, Play, Square } from 'lucide-react';

interface TimesheetCardProps {
  timesheet?: any;
}

export const MobileTimesheetCard: React.FC<TimesheetCardProps> = ({ timesheet }) => {
  const { user } = useAuth();
  const { getCurrentPosition } = useMobile();
  const queryClient = useQueryClient();
  
  // Get user profile for tenant_id
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const timesheetMutation = useMutation({
    mutationFn: async ({ action, updates }: { action: 'check_in' | 'check_out'; updates: any }) => {
      const today = new Date().toISOString().split('T')[0];
      
      if (action === 'check_in') {
        const { error } = await supabase.from('timesheets').insert({
          employee_id: user?.id,
          date: today,
          check_in_time: new Date().toISOString(),
          tenant_id: userProfile?.tenant_id,
          ...updates
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('timesheets')
          .update({
            check_out_time: new Date().toISOString(),
            ...updates
          })
          .eq('id', timesheet?.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-timesheet'] });
      toast.success('Registro actualizado correctamente');
    }
  });

  const handleCheckIn = async () => {
    try {
      const position = await getCurrentPosition();
      timesheetMutation.mutate({
        action: 'check_in',
        updates: {
          location_check_in: {
            latitude: position.latitude,
            longitude: position.longitude,
            timestamp: position.timestamp
          }
        }
      });
    } catch (error) {
      console.error('Error checking in:', error);
      timesheetMutation.mutate({
        action: 'check_in',
        updates: {}
      });
    }
  };

  const handleCheckOut = async () => {
    try {
      const position = await getCurrentPosition();
      const checkInTime = new Date(timesheet.check_in_time);
      const checkOutTime = new Date();
      const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
      const overtimeHours = Math.max(0, totalHours - 8);

      timesheetMutation.mutate({
        action: 'check_out',
        updates: {
          total_hours: totalHours,
          overtime_hours: overtimeHours,
          location_check_out: {
            latitude: position.latitude,
            longitude: position.longitude,
            timestamp: position.timestamp
          }
        }
      });
    } catch (error) {
      console.error('Error checking out:', error);
      const checkInTime = new Date(timesheet.check_in_time);
      const checkOutTime = new Date();
      const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
      const overtimeHours = Math.max(0, totalHours - 8);

      timesheetMutation.mutate({
        action: 'check_out',
        updates: {
          total_hours: totalHours,
          overtime_hours: overtimeHours
        }
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = () => {
    if (!timesheet) return <Badge variant="outline">Sin registro</Badge>;
    if (timesheet.check_out_time) return <Badge variant="destructive">Finalizado</Badge>;
    return <Badge variant="secondary">En curso</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Registro del Día
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {timesheet ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Entrada:</span>
              <span className="font-medium">{formatTime(timesheet.check_in_time)}</span>
            </div>
            
            {timesheet.check_out_time && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Salida:</span>
                <span className="font-medium">{formatTime(timesheet.check_out_time)}</span>
              </div>
            )}
            
            {timesheet.total_hours && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Horas totales:</span>
                <span className="font-medium">{timesheet.total_hours.toFixed(1)}h</span>
              </div>
            )}
            
            {timesheet.overtime_hours > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Horas extra:</span>
                <span className="font-medium text-orange-600">{timesheet.overtime_hours.toFixed(1)}h</span>
              </div>
            )}

            {!timesheet.check_out_time && (
              <Button onClick={handleCheckOut} className="w-full">
                <Square className="w-4 h-4 mr-2" />
                Registrar Salida
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              No has registrado entrada hoy
            </p>
            <Button onClick={handleCheckIn} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              Registrar Entrada
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};