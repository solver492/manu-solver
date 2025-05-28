
-- Création de la table system_settings
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

-- Insertion des paramètres par défaut
INSERT INTO public.system_settings (id, company_name, company_address, company_phone, company_email, logo_url, backup_frequency, data_retention, maintenance_mode)
VALUES (1, 'ManutentionPro', '', '', '', '', 'daily', 365, false)
ON CONFLICT (id) DO NOTHING;

-- Politiques RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tous peuvent lire les paramètres système" ON system_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Seuls les admins peuvent modifier les paramètres système" ON system_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Fonction pour mettre à jour updated_at automatiquement
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
