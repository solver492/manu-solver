import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useTheme } from '@/hooks/useTheme';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erreur lors de la récupération de la session:", error);
      }
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateUser = async (newUsername) => {
    if (!user) throw new Error("Utilisateur non connecté.");
    // Supabase gère les noms d'utilisateur via user_metadata.
    // Pour cet exemple, nous allons simuler la mise à jour du nom d'utilisateur dans l'état local
    // et afficher un message indiquant que cela devrait être géré via les métadonnées utilisateur de Supabase.
    // Dans une application réelle, vous mettriez à jour user_metadata.

    // Exemple de mise à jour de user_metadata (nécessite des règles RLS appropriées)
    /*
    const { data, error } = await supabase.auth.updateUser({
      data: { username: newUsername } 
    })
    if (error) throw error;
    setUser(data.user); // Mettre à jour l'état local avec l'utilisateur mis à jour
    return data.user;
    */

    // Simulation pour l'instant
    const updatedUser = { ...user, user_metadata: { ...user.user_metadata, username: newUsername } };
    setUser(updatedUser); // Mettre à jour l'état local
    console.warn("Mise à jour du nom d'utilisateur simulée. Implémentez la mise à jour de user_metadata dans Supabase.");
    return updatedUser;
  };

  const updatePassword = async (newPassword) => {
    if (!user) throw new Error("Utilisateur non connecté.");
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  };

  const getUsername = () => {
    return user?.email?.split('@')[0] || user?.user_metadata?.username || 'Utilisateur';
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, updatePassword, getUsername, isAuthenticated: !!user, loading, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé au sein d_un AuthProvider');
  }
  return context;
};