import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { User, KeyRound, Bell, Palette, FileCog } from 'lucide-react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';

const SettingsPage = () => {
  const { user, updateUser, updatePassword, getUsername } = useAuth();
  const { toast } = useToast();
  
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoadingUsername, setIsLoadingUsername] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  
  // Paramètres de notification
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [notificationFrequency, setNotificationFrequency] = useState('immediate');
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  
  // Paramètres d'affichage
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');
  const [isLoadingDisplay, setIsLoadingDisplay] = useState(false);
  
  // Paramètres des rapports
  const [defaultDateRange, setDefaultDateRange] = useState('month');
  const [autoExport, setAutoExport] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  useEffect(() => {
    const loadUserSettings = async () => {
      if (user) {
        try {
          const { data: settings, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error) throw error;

          if (settings) {
            // Charger les paramètres de notification
            setEmailNotifications(settings.email_notifications || false);
            setPushNotifications(settings.push_notifications || false);
            setNotificationFrequency(settings.notification_frequency || 'immediate');
            
            // Charger les paramètres d'affichage
            setTheme(settings.theme || 'light');
            setFontSize(settings.font_size || 'medium');
            
            // Charger les paramètres des rapports
            setDefaultDateRange(settings.default_date_range || 'month');
            setAutoExport(settings.auto_export || false);
            setExportFormat(settings.export_format || 'pdf');
          }

          // Charger le nom d'utilisateur
          const username = getUsername();
          setCurrentUsername(username);
          setNewUsername(username);
        } catch (error) {
          console.error('Erreur lors du chargement des paramètres:', error);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de charger vos paramètres."
          });
        }
      }
    };

    loadUserSettings();
  }, [user, getUsername, toast]);

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    if (newUsername === currentUsername) {
      toast({ variant: "default", title: "Information", description: "Le nouveau nom d'utilisateur est identique à l'actuel." });
      return;
    }
    setIsLoadingUsername(true);
    try {
      await updateUser(newUsername);
      setCurrentUsername(newUsername);
      toast({ title: "Succès", description: "Nom d'utilisateur mis à jour." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message || "Impossible de mettre à jour le nom d'utilisateur." });
    } finally {
      setIsLoadingUsername(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast({ variant: "destructive", title: "Erreur", description: "Les nouveaux mots de passe ne correspondent pas." });
      return;
    }
    if (!newPassword) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez saisir un nouveau mot de passe." });
      return;
    }
    setIsLoadingPassword(true);
    try {
      await updatePassword(newPassword);
      toast({ title: "Succès", description: "Mot de passe mis à jour." });
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message || "Impossible de mettre à jour le mot de passe." });
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handleNotificationSettingsChange = async () => {
    setIsLoadingNotifications(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          email_notifications: emailNotifications,
          push_notifications: pushNotifications,
          notification_frequency: notificationFrequency,
        });

      if (error) throw error;

      toast({ title: "Succès", description: "Paramètres de notification mis à jour." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour les paramètres de notification." });
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleDisplaySettingsChange = async () => {
    setIsLoadingDisplay(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          theme,
          font_size: fontSize,
        });

      if (error) throw error;

      // Appliquer le thème
      document.documentElement.setAttribute('data-theme', theme);
      // Appliquer la taille de police
      document.documentElement.style.fontSize = {
        small: '14px',
        medium: '16px',
        large: '18px'
      }[fontSize];

      toast({ title: "Succès", description: "Paramètres d'affichage mis à jour." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour les paramètres d'affichage." });
    } finally {
      setIsLoadingDisplay(false);
    }
  };

  const handleReportSettingsChange = async () => {
    setIsLoadingReports(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          default_date_range: defaultDateRange,
          auto_export: autoExport,
          export_format: exportFormat,
        });

      if (error) throw error;

      toast({ title: "Succès", description: "Paramètres des rapports mis à jour." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour les paramètres des rapports." });
    } finally {
      setIsLoadingReports(false);
    }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (!user) {
    return <p>Chargement des informations utilisateur...</p>;
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-8 max-w-3xl mx-auto"
    >
      <h2 className="text-3xl font-bold text-primary mb-8">Paramètres</h2>

      <motion.div variants={cardVariants}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-blue-500"/>Profil Utilisateur
            </CardTitle>
            <CardDescription>Email (non modifiable ici): {user.email}</CardDescription>
          </CardHeader>
          <form onSubmit={handleUsernameChange}>
            <CardContent>
              <div>
                <Label htmlFor="newUsername">Nom d'affichage</Label>
                <Input 
                  id="newUsername" 
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)} 
                  disabled={isLoadingUsername}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoadingUsername || newUsername === currentUsername}>
                {isLoadingUsername ? "Sauvegarde..." : "Sauvegarder le nom d'affichage"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <KeyRound className="mr-2 h-5 w-5 text-green-500"/>Changer le mot de passe
            </CardTitle>
            <CardDescription>Mettez à jour votre mot de passe régulièrement pour plus de sécurité.</CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordChange}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  disabled={isLoadingPassword}
                />
              </div>
              <div>
                <Label htmlFor="confirmNewPassword">Confirmer le nouveau mot de passe</Label>
                <Input 
                  id="confirmNewPassword" 
                  type="password" 
                  value={confirmNewPassword} 
                  onChange={(e) => setConfirmNewPassword(e.target.value)} 
                  disabled={isLoadingPassword}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoadingPassword}>
                {isLoadingPassword ? "Sauvegarde..." : "Changer le mot de passe"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
      
      <motion.div variants={cardVariants}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-yellow-500"/>Notifications
            </CardTitle>
            <CardDescription>Gérez vos préférences de notification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications par email</Label>
                <p className="text-sm text-muted-foreground">Recevoir les notifications par email</p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                disabled={isLoadingNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications push</Label>
                <p className="text-sm text-muted-foreground">Recevoir les notifications dans le navigateur</p>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
                disabled={isLoadingNotifications}
              />
            </div>
            <div className="space-y-2">
              <Label>Fréquence des notifications</Label>
              <Select
                value={notificationFrequency}
                onValueChange={setNotificationFrequency}
                disabled={isLoadingNotifications}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir la fréquence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immédiate</SelectItem>
                  <SelectItem value="hourly">Toutes les heures</SelectItem>
                  <SelectItem value="daily">Quotidienne</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleNotificationSettingsChange}
              disabled={isLoadingNotifications}
            >
              {isLoadingNotifications ? "Sauvegarde..." : "Sauvegarder les préférences"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5 text-purple-500"/>Préférences d'Affichage
            </CardTitle>
            <CardDescription>Personnalisez l'apparence de l'application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Thème</Label>
              <Select
                value={theme}
                onValueChange={setTheme}
                disabled={isLoadingDisplay}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le thème" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Clair</SelectItem>
                  <SelectItem value="dark">Sombre</SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Taille de police</Label>
              <Select
                value={fontSize}
                onValueChange={setFontSize}
                disabled={isLoadingDisplay}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir la taille" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Petite</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleDisplaySettingsChange}
              disabled={isLoadingDisplay}
            >
              {isLoadingDisplay ? "Sauvegarde..." : "Sauvegarder l'apparence"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileCog className="mr-2 h-5 w-5 text-red-500"/>Configuration des Rapports
            </CardTitle>
            <CardDescription>Paramétrez la génération et le format des rapports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Période par défaut</Label>
              <Select
                value={defaultDateRange}
                onValueChange={setDefaultDateRange}
                disabled={isLoadingReports}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir la période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Semaine</SelectItem>
                  <SelectItem value="month">Mois</SelectItem>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                  <SelectItem value="year">Année</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Export automatique</Label>
                <p className="text-sm text-muted-foreground">Générer automatiquement les rapports</p>
              </div>
              <Switch
                checked={autoExport}
                onCheckedChange={setAutoExport}
                disabled={isLoadingReports}
              />
            </div>
            <div className="space-y-2">
              <Label>Format d'export</Label>
              <Select
                value={exportFormat}
                onValueChange={setExportFormat}
                disabled={isLoadingReports}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleReportSettingsChange}
              disabled={isLoadingReports}
            >
              {isLoadingReports ? "Sauvegarde..." : "Sauvegarder la configuration"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPage;