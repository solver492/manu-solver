import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Filter, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


const HistoryPage = () => {
  const [allDispatches, setAllDispatches] = useState([]);
  const [filteredDispatches, setFilteredDispatches] = useState([]);
  const [clientSites, setClientSites] = useState([]);
  const [siteFilter, setSiteFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    const fetchClientSites = async () => {
      const { data, error } = await supabase.from('client_sites').select('id, name').order('name');
      if (error) {
        console.error("Erreur de chargement des sites clients:", error);
        toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les sites clients pour le filtre." });
      } else {
        setClientSites(data);
      }
    };

    const fetchDispatches = async () => {
      const { data, error } = await supabase
        .from('dispatches')
        .select(`
          id,
          site_id,
          quantity,
          comment,
          created_at,
          username,
          client_sites (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erreur de chargement des envois:", error);
        toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger l'historique des envois." });
      } else {
        const formattedData = data.map(d => ({
          id: d.id,
          site_id: d.site_id,
          quantity: d.quantity,
          comment: d.comment,
          username: d.username,
          timestamp: d.created_at,
          siteName: d.client_sites?.name || 'Site inconnu'
        }));
        setAllDispatches(formattedData);
        setFilteredDispatches(formattedData);
      }
    };
    
    fetchClientSites();
    fetchDispatches();
  }, [toast]);

  const applyFilters = () => {
    let tempDispatches = [...allDispatches];

    if (siteFilter && siteFilter !== 'all') {
      tempDispatches = tempDispatches.filter(d => 
        d.site_id === parseInt(siteFilter, 10)
      );
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter).toISOString().split('T')[0];
      tempDispatches = tempDispatches.filter(d => {
        const dispatchDate = new Date(d.timestamp).toISOString().split('T')[0];
        return dispatchDate === filterDate;
      });
    }

    if (userFilter) {
      const searchTerm = userFilter.toLowerCase().trim();
      tempDispatches = tempDispatches.filter(d => 
        d.username && d.username.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredDispatches(tempDispatches);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSiteFilter('all');
    setDateFilter('');
    setUserFilter('');
    setFilteredDispatches(allDispatches);
    setCurrentPage(1);
  };

  const downloadCSV = () => {
    const headers = "ID,Site,Quantité,Commentaire,Date et Heure,Utilisateur\n";
    const csvContent = filteredDispatches.map(d => 
      `${d.id},${d.siteName},${d.quantity},"${(d.comment || '').replace(/"/g, '""')}",${new Date(d.timestamp).toLocaleString('fr-FR')},${d.username || 'N/A'}`
    ).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "historique_envois.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDispatches.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDispatches.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-primary">Historique des Envois</h2>

      <Card className="p-4 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Filtres de recherche</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select value={siteFilter} onValueChange={setSiteFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les sites</SelectItem>
              {clientSites.map(site => (
                <SelectItem key={site.id} value={site.id.toString()}>{site.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <Input
            type="text"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            placeholder="Filtrer par utilisateur"
          />
          <div className="flex space-x-2">
            <Button onClick={applyFilters} className="w-full"><Filter className="mr-2 h-4 w-4"/>Appliquer</Button>
            <Button onClick={resetFilters} variant="outline" className="w-full"><RotateCcw className="mr-2 h-4 w-4"/>Réinitialiser</Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={downloadCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" /> Exporter en CSV
        </Button>
      </div>

      <Table>
        <TableCaption className="text-white">Liste des envois de manutentionnaires. Total: {filteredDispatches.length} enregistrements.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-white">Site Client</TableHead>
            <TableHead className="text-center text-white">Quantité</TableHead>
            <TableHead className="text-white">Commentaire</TableHead>
            <TableHead className="text-white">Date et Heure</TableHead>
            <TableHead className="text-white">Utilisateur</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.length > 0 ? currentItems.map((dispatch) => (
            <TableRow key={dispatch.id}>
              <TableCell className="font-medium text-white">{dispatch.siteName}</TableCell>
              <TableCell className="text-center text-white">{dispatch.quantity}</TableCell>
              <TableCell className="max-w-xs truncate text-white">{dispatch.comment || '-'}</TableCell>
              <TableCell className="text-white">{new Date(dispatch.timestamp).toLocaleString('fr-FR')}</TableCell>
              <TableCell className="text-white">{dispatch.username || 'N/A'}</TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-white">
                {allDispatches.length === 0 ? "Chargement de l'historique..." : "Aucun envoi ne correspond aux filtres."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <Button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
          >
            Précédent
          </Button>
          {[...Array(totalPages).keys()].map(number => (
             (number < 2 || number > totalPages - 3 || Math.abs(number - (currentPage-1)) < 2) ? (
              <Button
                key={number + 1}
                onClick={() => paginate(number + 1)}
                variant={currentPage === number + 1 ? "default" : "outline"}
              >
                {number + 1}
              </Button>
             ) : (number === 2 && currentPage > 4) || (number === totalPages - 3 && currentPage < totalPages - 3) ? (
              <span key={number + 1}>...</span>
             ) : null
          ))}
          <Button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
          >
            Suivant
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default HistoryPage;