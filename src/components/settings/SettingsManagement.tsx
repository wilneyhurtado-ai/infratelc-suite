import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Settings, 
  User, 
  Building2, 
  Shield, 
  Bell, 
  Palette, 
  Database,
  Mail,
  Clock,
  DollarSign,
  FileText,
  Key
} from "lucide-react";

interface TenantSettings {
  company_name?: string;
  company_rut?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  currency?: string;
  timezone?: string;
  fiscal_year_start?: string;
  default_overtime_rate?: number;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  auto_approve_expenses?: boolean;
  expense_approval_limit?: number;
  require_photos_expenses?: boolean;
  allow_mobile_check_in?: boolean;
  geofencing_enabled?: boolean;
  backup_frequency?: string;
  data_retention_months?: number;
}

const SettingsManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("company");

  // Get current tenant and settings
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*, tenants(*)')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: tenantSettings, isLoading } = useQuery({
    queryKey: ['tenant-settings', profile?.tenant_id],
    queryFn: async () => {
      if (!profile?.tenant_id) return null;
      const { data, error } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', profile.tenant_id)
        .single();
      
      if (error) throw error;
      return (data?.settings as TenantSettings) || {};
    },
    enabled: !!profile?.tenant_id,
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<TenantSettings>) => {
      if (!profile?.tenant_id) throw new Error('No tenant found');
      
      const { error } = await supabase
        .from('tenants')
        .update({ 
          settings: { ...tenantSettings, ...newSettings },
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.tenant_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-settings'] });
      toast({
        title: "Configuración actualizada",
        description: "Los cambios se han guardado exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (key: keyof TenantSettings, value: any) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Settings className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold text-foreground">Configuración del Sistema</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-3xl font-bold text-foreground">Configuración del Sistema</h2>
            <p className="text-muted-foreground">
              Administra la configuración de tu organización
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-primary">
          {profile?.tenants?.name || "Organización"}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Empresa</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Gastos</span>
          </TabsTrigger>
          <TabsTrigger value="timesheets" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Horarios</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Sistema</span>
          </TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nombre de la Empresa</Label>
                  <Input
                    id="company_name"
                    value={tenantSettings?.company_name || ''}
                    onChange={(e) => handleSettingChange('company_name', e.target.value)}
                    placeholder="Nombre de tu empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_rut">RUT de la Empresa</Label>
                  <Input
                    id="company_rut"
                    value={tenantSettings?.company_rut || ''}
                    onChange={(e) => handleSettingChange('company_rut', e.target.value)}
                    placeholder="12.345.678-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_email">Email Corporativo</Label>
                  <Input
                    id="company_email"
                    type="email"
                    value={tenantSettings?.company_email || ''}
                    onChange={(e) => handleSettingChange('company_email', e.target.value)}
                    placeholder="contacto@empresa.cl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_phone">Teléfono</Label>
                  <Input
                    id="company_phone"
                    value={tenantSettings?.company_phone || ''}
                    onChange={(e) => handleSettingChange('company_phone', e.target.value)}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_address">Dirección</Label>
                <Textarea
                  id="company_address"
                  value={tenantSettings?.company_address || ''}
                  onChange={(e) => handleSettingChange('company_address', e.target.value)}
                  placeholder="Dirección completa de la empresa"
                  rows={3}
                />
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Select
                    value={tenantSettings?.currency || 'CLP'}
                    onValueChange={(value) => handleSettingChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLP">Peso Chileno (CLP)</SelectItem>
                      <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select
                    value={tenantSettings?.timezone || 'America/Santiago'}
                    onValueChange={(value) => handleSettingChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Santiago">Santiago (UTC-3)</SelectItem>
                      <SelectItem value="America/New_York">Nueva York (UTC-5)</SelectItem>
                      <SelectItem value="Europe/Madrid">Madrid (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configuración de Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notificaciones por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir notificaciones importantes por correo electrónico
                  </p>
                </div>
                <Switch
                  checked={tenantSettings?.email_notifications ?? true}
                  onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notificaciones SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir alertas críticas por mensaje de texto
                  </p>
                </div>
                <Switch
                  checked={tenantSettings?.sms_notifications ?? false}
                  onCheckedChange={(checked) => handleSettingChange('sms_notifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Settings */}
        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Configuración de Gastos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Aprobación Automática de Gastos</Label>
                  <p className="text-sm text-muted-foreground">
                    Aprobar automáticamente gastos bajo cierto monto
                  </p>
                </div>
                <Switch
                  checked={tenantSettings?.auto_approve_expenses ?? false}
                  onCheckedChange={(checked) => handleSettingChange('auto_approve_expenses', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense_approval_limit">Límite de Aprobación Automática</Label>
                <Input
                  id="expense_approval_limit"
                  type="number"
                  value={tenantSettings?.expense_approval_limit || 0}
                  onChange={(e) => handleSettingChange('expense_approval_limit', Number(e.target.value))}
                  placeholder="50000"
                />
                <p className="text-sm text-muted-foreground">
                  Gastos por debajo de este monto se aprobarán automáticamente
                </p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Requerir Fotos en Gastos</Label>
                  <p className="text-sm text-muted-foreground">
                    Obligar adjuntar fotografías en todos los gastos
                  </p>
                </div>
                <Switch
                  checked={tenantSettings?.require_photos_expenses ?? true}
                  onCheckedChange={(checked) => handleSettingChange('require_photos_expenses', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timesheets Settings */}
        <TabsContent value="timesheets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Configuración de Horarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Permitir Check-in Móvil</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir que los trabajadores marquen entrada desde móviles
                  </p>
                </div>
                <Switch
                  checked={tenantSettings?.allow_mobile_check_in ?? true}
                  onCheckedChange={(checked) => handleSettingChange('allow_mobile_check_in', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Geofencing Habilitado</Label>
                  <p className="text-sm text-muted-foreground">
                    Verificar ubicación al marcar entrada/salida
                  </p>
                </div>
                <Switch
                  checked={tenantSettings?.geofencing_enabled ?? false}
                  onCheckedChange={(checked) => handleSettingChange('geofencing_enabled', checked)}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="default_overtime_rate">Tarifa de Horas Extra (%)</Label>
                <Input
                  id="default_overtime_rate"
                  type="number"
                  step="0.1"
                  value={tenantSettings?.default_overtime_rate || 50}
                  onChange={(e) => handleSettingChange('default_overtime_rate', Number(e.target.value))}
                  placeholder="50"
                />
                <p className="text-sm text-muted-foreground">
                  Porcentaje adicional para el cálculo de horas extra
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configuración de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Políticas de Acceso</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Sesión automática de cierre</Label>
                      <Select defaultValue="8h">
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1h">1h</SelectItem>
                          <SelectItem value="4h">4h</SelectItem>
                          <SelectItem value="8h">8h</SelectItem>
                          <SelectItem value="24h">24h</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Backup y Retención</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="backup_frequency">Frecuencia de Backup</Label>
                      <Select
                        value={tenantSettings?.backup_frequency || 'daily'}
                        onValueChange={(value) => handleSettingChange('backup_frequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Diario</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data_retention_months">Retención de Datos (meses)</Label>
                      <Input
                        id="data_retention_months"
                        type="number"
                        value={tenantSettings?.data_retention_months || 36}
                        onChange={(e) => handleSettingChange('data_retention_months', Number(e.target.value))}
                        placeholder="36"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configuración del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Información del Sistema</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Versión:</span>
                      <span>1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Última actualización:</span>
                      <span>{new Date().toLocaleDateString('es-CL')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base de datos:</span>
                      <span className="text-green-600">Conectada</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Acciones de Mantenimiento</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Exportar Configuración
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Database className="h-4 w-4 mr-2" />
                      Limpiar Cache
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Key className="h-4 w-4 mr-2" />
                      Regenerar Claves API
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsManagement;