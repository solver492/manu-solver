
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
  const [loading, setLoading] = useState(true);
  const usernameDisplay = user ? getUsername() : 'Utilisateur';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Charger les sites clients
        const { data: sitesData, error: sitesError } = await supabase
          .from('client_sites')
          .select('*')
          .order('name');

        if (sitesError) {
          console.error("Erreur de chargement des sites clients:", sitesError);
          toast({ 
            variant: "destructive", 
            title: "Erreur", 
            description: "Impossible de charger les sites clients." 
          });
        } else {
          setClientSites(sitesData || []);
        }

        // Charger les envois avec jointure
        const { data: dispatchesData, error: dispatchesError } = await supabase
          .from('dispatches')
          .select(`
            id,
            quantity,
            created_at,
            client_site_id,
            client_sites!inner (
              id,
              name
            )
          `)
          .order('created_at', { ascending: false });

        if (dispatchesError) {
          console.error("Erreur de chargement des envois:", dispatchesError);
          toast({ 
            variant: "destructive", 
            title: "Erreur", 
            description: "Impossible de charger l'historique des envois." 
          });
        } else {
          // Transformer les données pour inclure le nom du site
          const transformedDispatches = (dispatchesData || []).map(dispatch => ({
            ...dispatch,
            siteName: dispatch.client_sites?.name || 'Site inconnu'
          }));
          setDispatches(transformedDispatches);
        }
      } catch (error) {
        console.error("Erreur générale:", error);
        toast({ 
          variant: "destructive", 
          title: "Erreur", 
          description: "Une erreur s'est produite lors du chargement des données." 
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  // Obtenir les dates pour les filtres
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

  // Filtrer les envois d'aujourd'hui
  const dispatchesToday = dispatches.filter(dispatch => {
    const dispatchDate = new Date(dispatch.created_at).toISOString().split('T')[0];
    return dispatchDate === today;
  });

  const totalDispatchedToday = dispatchesToday.reduce((sum, dispatch) => sum + (dispatch.quantity || 0), 0);

  // Filtrer les envois de ce mois
  const dispatchesThisMonth = dispatches.filter(dispatch => {
    const dispatchMonth = new Date(dispatch.created_at).toISOString().slice(0, 7);
    return dispatchMonth === currentMonth;
  });

  const totalDispatchedThisMonth = dispatchesThisMonth.reduce((sum, dispatch) => sum + (dispatch.quantity || 0), 0);
  
  // Calculer l'activité par site
  const siteActivity = dispatchesThisMonth.reduce((acc, dispatch) => {
    const siteName = dispatch.siteName || 'Site inconnu';
    acc[siteName] = (acc[siteName] || 0) + (dispatch.quantity || 0);
    return acc;
  }, {});

  const sortedSiteActivity = Object.entries(siteActivity)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2 variants={itemVariants} className="text-3xl font-bold text-primary">
        Bonjour, {usernameDisplay}!
      </motion.h2>
      
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
                  {sortedSiteActivity.map(([siteName, count], index) => (
                    <li key={siteName} className="flex justify-between items-center p-3 bg-secondary rounded-md hover:bg-secondary/80 transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full">
                          {index + 1}
                        </span>
                        <span className="font-medium text-primary">{siteName}</span>
                      </div>
                      <span className="font-bold text-lg text-blue-600">{count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <Building className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-muted-foreground">Aucune activité ce mois-ci.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
              <CardDescription>Les 5 derniers envois effectués.</CardDescription>
            </CardHeader>
            <CardContent>
              {dispatches.length > 0 ? (
                <ul className="space-y-3">
                  {dispatches.slice(0, 5).map((dispatch) => (
                    <li key={dispatch.id} className="flex justify-between items-center p-3 bg-secondary rounded-md">
                      <div>
                        <p className="font-medium text-primary">{dispatch.siteName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(dispatch.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className="font-bold text-green-600">{dispatch.quantity} pers.</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <Truck className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-muted-foreground">Aucun envoi enregistré.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
