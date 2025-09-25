import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  MapPin, 
  Clock, 
  Camera, 
  CheckCircle, 
  PlayCircle, 
  PauseCircle,
  Navigation 
} from 'lucide-react';

interface WorkOrderCardProps {
  workOrder: any;
}

export const MobileWorkOrderCard: React.FC<WorkOrderCardProps> = ({ workOrder }) => {
  const { takePhoto, getCurrentPosition } = useMobile();
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const updateOrderMutation = useMutation({
    mutationFn: async ({ status, updates }: { status: string; updates: any }) => {
      const { error } = await supabase
        .from('work_orders')
        .update({
          status,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', workOrder.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-work-orders'] });
      toast.success('Orden actualizada correctamente');
    }
  });

  const handleStartWork = async () => {
    try {
      const position = await getCurrentPosition();
      updateOrderMutation.mutate({
        status: 'in_progress',
        updates: {
          started_at: new Date().toISOString(),
          location_start: {
            latitude: position.latitude,
            longitude: position.longitude,
            timestamp: position.timestamp
          }
        }
      });
    } catch (error) {
      console.error('Error starting work:', error);
      updateOrderMutation.mutate({
        status: 'in_progress',
        updates: { started_at: new Date().toISOString() }
      });
    }
  };

  const handleCompleteWork = async () => {
    try {
      const position = await getCurrentPosition();
      updateOrderMutation.mutate({
        status: 'completed',
        updates: {
          completed_at: new Date().toISOString(),
          completion_notes: notes,
          photos: photos,
          location_end: {
            latitude: position.latitude,
            longitude: position.longitude,
            timestamp: position.timestamp
          }
        }
      });
    } catch (error) {
      console.error('Error completing work:', error);
      updateOrderMutation.mutate({
        status: 'completed',
        updates: {
          completed_at: new Date().toISOString(),
          completion_notes: notes,
          photos: photos
        }
      });
    }
  };

  const handleTakePhoto = async () => {
    try {
      const photo = await takePhoto();
      if (photo.dataUrl) {
        setPhotos(prev => [...prev, photo.dataUrl!]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      toast.error('Error al tomar la foto');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'default';
      case 'in_progress': return 'secondary';
      case 'completed': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'assigned': return 'Asignada';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completada';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{workOrder.title}</CardTitle>
            <p className="text-sm text-muted-foreground">#{workOrder.order_number}</p>
          </div>
          <Badge variant={getStatusColor(workOrder.status)}>
            {getStatusLabel(workOrder.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4" />
          <span>{workOrder.sites?.name}</span>
        </div>
        
        {workOrder.sites?.address && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Navigation className="w-4 h-4" />
            <span>{workOrder.sites.address}</span>
          </div>
        )}

        {workOrder.description && (
          <p className="text-sm">{workOrder.description}</p>
        )}

        {workOrder.estimated_hours && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>{workOrder.estimated_hours}h estimadas</span>
          </div>
        )}

        {workOrder.status === 'in_progress' && (
          <div className="space-y-3">
            <Textarea
              placeholder="Notas de finalización..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleTakePhoto}>
                <Camera className="w-4 h-4 mr-2" />
                Foto
              </Button>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {workOrder.status === 'assigned' && (
            <Button onClick={handleStartWork} className="flex-1">
              <PlayCircle className="w-4 h-4 mr-2" />
              Iniciar
            </Button>
          )}
          
          {workOrder.status === 'in_progress' && (
            <Button onClick={handleCompleteWork} className="flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Completar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};