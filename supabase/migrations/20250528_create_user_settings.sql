
-- Création de la table user_settings pour les paramètres utilisateur
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    company TEXT,
    phone TEXT,
    address TEXT,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'en', 'es')),
    notifications_email BOOLEAN DEFAULT TRUE,
    notifications_push BOOLEAN DEFAULT TRUE,
    auto_refresh BOOLEAN DEFAULT TRUE,
    refresh_interval INTEGER DEFAULT 30 CHECK (refresh_interval >= 10 AND refresh_interval <= 300),
    default_view TEXT DEFAULT 'dashboard' CHECK (default_view IN ('dashboard', 'sites', 'history')),
    items_per_page INTEGER DEFAULT 10 CHECK (items_per_page IN (5, 10, 20, 50)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs peuvent voir leurs propres paramètres" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent insérer leurs propres paramètres" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent modifier leurs propres paramètres" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent supprimer leurs propres paramètres" ON user_settings
    FOR DELETE USING (auth.uid() = user_id);
