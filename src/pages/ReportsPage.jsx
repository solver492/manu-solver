import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChartHorizontalBig, FileText, Download, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReportsPage = () => {
  const [monthlyData, setMonthlyData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Options pour le graphique
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Envois par Site Client',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  useEffect(() => {
    // Cleanup function pour éviter les problèmes de concurrence
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await fetchMonthlyData();
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [selectedMonth]);

  const fetchMonthlyData = async () => {
    setIsLoading(true);
    
    // Réinitialiser les données avant de charger
    setMonthlyData(null);
    
    try {
      // Calculer les dates de début et fin du mois avec plus de précision
      const startDate = new Date(selectedMonth + '-01T00:00:00.000Z');
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);

      console.log(`Chargement des données pour ${selectedMonth}:`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // Récupérer tous les sites d'abord
      const { data: allSites, error: sitesError } = await supabase
        .from('client_sites')
        .select('id, name')
        .order('name');

      if (sitesError) {
        console.error('Erreur lors du chargement des sites:', sitesError);
        throw sitesError;
      }

      if (!allSites || allSites.length === 0) {
        throw new Error('Aucun site trouvé');
      }

      // Récupérer les envois pour la période
      const { data: dispatches, error: dispatchError } = await supabase
        .from('dispatches')
        .select(`
          quantity,
          created_at,
          site_id,
          client_sites!inner (
            id,
            name
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (dispatchError) {
        console.error('Erreur lors du chargement des envois:', dispatchError);
        throw dispatchError;
      }

      console.log(`Nombre d'envois trouvés pour ${selectedMonth}:`, dispatches?.length || 0);

      // Créer un objet avec tous les sites initialisés à 0
      const siteData = {};
      allSites.forEach(site => {
        if (site && site.name && site.name.trim() !== '') {
          siteData[site.name.trim()] = 0;
        }
      });

      // Ajouter les quantités des envois
      if (dispatches && dispatches.length > 0) {
        dispatches.forEach(dispatch => {
          if (dispatch && 
              typeof dispatch.quantity === 'number' && 
              dispatch.quantity > 0 && 
              dispatch.client_sites && 
              dispatch.client_sites.name) {
            const siteName = dispatch.client_sites.name.trim();
            if (siteName && siteData.hasOwnProperty(siteName)) {
              siteData[siteName] += dispatch.quantity;
            }
          }
        });
      }

      // Trier les sites par nom
      const sortedLabels = Object.keys(siteData)
        .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
      
      const chartData = {
        labels: sortedLabels,
        datasets: [{
          label: 'Nombre de manutentionnaires',
          data: sortedLabels.map(label => siteData[label]),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgb(53, 162, 235)',
          borderWidth: 1
        }]
      };

      console.log('Données du graphique générées:', {
        labels: chartData.labels,
        data: chartData.datasets[0].data,
        total: chartData.datasets[0].data.reduce((a, b) => a + b, 0)
      });

      setMonthlyData(chartData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de charger les données mensuelles."
      });
      setMonthlyData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!monthlyData || isLoading) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Aucune donnée disponible pour générer le rapport."
      });
      return;
    }

    const originalLoading = isLoading;
    
    try {
      setIsLoading(true);
      
      // Attendre un peu pour que le DOM soit stable
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const chartElement = document.querySelector("#monthly-chart canvas");
      if (!chartElement) {
        throw new Error("Élément graphique non trouvé. Veuillez attendre que le graphique soit chargé.");
      }

      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('landscape');
      
      // Ajouter le titre
      pdf.setFontSize(20);
      const monthName = new Date(selectedMonth + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      pdf.text(`Rapport Mensuel - ${monthName}`, 20, 20);
      
      // Ajouter le graphique
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 40;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 20, 30, pdfWidth, pdfHeight);
      
      // Ajouter les statistiques
      if (monthlyData && monthlyData.datasets && monthlyData.datasets[0]) {
        const data = monthlyData.datasets[0].data;
        const total = data.reduce((a, b) => a + b, 0);
        const maxValue = Math.max(...data);
        const maxIndex = data.indexOf(maxValue);
        
        pdf.addPage();
        pdf.setFontSize(18);
        pdf.text("Statistiques détaillées", 20, 20);
        
        pdf.setFontSize(12);
        const stats = [
          `Période: ${monthName}`,
          `Total des envois: ${total} manutentionnaires`,
          `Nombre de sites actifs: ${data.filter(value => value > 0).length}`,
          `Nombre total de sites: ${monthlyData.labels.length}`,
          maxValue > 0 ? `Site le plus actif: ${monthlyData.labels[maxIndex]} (${maxValue} manutentionnaires)` : 'Aucune activité ce mois'
        ];
        
        stats.forEach((line, index) => {
          pdf.text(line, 20, 40 + (index * 10));
        });

        // Ajouter un tableau détaillé
        pdf.setFontSize(12);
        pdf.text("Détail par site:", 20, 100);
        
        let yPos = 120;
        monthlyData.labels.forEach((site, index) => {
          const quantity = data[index];
          if (yPos > pdf.internal.pageSize.getHeight() - 20) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.text(`${site}: ${quantity} manutentionnaires`, 20, yPos);
          yPos += 10;
        });
      }
      
      pdf.save(`rapport-${selectedMonth}.pdf`);
      
      toast({
        title: "Succès",
        description: "Le rapport PDF a été généré avec succès."
      });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de générer le rapport PDF."
      });
    } finally {
      setIsLoading(originalLoading);
    }
  };

  // Générer les options de mois (12 derniers mois)
  const getMonthOptions = () => {
    const options = [];
    const today = new Date();
    const seen = new Set(); // Pour éviter les doublons

    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      
      // Vérifier si cette valeur a déjà été ajoutée
      if (!seen.has(value)) {
        seen.add(value);
        const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        options.push({ value, label });
      }
    }
    return options;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary">Rapports Mensuels</h2>
        <div className="flex items-center gap-4">
          <Select 
            value={selectedMonth} 
            onValueChange={setSelectedMonth}
          >
            <SelectTrigger className="w-[240px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sélectionner un mois" />
            </SelectTrigger>
            <SelectContent>
              {getMonthOptions().map((option) => (
                <SelectItem 
                  key={`month-${option.value}`} 
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChartHorizontalBig className="mr-2 h-5 w-5 text-blue-500"/>
              Tableau de Bord Mensuel
            </CardTitle>
            <CardDescription>
              Visualisation des envois par site pour {
                new Date(selectedMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : monthlyData ? (
              <div id="monthly-chart" className="h-full">
                <Bar options={chartOptions} data={monthlyData} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Aucune donnée disponible pour ce mois</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-green-500"/>
              Rapport de Fin de Mois
            </CardTitle>
            <CardDescription>
              Générer un rapport PDF détaillé pour {
                new Date(selectedMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] flex flex-col gap-4">
            {monthlyData && (
              <>
                <div className="flex-1 space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Statistiques du mois</h3>
                    <ul className="space-y-2">
                      <li>Total des envois: {monthlyData.datasets[0].data.reduce((a, b) => a + b, 0)} manutentionnaires</li>
                      <li>Nombre de sites actifs: {monthlyData.labels.filter((_, i) => monthlyData.datasets[0].data[i] > 0).length}</li>
                      <li>Nombre total de sites: {monthlyData.labels.length}</li>
                      <li>Site le plus actif: {
                        monthlyData.labels[monthlyData.datasets[0].data.indexOf(Math.max(...monthlyData.datasets[0].data))]
                      }</li>
                    </ul>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={generatePDF}
                  disabled={isLoading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isLoading ? 'Génération en cours...' : 'Générer le rapport PDF'}
                </Button>
              </>
            )}
            {!monthlyData && !isLoading && (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Sélectionnez un mois avec des données pour générer un rapport</p>
              </div>
            )}
            {isLoading && (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default ReportsPage;