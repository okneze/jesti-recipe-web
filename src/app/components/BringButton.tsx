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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    const debug: string[] = [];
    
    try {
      debug.push(`[1] Starting Bring integration for recipe: ${recipe.meta.slug}`);
      debug.push(`[2] Multiplier: ${multiplier}`);
      
      // Generate temporary token
      debug.push(`[3] Requesting temporary token from /api/recipe-temp...`);
      const response = await fetch('/api/recipe-temp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeSlug: recipe.meta.slug
        }),
      });

      debug.push(`[4] Token API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        debug.push(`[ERROR] Token API failed: ${errorText}`);
        throw new Error('Failed to generate temporary URL');
      }

      const responseData = await response.json();
      debug.push(`[5] Token API response: ${JSON.stringify(responseData)}`);
      
      const { tempUrl, token } = responseData;
      debug.push(`[6] Temporary URL: ${tempUrl}`);
      debug.push(`[7] Token: ${token}`);

      // Calculate quantities based on multiplier
      const baseQuantity = 4;
      const requestedQuantity = Math.round(baseQuantity * multiplier);
      debug.push(`[8] Base quantity: ${baseQuantity}, Requested quantity: ${requestedQuantity}`);

      // Build Bring API deeplink URL with temporary URL
      const bringUrl = `https://api.getbring.com/rest/bringrecipes/deeplink?url=${encodeURIComponent(tempUrl)}&source=web&baseQuantity=${baseQuantity}&requestedQuantity=${requestedQuantity}`;
      debug.push(`[9] Bring API URL: ${bringUrl}`);
      debug.push(`[10] Encoded temp URL in Bring API: ${encodeURIComponent(tempUrl)}`);

      // Show debug info before redirect
      setDebugInfo(debug);
      
      // Wait a moment to show debug info
      await new Promise(resolve => setTimeout(resolve, 100));
      
      debug.push(`[11] Redirecting to Bring API...`);
      console.log('=== BRING INTEGRATION DEBUG ===');
      debug.forEach(line => console.log(line));
      console.log('===============================');

      // Open Bring API URL
      window.location.href = bringUrl;
      
    } catch (error) {
      debug.push(`[ERROR] Exception: ${error}`);
      setDebugInfo(debug);
      console.error('=== BRING INTEGRATION ERROR ===');
      debug.forEach(line => console.log(line));
      console.error('Error creating Bring import:', error);
      console.error('==============================');
      alert('Fehler beim Erstellen des Bring! Import-Links. Bitte versuchen Sie es erneut.\n\nDebug-Info in der Browser-Konsole (F12).');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.bringButtonContainer}>
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
      
      {debugInfo.length > 0 && (
        <div className={styles.debugInfo}>
          <h3>🔍 Debug Information</h3>
          <div className={styles.debugLog}>
            {debugInfo.map((line, index) => (
              <div key={index} className={line.includes('[ERROR]') ? styles.debugError : styles.debugLine}>
                {line}
              </div>
            ))}
          </div>
          <p className={styles.debugNote}>
            📋 Diese Informationen wurden auch in die Browser-Konsole (F12) geschrieben.
          </p>
        </div>
      )}
    </div>
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