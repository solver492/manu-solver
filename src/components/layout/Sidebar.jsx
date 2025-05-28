import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Briefcase, History, Settings, BarChart3, Building2, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: "/", label: "Tableau de Bord", icon: Home },
  { to: "/sites", label: "Sites Clients", icon: Building2 },
  { to: "/historique", label: "Historique", icon: History },
  { to: "/rapports", label: "Rapports", icon: BarChart3 },
  { to: "/parametres", label: "Paramètres", icon: Settings },
];

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Briefcase className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold text-primary">ManutentionPro</h1>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md hover:bg-secondary transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex w-64 bg-card border-r border-border flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Briefcase className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-primary">ManutentionPro</h1>
          </div>
        </div>

        <div className="flex-1 py-6">
          <ul className="space-y-2 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.li
                  key={item.to}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )
                    }
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={toggleMobileMenu}
            />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50 flex flex-col"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-8 w-8 text-primary" />
                    <h1 className="text-xl font-bold text-primary">ManutentionPro</h1>
                  </div>
                  <button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-md hover:bg-secondary transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 py-6">
                <ul className="space-y-2 px-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.li
                        key={item.to}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <NavLink
                          to={item.to}
                          onClick={toggleMobileMenu}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )
                          }
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span>{item.label}</span>
                        </NavLink>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;