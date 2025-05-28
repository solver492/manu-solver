import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilitaire pour la fusion des classes CSS.
 * 
 * Cette fonction utilise clsx pour la gestion conditionnelle des classes
 * et tailwind-merge pour éviter les conflits de classes Tailwind.
 * 
 * @param {...any} inputs - Les classes CSS à fusionner
 * @returns {string} La chaîne de classes CSS fusionnées
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
