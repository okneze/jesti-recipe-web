'use client'

import React, { useState } from 'react';
import styles from '@/app/styles/BringButton.module.css';
import { RecipeType } from '@/app/lib/Recipedata';

type Props = {
  recipe: RecipeType;
  multiplier: number;
};

/**
 * Bring Button Component
 * 
 * Integrates with Bring! shopping list app using temporary authenticated URLs.
 * Implementation follows the Bring! Import Developer Guide V0.8.0 (Pages 4-5).
 * 
 * When clicked, generates a temporary 15-minute URL that Bring's servers can access
 * without authentication to parse the recipe.
 */
export default function BringButton({ recipe, multiplier }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Generate temporary token
      const response = await fetch('/api/recipe-temp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeSlug: recipe.meta.slug
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate temporary URL');
      }

      const { tempUrl } = await response.json();

      // Calculate quantities based on multiplier
      const baseQuantity = 4;
      const requestedQuantity = Math.round(baseQuantity * multiplier);

      // Build Bring API deeplink URL with temporary URL
      const bringUrl = `https://api.getbring.com/rest/bringrecipes/deeplink?url=${encodeURIComponent(tempUrl)}&source=web&baseQuantity=${baseQuantity}&requestedQuantity=${requestedQuantity}`;

      // Open Bring API URL
      window.location.href = bringUrl;
      
    } catch (error) {
      console.error('Error creating Bring import:', error);
      alert('Fehler beim Erstellen des Bring! Import-Links. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button 
      onClick={handleClick}
      className={styles.bringButton}
      disabled={isLoading}
      title="Zutaten zu Bring! Einkaufsliste hinzufügen"
      aria-label="Zutaten zu Bring! Einkaufsliste hinzufügen"
    >
      <BringIcon />
      <span>{isLoading ? 'Lädt...' : 'Zu Bring! hinzufügen'}</span>
    </button>
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