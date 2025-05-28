import React, { useState } from 'react';
    import { useAuth } from '@/contexts/AuthContext';
    import { useNavigate, useLocation } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { Briefcase, LogIn } from 'lucide-react';
    import { motion } from 'framer-motion';

    const LoginPage = () => {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const { login, getUsername } = useAuth();
      const navigate = useNavigate();
      const location = useLocation();
      const { toast } = useToast();

      const from = location.state?.from?.pathname || "/";

      const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
          await login(email, password);
          // Le nom d'utilisateur sera récupéré via getUsername() dans le Header après la redirection
          toast({
            title: "Connexion réussie!",
            description: `Bienvenue !`, 
          });
          navigate(from, { replace: true });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Erreur de connexion",
            description: error.message || "Veuillez vérifier vos identifiants.",
          });
          setIsLoading(false);
        }
      };

      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary to-blue-700 p-4"
        >
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="text-center">
              <Briefcase size={48} className="mx-auto mb-4 text-primary" />
              <CardTitle className="text-3xl font-bold">ManutentionPro</CardTitle>
              <CardDescription>Connectez-vous pour gérer vos opérations</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Votre adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
                    />
                  ) : (
                    <LogIn className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? "Connexion en cours..." : "Se connecter"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-center text-sm text-muted-foreground">
              <p>Contactez l'administrateur si vous avez oublié votre mot de passe.</p>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default LoginPage;