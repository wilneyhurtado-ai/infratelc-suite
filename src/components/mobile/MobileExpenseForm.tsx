import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Camera, X, Receipt } from 'lucide-react';

interface ExpenseFormProps {
  onClose: () => void;
}

export const MobileExpenseForm: React.FC<ExpenseFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { takePhoto } = useMobile();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category_id: '',
    site_id: '',
    document_number: '',
    notes: ''
  });
  const [photos, setPhotos] = useState<string[]>([]);

  const { data: sites } = useQuery({
    queryKey: ['sites-mobile'],
    queryFn: async () => {
      const { data } = await supabase
        .from('sites')
        .select('id, name')
        .eq('status', 'Activo');
      return data || [];
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['expense-categories-mobile'],
    queryFn: async () => {
      const { data } = await supabase
        .from('expense_categories')
        .select('id, name')
        .order('name');
      return data || [];
    }
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      const { error } = await supabase.from('expenses').insert({
        ...expenseData,
        created_by: user?.id,
        expense_date: new Date().toISOString().split('T')[0],
        approval_status: 'pending'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-expenses'] });
      toast.success('Rendición creada correctamente');
      onClose();
    },
    onError: (error) => {
      console.error('Error creating expense:', error);
      toast.error('Error al crear la rendición');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.category_id || !formData.site_id) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    createExpenseMutation.mutate({
      ...formData,
      amount: parseFloat(formData.amount),
      photos: photos
    });
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

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Nueva Rendición
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Monto *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción *</Label>
            <Input
              id="description"
              placeholder="Descripción del gasto"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Categoría *</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="site">Sitio *</Label>
            <Select 
              value={formData.site_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, site_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar sitio" />
              </SelectTrigger>
              <SelectContent>
                {sites?.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="document_number">Número de Documento</Label>
            <Input
              id="document_number"
              placeholder="Número de factura/boleta"
              value={formData.document_number}
              onChange={(e) => setFormData(prev => ({ ...prev, document_number: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Fotos del Recibo</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleTakePhoto}>
                <Camera className="w-4 h-4 mr-2" />
                Tomar Foto
              </Button>
            </div>
            
            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Recibo ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={createExpenseMutation.isPending}
            >
              {createExpenseMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};