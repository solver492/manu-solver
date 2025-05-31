
-- Supprimer et recréer la table user_settings avec toutes les colonnes
DROP TABLE IF EXISTS public.user_settings CASCADE;

-- Créer la table user_settings avec toutes les colonnes nécessaires
CREATE TABLE public.user_settings (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT DEFAULT '',
    company TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    notifications_email BOOLEAN DEFAULT true,
    notifications_push BOOLEAN DEFAULT true,
    auto_refresh BOOLEAN DEFAULT true,
    refresh_interval INTEGER DEFAULT 30,
    default_view TEXT DEFAULT 'dashboard' CHECK (default_view IN ('dashboard', 'sites', 'history', 'reports')),
    items_per_page INTEGER DEFAULT 10 CHECK (items_per_page IN (10, 25, 50, 100)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Les utilisateurs peuvent voir leurs propres paramètres" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres paramètres" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_settings_updated_at();

-- Insérer les paramètres par défaut pour les utilisateurs existants
INSERT INTO public.user_settings (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
