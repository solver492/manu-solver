
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    full_name: '',
    company: '',
    phone: '',
    theme: 'light',
    notifications_email: true,
    notifications_push: true,
    auto_refresh: true,
    refresh_interval: 30,
    default_view: 'dashboard',
    items_per_page: 10
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // S'assurer que toutes les propriétés ont des valeurs par défaut
        const sanitizedData = {
          full_name: data.full_name ?? '',
          company: data.company ?? '',
          phone: data.phone ?? '',
          theme: data.theme ?? 'light',
          notifications_email: data.notifications_email ?? true,
          notifications_push: data.notifications_push ?? true,
          auto_refresh: data.auto_refresh ?? true,
          refresh_interval: data.refresh_interval ?? 30,
          default_view: data.default_view ?? 'dashboard',
          items_per_page: data.items_per_page ?? 10
        };
        setSettings(prev => ({ ...prev, ...sanitizedData }));
      } else {
        // Créer les paramètres par défaut
        await createDefaultSettings();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .insert([{
          user_id: user.id,
          ...settings
        }]);

      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...newSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev, ...newSettings }));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const resetSettings = () => {
    const defaultSettings = {
      full_name: '',
      company: '',
      phone: '',
      theme: 'light',
      notifications_email: true,
      notifications_push: true,
      auto_refresh: true,
      refresh_interval: 30,
      default_view: 'dashboard',
      items_per_page: 10
    };
    setSettings(defaultSettings);
    return defaultSettings;
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings,
    refreshSettings: loadSettings
  };
};
