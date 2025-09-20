import React from 'react';
import styles from '@/app/styles/BringButton.module.css';
import { RecipeType } from '@/app/lib/Recipedata';
import { importToBring } from '@/app/lib/bringIntegration';

type Props = {
  recipe: RecipeType;
  multiplier: number;
};

/**
 * Bring Button Component
 * 
 * Button that allows users to export the current recipe with adjusted quantities
 * to the Bring! shopping list app. The integration follows the official Bring
 * developer guide for web-to-app integration.
 * 
 * Features:
 * - Extracts ingredients from RecipeMD format
 * - Applies current multiplier to ingredient quantities  
 * - Opens Bring web interface which redirects to app if installed
 * - Responsive design with mobile-friendly layout
 * - Accessible with proper ARIA labels
 */
export default function BringButton({ recipe, multiplier }: Props) {
  const handleBringImport = () => {
    importToBring(recipe, multiplier);
  };

  return (
    <button 
      className={styles.bringButton}
      onClick={handleBringImport}
      title="Add ingredients to Bring! shopping list"
      aria-label={`Add ${recipe.title} ingredients to Bring shopping list`}
    >
      <BringIcon />
      <span>Add to Bring!</span>
    </button>
  );
}

/**
 * Bring Logo Icon Component
 * Simple SVG icon representing the Bring! app
 */
function BringIcon() {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      aria-hidden="true"
    >
      {/* Shopping bag icon representing Bring! */}
      <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
      {/* Plus icon overlay */}
      <circle cx="12" cy="14" r="3" fill="currentColor"/>
      <path d="M12 12v4M10 14h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}