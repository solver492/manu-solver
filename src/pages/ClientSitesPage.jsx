import React, { useState, useEffect } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea'; 
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/AuthContext';
    import { Truck, Search, MapPin, Building } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { supabase } from '@/lib/supabaseClient';
    import { cn } from "@/lib/utils";


    const ClientSitesPage = () => {
      const [allSites, setAllSites] = useState([]);
      const [displayedSites, setDisplayedSites] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [selectedSite, setSelectedSite] = useState(null);
      const [quantity, setQuantity] = useState(1);
      const [comment, setComment] = useState('');
      const [isModalOpen, setIsModalOpen] = useState(false);
      const { toast } = useToast();
      const { user, getUsername } = useAuth();

      useEffect(() => {
        const fetchSites = async () => {
          const { data, error } = await supabase.from('client_sites').select('*').order('name', { ascending: true });
          if (error) {
            console.error("Erreur de chargement des sites:", error);
            toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les sites clients." });
          } else {
            setAllSites(data);
            setDisplayedSites(data);
          }
        };
        fetchSites();
      }, [toast]);

      useEffect(() => {
        const filteredSites = allSites.filter(site =>
          site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          site.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setDisplayedSites(filteredSites);
      }, [searchTerm, allSites]);

      const handleOpenModal = (site) => {
        setSelectedSite(site);
        setQuantity(1);
        setComment('');
        setIsModalOpen(true);
      };

      const handleSendHandlers = async () => {
        if (!selectedSite || !user) return;

        const username = getUsername();

        const { error } = await supabase.from('dispatches').insert([
          { 
            site_id: selectedSite.id, 
            quantity: parseInt(quantity, 10), 
            comment, 
            user_id: user.id,
            username: username 
          }
        ]);

        if (error) {
          console.error("Erreur d'enregistrement de l'envoi:", error);
          toast({
            variant: "destructive",
            title: "Erreur d'enregistrement",
            description: error.message,
          });
        } else {
          toast({
            title: "Envoi confirmé!",
            description: `${quantity} manutentionnaire(s) envoyé(s) à ${selectedSite.name}.`,
          });
          setIsModalOpen(false);
          // Optionnel: rafraîchir les données du dashboard ou de l'historique si nécessaire
        }
      };
      
      const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      };

      return (
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center"
          >
            <h2 className="text-3xl font-bold text-primary">Sites Clients</h2>
            <div className="relative w-full max-w-sm">
              <Input
                type="text"
                placeholder="Rechercher un site..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </motion.div>

          {displayedSites.length === 0 && (
            <p className="text-center text-muted-foreground">
              {searchTerm ? "Aucun site client ne correspond à votre recherche." : "Chargement des sites..."}
            </p>
          )}

          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            initial="hidden"
            animate="visible"
          >
            {displayedSites.map((site) => (
              <motion.div key={site.id} variants={cardVariants}>
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full bg-card">
                  <CardHeader>
                    <CardTitle className="text-xl text-primary flex items-center">
                      <Building className="mr-2 h-5 w-5" /> {site.name}
                    </CardTitle>
                    <CardDescription className="flex items-start text-sm">
                      <MapPin className="mr-1 h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{site.address}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white" onClick={() => handleOpenModal(site)}>
                      <Truck className="mr-2 h-4 w-4" /> Envoyer Manutentionnaires
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {selectedSite && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Envoyer à {selectedSite.name}</DialogTitle>
                  <DialogDescription>
                    Saisissez le nombre de manutentionnaires et un commentaire optionnel.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">
                      Quantité
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="comment" className="text-right">
                      Commentaire
                    </Label>
                    <Textarea
                      id="comment"
                      placeholder="Optionnel (ex: besoin urgent, équipe de nuit...)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button>Confirmer l'envoi</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Vous êtes sur le point d'envoyer {quantity} manutentionnaire(s) à {selectedSite.name}. Cette action sera enregistrée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSendHandlers}>Confirmer</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      );
    };

    export default ClientSitesPage;