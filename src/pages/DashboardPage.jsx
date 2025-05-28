import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Truck, Building, CalendarDays, TrendingUp, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient'; 
import { useToast } from "@/components/ui/use-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardPage = () => {
  const { user, getUsername } = useAuth();
  const { toast } = useToast();
  const [dispatches, setDispatches] = useState([]);
  const [clientSites, setClientSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    weeklyTrend: null,
    siteDistribution: null,
    monthlyActivity: null
  });

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
            site_id,
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

          // Générer les données pour les graphiques
          generateChartData(transformedDispatches, sitesData || []);
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

  const generateChartData = (dispatchesData, sitesData) => {
    // Graphique de tendance hebdomadaire (7 derniers jours)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const weeklyData = last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const dayDispatches = dispatchesData.filter(dispatch => 
        new Date(dispatch.created_at).toISOString().split('T')[0] === dateStr
      );
      return dayDispatches.reduce((sum, dispatch) => sum + (dispatch.quantity || 0), 0);
    });

    // Graphique de distribution par site (top 5)
    const siteActivity = dispatchesData.reduce((acc, dispatch) => {
      const siteName = dispatch.siteName || 'Site inconnu';
      acc[siteName] = (acc[siteName] || 0) + (dispatch.quantity || 0);
      return acc;
    }, {});

    const topSites = Object.entries(siteActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Graphique d'activité mensuelle (12 derniers mois)
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return date;
    });

    const monthlyData = last12Months.map(date => {
      const monthStr = date.toISOString().slice(0, 7);
      const monthDispatches = dispatchesData.filter(dispatch => 
        new Date(dispatch.created_at).toISOString().slice(0, 7) === monthStr
      );
      return monthDispatches.reduce((sum, dispatch) => sum + (dispatch.quantity || 0), 0);
    });

    setChartData({
      weeklyTrend: {
        labels: last7Days.map(date => 
          date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
        ),
        datasets: [{
          label: 'Manutentionnaires envoyés',
          data: weeklyData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      siteDistribution: {
        labels: topSites.map(([name]) => name),
        datasets: [{
          data: topSites.map(([, count]) => count),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(139, 92, 246)'
          ],
          borderWidth: 2
        }]
      },
      monthlyActivity: {
        labels: last12Months.map(date => 
          date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
        ),
        datasets: [{
          label: 'Activité mensuelle',
          data: monthlyData,
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false
        }]
      }
    });
  };

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

  // Options pour les graphiques
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
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

      {/* Cartes de statistiques */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Envoyés Aujourd'hui</CardTitle>
              <Users className="h-6 w-6 text-blue-100" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{totalDispatchedToday}</div>
              <p className="text-xs text-blue-200 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Nombre total pour aujourd'hui
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500 to-green-600 text-white transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Envoyés Ce Mois</CardTitle>
              <CalendarDays className="h-6 w-6 text-green-100" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{totalDispatchedThisMonth}</div>
              <p className="text-xs text-green-200 flex items-center mt-1">
                <BarChart3 className="h-3 w-3 mr-1" />
                Cumul mensuel en cours
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500 to-purple-600 text-white transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sites Clients</CardTitle>
              <Building className="h-6 w-6 text-purple-100" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{clientSites.length}</div>
              <p className="text-xs text-purple-200">Total sites enregistrés</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Envois</CardTitle>
              <Truck className="h-6 w-6 text-yellow-100" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{dispatchesThisMonth.length}</div>
              <p className="text-xs text-yellow-200">Opérations ce mois</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-blue-500"/>
                Tendance Hebdomadaire
              </CardTitle>
              <CardDescription>Évolution des envois sur les 7 derniers jours</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {chartData.weeklyTrend ? (
                <Line options={lineChartOptions} data={chartData.weeklyTrend} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Aucune donnée disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5 text-green-500"/>
                Répartition par Site
              </CardTitle>
              <CardDescription>Top 5 des sites actifs</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {chartData.siteDistribution ? (
                <Doughnut options={doughnutOptions} data={chartData.siteDistribution} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Aucune donnée disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-purple-500"/>
                Activité sur 12 Mois
              </CardTitle>
              <CardDescription>Évolution mensuelle des envois</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {chartData.monthlyActivity ? (
                <Bar options={barChartOptions} data={chartData.monthlyActivity} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Aucune donnée disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
              <CardDescription>Les 5 derniers envois effectués</CardDescription>
            </CardHeader>
            <CardContent>
              {dispatches.length > 0 ? (
                <ul className="space-y-3">
                  {dispatches.slice(0, 5).map((dispatch, index) => (
                    <motion.li 
                      key={dispatch.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex justify-between items-center p-3 bg-gradient-to-r from-secondary to-secondary/50 rounded-md hover:shadow-md transition-all duration-200"
                    >
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
                      <span className="font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full text-sm">
                        {dispatch.quantity} pers.
                      </span>
                    </motion.li>
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