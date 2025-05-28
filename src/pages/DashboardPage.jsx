import React, { useState, useEffect } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Users, Truck, Building, CalendarDays } from 'lucide-react';
    import { useAuth } from '@/contexts/AuthContext';
    import { motion } from 'framer-motion';
    import { supabase } from '@/lib/supabaseClient'; 
    import { useToast } from "@/components/ui/use-toast";


    const DashboardPage = () => {
      const { user, getUsername } = useAuth();
      const { toast } = useToast();
      const [dispatches, setDispatches] = useState([]);
      const [clientSites, setClientSites] = useState([]);
      const usernameDisplay = user ? getUsername() : 'Utilisateur';

      useEffect(() => {
        const fetchClientSites = async () => {
          const { data, error } = await supabase.from('client_sites').select('*');
          if (error) {
            console.error("Erreur de chargement des sites clients:", error);
            toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les sites clients." });
          } else {
            setClientSites(data);
          }
        };

        const fetchDispatches = async () => {
          const { data, error } = await supabase
            .from('dispatches')
            .select(`
              *,
              client_sites (name)
            `);
          if (error) {
            console.error("Erreur de chargement des envois:", error);
            toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger l'historique des envois." });
          } else {
            setDispatches(data.map(d => ({...d, siteName: d.client_sites.name })));
          }
        };
        
        fetchClientSites();
        fetchDispatches();
      }, [toast]);

      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().toISOString().slice(0, 7);

      const dispatchesToday = dispatches.filter(d => d.created_at.startsWith(today));
      const totalDispatchedToday = dispatchesToday.reduce((sum, d) => sum + d.quantity, 0);

      const dispatchesThisMonth = dispatches.filter(d => d.created_at.startsWith(currentMonth));
      const totalDispatchedThisMonth = dispatchesThisMonth.reduce((sum, d) => sum + d.quantity, 0);
      
      const siteActivity = dispatchesThisMonth.reduce((acc, dispatch) => {
        acc[dispatch.siteName] = (acc[dispatch.siteName] || 0) + dispatch.quantity;
        return acc;
      }, {});

      const sortedSiteActivity = Object.entries(siteActivity)
        .sort(([,a],[,b]) => b-a)
        .slice(0, 5);

      const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
      };
      
      const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      };

      return (
        <motion.div 
          className="space-y-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold text-primary">Bonjour, {usernameDisplay}!</motion.h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Manutentionnaires Envoyés (Aujourd'hui)</CardTitle>
                  <Users className="h-6 w-6 text-blue-100" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{totalDispatchedToday}</div>
                  <p className="text-xs text-blue-200">Nombre total pour aujourd'hui</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Manutentionnaires Envoyés (Ce Mois)</CardTitle>
                  <CalendarDays className="h-6 w-6 text-green-100" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{totalDispatchedThisMonth}</div>
                  <p className="text-xs text-green-200">Cumul mensuel en cours</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Nombre de Sites Clients</CardTitle>
                  <Building className="h-6 w-6 text-purple-100" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{clientSites.length}</div>
                  <p className="text-xs text-purple-200">Total sites enregistrés</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Envois (Ce Mois)</CardTitle>
                  <Truck className="h-6 w-6 text-yellow-100" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{dispatchesThisMonth.length}</div>
                  <p className="text-xs text-yellow-200">Nombre d'opérations d'envoi</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Sites Clients les Plus Actifs (Ce Mois)</CardTitle>
                  <CardDescription>Top 5 des sites par nombre de manutentionnaires reçus.</CardDescription>
                </CardHeader>
                <CardContent>
                  {sortedSiteActivity.length > 0 ? (
                    <ul className="space-y-3">
                      {sortedSiteActivity.map(([siteName, count]) => (
                        <li key={siteName} className="flex justify-between items-center p-2 bg-secondary rounded-md">
                          <span className="font-medium text-primary">{siteName}</span>
                          <span className="font-bold text-lg text-blue-600">{count}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Aucune activité ce mois-ci.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Graphiques de Tendance</CardTitle>
                  <CardDescription>Visualisation des envois (à implémenter).</CardDescription>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">Les graphiques seront disponibles bientôt.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      );
    };

    export default DashboardPage;