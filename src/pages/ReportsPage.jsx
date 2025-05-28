
    import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { BarChartHorizontalBig, FileText } from 'lucide-react';
    import { motion } from 'framer-motion';

    const ReportsPage = () => {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold text-primary">Rapports Mensuels</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><BarChartHorizontalBig className="mr-2 h-5 w-5 text-blue-500"/>Tableau de Bord Mensuel</CardTitle>
                <CardDescription>Visualisation des données mensuelles (à implémenter).</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">Les graphiques et statistiques mensuels seront disponibles ici.</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5 text-green-500"/>Rapport de Fin de Mois</CardTitle>
                <CardDescription>Génération de rapports PDF (à implémenter).</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">La génération de rapports PDF sera disponible bientôt.</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Note: Les fonctionnalités de rapport avancées nécessitent une intégration backend (Supabase) et potentiellement des bibliothèques de graphiques/PDF.</p>
          </div>
        </motion.div>
      );
    };

    export default ReportsPage;
  