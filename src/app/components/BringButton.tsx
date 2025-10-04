'use client'

import React from 'react';
import styles from '@/app/styles/BringButton.module.css';
import { RecipeType } from '@/app/lib/Recipedata';

type Props = {
  recipe: RecipeType;
  multiplier: number;
};

/**
 * Bring Button Component
 * 
 * Integrates with Bring! shopping list app using the API deeplink method.
 * Implementation follows the Bring! Import Developer Guide V0.8.0 (Page 4-5).
 * 
 * Uses the alternative integration method: Direct link to Bring API that parses
 * the recipe URL and redirects to the app with a deeplink.
 */
export default function BringButton({ multiplier }: Props) {
  // Get current page URL for Bring to parse
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  // Calculate quantities based on multiplier
  // Base quantity is 4 (standard serving size)
  const baseQuantity = 4;
  const requestedQuantity = Math.round(baseQuantity * multiplier);
  
  // Build Bring API deeplink URL (as per official guide page 4-5)
  const bringUrl = `https://api.getbring.com/rest/bringrecipes/deeplink?url=${encodeURIComponent(currentUrl)}&source=web&baseQuantity=${baseQuantity}&requestedQuantity=${requestedQuantity}`;

  return (
    <a 
      href={bringUrl}
      className={styles.bringButton}
      target="_blank"
      rel="noopener noreferrer"
      title="Zutaten zu Bring! Einkaufsliste hinzufügen"
      aria-label="Zutaten zu Bring! Einkaufsliste hinzufügen"
    >
      <BringIcon />
      <span>Zu Bring! hinzufügen</span>
    </a>
  );
}

/**
 * Bring Logo Icon
 */
function BringIcon() {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
      <circle cx="12" cy="14" r="3" fill="currentColor"/>
      <path d="M12 12v4M10 14h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}