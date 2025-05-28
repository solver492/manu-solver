
-- Création de la table system_settings pour les paramètres système
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    company_name TEXT DEFAULT 'ManutentionPro',
    company_address TEXT,
    company_phone TEXT,
    company_email TEXT,
    logo_url TEXT,
    backup_frequency TEXT DEFAULT 'daily' CHECK (backup_frequency IN ('hourly', 'daily', 'weekly', 'monthly')),
    data_retention INTEGER DEFAULT 365,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insérer les paramètres par défaut
INSERT INTO system_settings (id, company_name, backup_frequency, data_retention, maintenance_mode)
VALUES (1, 'ManutentionPro', 'daily', 365, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Politique RLS pour system_settings (accessible en lecture seule pour tous les utilisateurs authentifiés)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tous peuvent lire les paramètres système" ON system_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Seuls les admins peuvent modifier les paramètres système" ON system_settings
    FOR ALL USING (auth.role() = 'authenticated');
