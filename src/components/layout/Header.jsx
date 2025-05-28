import React from 'react';
    import { useAuth } from '@/contexts/AuthContext';
    import { Button } from '@/components/ui/button';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    } from '@/components/ui/dropdown-menu';
    import { LogOut, User, Settings } from 'lucide-react';
    import { useNavigate, useLocation } from 'react-router-dom';
    import { motion } from 'framer-motion';

    const getPageTitle = (pathname) => {
      switch (pathname) {
        case '/': return 'Tableau de Bord';
        case '/sites': return 'Sites Clients';
        case '/historique': return 'Historique des Envois';
        case '/rapports': return 'Rapports Mensuels';
        case '/parametres': return 'Paramètres Utilisateur';
        default: return 'ManutentionPro';
      }
    };

    const Header = () => {
      const { user, logout, getUsername } = useAuth();
      const navigate = useNavigate();
      const location = useLocation();

      const pageTitle = getPageTitle(location.pathname);
      const username = user ? getUsername() : 'U';


      const handleLogout = async () => {
        try {
          await logout();
          navigate('/login');
        } catch (error) {
          console.error("Erreur lors de la déconnexion:", error);
          // Gérer l'erreur de déconnexion, par exemple afficher un toast
        }
      };

      return (
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="bg-background border-b p-4 flex justify-between items-center shadow-sm print:hidden"
        >
          <h1 className="text-xl font-semibold text-primary">{pageTitle}</h1>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/micah/svg?seed=${username}`} alt={username} />
                    <AvatarFallback>{username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/parametres')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </motion.header>
      );
    };

    export default Header;