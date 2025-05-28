
    import React from 'react';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { AlertTriangle } from 'lucide-react';
    import { motion } from 'framer-motion';

    const NotFoundPage = () => {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center justify-center h-full text-center p-8 bg-background"
        >
          <AlertTriangle className="w-24 h-24 text-destructive mb-8 animate-pulse" />
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-foreground mb-6">Page Non Trouvée</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
            Vérifiez l'URL ou retournez à la page d'accueil.
          </p>
          <Link to="/">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Retourner à l'accueil
            </Button>
          </Link>
        </motion.div>
      );
    };

    export default NotFoundPage;
  