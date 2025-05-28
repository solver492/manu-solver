import React, { useState, useEffect } from 'react';
    import { useAuth } from '@/contexts/AuthContext';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { User, KeyRound, Bell, Palette, FileCog } from 'lucide-react';
    import { motion } from 'framer-motion';

    const SettingsPage = () => {
      const { user, updateUser, updatePassword, getUsername } = useAuth();
      const { toast } = useToast();
      
      const [currentUsername, setCurrentUsername] = useState('');
      const [newUsername, setNewUsername] = useState('');
      
      const [newPassword, setNewPassword] = useState('');
      const [confirmNewPassword, setConfirmNewPassword] = useState('');
      const [isLoadingUsername, setIsLoadingUsername] = useState(false);
      const [isLoadingPassword, setIsLoadingPassword] = useState(false);

      useEffect(() => {
        if (user) {
          const username = getUsername();
          setCurrentUsername(username);
          setNewUsername(username);
        }
      }, [user, getUsername]);


      const handleUsernameChange = async (e) => {
        e.preventDefault();
        if (newUsername === currentUsername) {
          toast({ variant: "default", title: "Information", description: "Le nouveau nom d'utilisateur est identique à l'actuel." });
          return;
        }
        setIsLoadingUsername(true);
        try {
          // Note: Supabase gère l'email comme identifiant principal.
          // La mise à jour du "nom d'utilisateur" ici affecte user_metadata.
          await updateUser(newUsername); 
          setCurrentUsername(newUsername);
          toast({ title: "Succès", description: "Nom d'utilisateur (métadonnées) mis à jour. La connexion se fait toujours par email." });
        } catch (error) {
          toast({ variant: "destructive", title: "Erreur", description: error.message || "Impossible de mettre à jour le nom d'utilisateur." });
        } finally {
          setIsLoadingUsername(false);
        }
      };

      const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
          toast({ variant: "destructive", title: "Erreur", description: "Les nouveaux mots de passe ne correspondent pas." });
          return;
        }
        if (!newPassword) {
          toast({ variant: "destructive", title: "Erreur", description: "Veuillez saisir un nouveau mot de passe." });
          return;
        }
        setIsLoadingPassword(true);
        try {
          await updatePassword(newPassword);
          toast({ title: "Succès", description: "Mot de passe mis à jour." });
          setNewPassword('');
          setConfirmNewPassword('');
        } catch (error) {
          toast({ variant: "destructive", title: "Erreur", description: error.message || "Impossible de mettre à jour le mot de passe." });
        } finally {
          setIsLoadingPassword(false);
        }
      };
      
      const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      };

      if (!user) {
        return <p>Chargement des informations utilisateur...</p>;
      }

      return (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="space-y-8 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-primary mb-8">Paramètres</h2>

          <motion.div variants={cardVariants}>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><User className="mr-2 h-5 w-5 text-blue-500"/>Profil Utilisateur</CardTitle>
                <CardDescription>Email (non modifiable ici): {user.email}</CardDescription>
              </CardHeader>
              <form onSubmit={handleUsernameChange}>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="newUsername">Nom d'affichage (métadonnées)</Label>
                    <Input id="newUsername" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} disabled={isLoadingUsername} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoadingUsername || newUsername === currentUsername}>
                    {isLoadingUsername ? "Sauvegarde..." : "Sauvegarder le nom d'affichage"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><KeyRound className="mr-2 h-5 w-5 text-green-500"/>Changer le mot de passe</CardTitle>
                <CardDescription>Mettez à jour votre mot de passe régulièrement pour plus de sécurité.</CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordChange}>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isLoadingPassword} />
                  </div>
                  <div>
                    <Label htmlFor="confirmNewPassword">Confirmer le nouveau mot de passe</Label>
                    <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} disabled={isLoadingPassword} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoadingPassword}>
                    {isLoadingPassword ? "Sauvegarde..." : "Changer le mot de passe"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
          
          <motion.div variants={cardVariants}>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><Bell className="mr-2 h-5 w-5 text-yellow-500"/>Notifications</CardTitle>
                <CardDescription>Gérez vos préférences de notification (à implémenter).</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Les paramètres de notification seront disponibles ici.</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-purple-500"/>Préférences d'Affichage</CardTitle>
                <CardDescription>Personnalisez l'apparence de l'application (à implémenter).</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Les options de thème et d'affichage seront disponibles ici.</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><FileCog className="mr-2 h-5 w-5 text-red-500"/>Configuration des Rapports</CardTitle>
                <CardDescription>Paramétrez la génération et le format des rapports (à implémenter).</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Les options de configuration des rapports seront disponibles ici.</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      );
    };

    export default SettingsPage;