
-- 1. Vérifier la structure de la table user_settings
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier si la table user_settings existe
SELECT table_name, table_schema
FROM information_schema.tables 
WHERE table_name = 'user_settings';

-- 3. Vérifier les données existantes dans user_settings
SELECT * FROM public.user_settings LIMIT 5;

-- 4. Vérifier la structure de la table system_settings
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'system_settings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Vérifier si la table system_settings existe
SELECT table_name, table_schema
FROM information_schema.tables 
WHERE table_name = 'system_settings';

-- 6. Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('user_settings', 'system_settings');

-- 7. Compter les enregistrements dans chaque table
SELECT 'user_settings' as table_name, COUNT(*) as count FROM public.user_settings
UNION ALL
SELECT 'system_settings' as table_name, COUNT(*) as count FROM public.system_settings;
