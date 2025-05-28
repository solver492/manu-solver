-- Création de la table user_settings
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT DEFAULT '',
    company TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'en', 'es')),
    notifications_email BOOLEAN DEFAULT true,
    notifications_push BOOLEAN DEFAULT true,
    auto_refresh BOOLEAN DEFAULT true,
    refresh_interval INTEGER DEFAULT 30,
    default_view TEXT DEFAULT 'dashboard' CHECK (default_view IN ('dashboard', 'sites', 'history')),
    items_per_page INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Politiques RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs peuvent voir leurs propres paramètres" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent modifier leurs propres paramètres" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_settings_updated_at();