
    import React from 'react';
    import { NavLink } from 'react-router-dom';
    import { Home, Briefcase, History, Settings, BarChart3, Building2 } from 'lucide-react';
    import { cn } from '@/lib/utils';
    import { motion } from 'framer-motion';

    const navItems = [
      { to: "/", label: "Tableau de Bord", icon: Home },
      { to: "/sites", label: "Sites Clients", icon: Building2 },
      { to: "/historique", label: "Historique", icon: History },
      { to: "/rapports", label: "Rapports", icon: BarChart3 },
      { to: "/parametres", label: "Paramètres", icon: Settings },
    ];

    const Sidebar = () => {
      return (
        <motion.div 
          initial={{ x: -250 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-64 bg-gradient-to-b from-primary to-blue-700 text-primary-foreground p-4 space-y-6 flex flex-col shadow-lg print:hidden"
        >
          <div className="text-center py-4">
            <Briefcase size={48} className="mx-auto mb-2 text-secondary" />
            <h1 className="text-2xl font-bold">ManutentionPro</h1>
          </div>
          <nav className="flex-grow">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center space-x-3 p-3 rounded-md hover:bg-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out",
                        isActive ? "bg-primary-foreground text-primary font-semibold shadow-md" : "text-blue-100 hover:text-blue-800"
                      )
                    }
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="text-center text-xs text-blue-200 mt-auto">
            <p>&copy; {new Date().getFullYear()} ManutentionPro</p>
            <p>Tous droits réservés.</p>
          </div>
        </motion.div>
      );
    };

    export default Sidebar;
  