import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { motion } from 'framer-motion';
import { Settings, User, Bell, Palette, Database, Save, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // État des paramètres utilisateur
  const [userSettings, setUserSettings] = useState({
    full_name: '',
    company: '',
    phone: '',
    theme: 'light',
    notifications_email: true,
    notifications_push: true,
    default_view: 'dashboard',
    items_per_page: 10
  });

  // État des paramètres système
  const [systemSettings, setSystemSettings] = useState({
    company_name: 'ManutentionPro',
    company_address: '',
    company_phone: '',
    company_email: '',
    logo_url: '',
    backup_frequency: 'daily',
    data_retention: 365,
    maintenance_mode: false
  });

  useEffect(() => {
    loadUserSettings();
    loadSystemSettings();
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const loadedTheme = data.theme || userSettings.theme || 'light';
        setUserSettings({
          full_name: data.full_name || '',
          company: data.company || '',
          phone: data.phone || '',
          theme: loadedTheme,
          notifications_email: data.notifications_email ?? true,
          notifications_push: data.notifications_push ?? true,
          default_view: data.default_view || 'dashboard',
          items_per_page: data.items_per_page || 10
        });

        // Appliquer le thème chargé
        if (data.theme && data.theme !== userSettings.theme) {
          // Assuming you have a function called changeTheme in your AuthContext
          // and it's accessible via useAuth
          // const { changeTheme } = useAuth();  // Make sure to get it from the hook
          // changeTheme(data.theme);
        }
      } else {
        // Créer les paramètres par défaut si ils n'existent pas
        await createDefaultUserSettings();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres utilisateur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les paramètres utilisateur."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultUserSettings = async () => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .insert([{
          user_id: user.id,
          ...userSettings
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la création des paramètres par défaut:', error);
    }
  };

  const loadSystemSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSystemSettings(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres système:', error);
    }
  };

  const saveUserSettings = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...userSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Paramètres utilisateur sauvegardés avec succès."
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveSystemSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          id: 1,
          ...systemSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Paramètres système sauvegardés avec succès."
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres système."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUserSettingChange = (key, value) => {
    setUserSettings(prev => ({ ...prev, [key]: value }));

    // Si c'est le thème qui change, mettre à jour immédiatement
    if (key === 'theme') {
      // Le thème sera appliqué lors de la sauvegarde
      console.log('Thème sélectionné:', value);
    }
  };

  const handleSystemSettingChange = (key, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetUserSettings = () => {
    setUserSettings({
      full_name: '',
      company: '',
      phone: '',
      theme: 'light',
      notifications_email: true,
      notifications_push: true,
      default_view: 'dashboard',
      items_per_page: 10
    });
    toast({
      title: "Paramètres réinitialisés",
      description: "Les paramètres ont été remis aux valeurs par défaut."
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des paramètres...</span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary">Paramètres</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Paramètres Utilisateur */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-blue-500"/>
              Profil Utilisateur
            </CardTitle>
            <CardDescription>
              Gérez vos informations personnelles et préférences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                value={userSettings.full_name ?? ''}
                onChange={(e) => handleUserSettingChange('full_name', e.target.value)}
                placeholder="Votre nom complet"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Entreprise</Label>
              <Input
                id="company"
                value={userSettings.company ?? ''}
                onChange={(e) => handleUserSettingChange('company', e.target.value)}
                placeholder="Nom de votre entreprise"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={userSettings.phone ?? ''}
                onChange={(e) => handleUserSettingChange('phone', e.target.value)}
                placeholder="Votre numéro de téléphone"
              />
            </div>

            <div className="flex justify-between">
              <Button 
                onClick={saveUserSettings} 
                disabled={isSaving}
                className="flex items-center"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetUserSettings}
                disabled={isSaving}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Préférences Interface */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5 text-purple-500"/>
              Préférences Interface
            </CardTitle>
            <CardDescription>
              Personnalisez l'apparence et le comportement de l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Thème</Label>
              <Select 
                value={userSettings.theme} 
                onValueChange={(value) => handleUserSettingChange('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un thème" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Clair</SelectItem>
                  <SelectItem value="dark">Sombre</SelectItem>
                  <SelectItem value="auto">Automatique</SelectItem>
                </SelectContent>
              </Select>
            </div>



            <div className="space-y-2">
              <Label htmlFor="defaultView">Vue par défaut</Label>
              <Select 
                value={userSettings.default_view} 
                onValueChange={(value) => handleUserSettingChange('default_view', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la vue par défaut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">Tableau de bord</SelectItem>
                  <SelectItem value="sites">Sites clients</SelectItem>
                  <SelectItem value="history">Historique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemsPerPage">Éléments par page</Label>
              <Select 
                value={userSettings.items_per_page.toString()} 
                onValueChange={(value) => handleUserSettingChange('items_per_page', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nombre d'éléments par page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>• Interface personnalisable selon vos préférences</p>
              <p>• Thème adaptatif pour le confort visuel</p>
              <p>• Navigation optimisée pour la productivité</p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-yellow-500"/>
              Notifications
            </CardTitle>
            <CardDescription>
              Configurez vos préférences de notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notificationsEmail">Notifications par email</Label>
              <Switch
                id="notificationsEmail"
                checked={userSettings.notifications_email}
                onCheckedChange={(checked) => handleUserSettingChange('notifications_email', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notificationsPush">Notifications push</Label>
              <Switch
                id="notificationsPush"
                checked={userSettings.notifications_push}
                onCheckedChange={(checked) => handleUserSettingChange('notifications_push', checked)}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <p>• Recevez des notifications pour les nouveaux envois</p>
              <p>• Alertes pour les seuils de stock</p>
              <p>• Rappels de maintenance</p>
            </div>
          </CardContent>
        </Card>

        {/* Paramètres Système */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5 text-green-500"/>
              Paramètres Système
            </CardTitle>
            <CardDescription>
              Configuration générale de l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nom de l'entreprise</Label>
              <Input
                id="companyName"
                value={systemSettings.company_name ?? ''}
                onChange={(e) => handleSystemSettingChange('company_name', e.target.value)}
                placeholder="Nom de votre entreprise"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyEmail">Email de l'entreprise</Label>
              <Input
                id="companyEmail"
                type="email"
                value={systemSettings.company_email ?? ''}
                onChange={(e) => handleSystemSettingChange('company_email', e.target.value)}
                placeholder="contact@entreprise.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backupFrequency">Fréquence de sauvegarde</Label>
              <Select 
                value={systemSettings.backup_frequency} 
                onValueChange={(value) => handleSystemSettingChange('backup_frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la fréquence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Toutes les heures</SelectItem>
                  <SelectItem value="daily">Quotidienne</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuelle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataRetention">Rétention des données (jours)</Label>
              <Input
                id="dataRetention"
                type="number"
                min="30"
                max="3650"
                value={systemSettings.data_retention}
                onChange={(e) => handleSystemSettingChange('data_retention', parseInt(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="maintenanceMode">Mode maintenance</Label>
              <Switch
                id="maintenanceMode"
                checked={systemSettings.maintenance_mode}
                onCheckedChange={(checked) => handleSystemSettingChange('maintenance_mode', checked)}
              />
            </div>

            <Button 
              onClick={saveSystemSettings} 
              disabled={isSaving}
              className="w-full flex items-center justify-center"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder les paramètres système'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default SettingsPage;