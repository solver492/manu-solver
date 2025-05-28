
    import React from 'react';
    import Sidebar from './Sidebar';
    import Header from './Header';
    import { Toaster } from '@/components/ui/toaster';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useLocation } from 'react-router-dom';

    const Layout = ({ children }) => {
      const location = useLocation();
      return (
        <div className="flex flex-col lg:flex-row h-screen bg-secondary">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary p-3 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
          <Toaster />
        </div>
      );
    };

    export default Layout;
  