
-- Ajouter les colonnes manquantes à la table user_settings
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS auto_refresh BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS refresh_interval INTEGER DEFAULT 30;

-- Mettre à jour les paramètres existants avec les valeurs par défaut
UPDATE user_settings 
SET 
  auto_refresh = true,
  refresh_interval = 30
WHERE auto_refresh IS NULL OR refresh_interval IS NULL;
