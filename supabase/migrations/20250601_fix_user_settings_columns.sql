
-- Ajouter les colonnes manquantes à la table user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS auto_refresh BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS refresh_interval INTEGER DEFAULT 30;

-- Mettre à jour les enregistrements existants avec les valeurs par défaut
UPDATE public.user_settings 
SET 
    auto_refresh = true,
    refresh_interval = 30
WHERE auto_refresh IS NULL OR refresh_interval IS NULL;

-- Créer la table system_settings si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.system_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    company_name TEXT DEFAULT 'ManutentionPro',
    company_address TEXT DEFAULT '',
    company_phone TEXT DEFAULT '',
    company_email TEXT DEFAULT '',
    logo_url TEXT DEFAULT '',
    backup_frequency TEXT DEFAULT 'daily' CHECK (backup_frequency IN ('hourly', 'daily', 'weekly', 'monthly')),
    data_retention INTEGER DEFAULT 365,
    maintenance_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter une contrainte pour s'assurer qu'il n'y a qu'un seul enregistrement
ALTER TABLE public.system_settings 
ADD CONSTRAINT single_system_settings CHECK (id = 1);

-- Politiques RLS pour system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seuls les admins peuvent voir les paramètres système" ON system_settings
    FOR SELECT USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les paramètres système" ON system_settings
    FOR ALL USING (true);

-- Fonction pour mettre à jour updated_at automatiquement pour system_settings
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_system_settings_updated_at();

-- Insérer l'enregistrement par défaut pour system_settings
INSERT INTO public.system_settings (id) 
VALUES (1) 
ON CONFLICT (id) DO NOTHING;
