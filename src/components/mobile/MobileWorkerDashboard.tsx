import React, { useState } from 'react';
import { MobileLayout } from './MobileLayout';
import { MobileWorkOrderCard } from './MobileWorkOrderCard';
import { MobileTimesheetCard } from './MobileTimesheetCard';
import { MobileExpenseForm } from './MobileExpenseForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Clock, Receipt, Wrench } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const MobileWorkerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const { data: workOrders } = useQuery({
    queryKey: ['mobile-work-orders', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('work_orders')
        .select(`
          *,
          sites(name, address)
        `)
        .eq('assigned_to', user?.id)
        .in('status', ['assigned', 'in_progress'])
        .order('priority', { ascending: false });
      return data || [];
    },
    enabled: !!user
  });

  const { data: todayTimesheet } = useQuery({
    queryKey: ['mobile-timesheet', user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('timesheets')
        .select('*')
        .eq('employee_id', user?.id)
        .eq('date', today)
        .single();
      return data;
    },
    enabled: !!user
  });

  return (
    <MobileLayout title="Campo Móvil">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Panel</TabsTrigger>
          <TabsTrigger value="orders">Órdenes</TabsTrigger>
          <TabsTrigger value="timesheet">Horario</TabsTrigger>
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Órdenes Activas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {workOrders?.length || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Órdenes asignadas hoy
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Estado del Día
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {todayTimesheet?.total_hours || 0}h
                </div>
                <p className="text-sm text-muted-foreground">
                  Horas trabajadas hoy
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {workOrders?.map((order) => (
            <MobileWorkOrderCard key={order.id} workOrder={order} />
          ))}
          {!workOrders?.length && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No hay órdenes asignadas</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timesheet" className="space-y-4">
          <MobileTimesheetCard timesheet={todayTimesheet} />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Rendiciones</h2>
            <Button onClick={() => setShowExpenseForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva
            </Button>
          </div>
          
          {showExpenseForm && (
            <MobileExpenseForm onClose={() => setShowExpenseForm(false)} />
          )}
        </TabsContent>
      </Tabs>
    </MobileLayout>
  );
};