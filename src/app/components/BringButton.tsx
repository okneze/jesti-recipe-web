'use client'

import React, { useEffect } from 'react';
import styles from '@/app/styles/BringButton.module.css';
import { RecipeType } from '@/app/lib/Recipedata';
import { multiplyAmount } from '@/app/lib/marked';

type Props = {
  recipe: RecipeType;
  multiplier: number;
};

/**
 * Bring Button Component
 * 
 * Integrates with Bring! shopping list app using their official widget.
 * This implementation follows the standard web-to-app integration pattern.
 */
export default function BringButton({ recipe, multiplier }: Props) {
  useEffect(() => {
    // Load Bring widget script if not already loaded
    if (typeof window !== 'undefined' && !window.document.getElementById('bring-widget-script')) {
      const script = document.createElement('script');
      script.id = 'bring-widget-script';
      script.src = 'https://web.getbring.com/static/js/bring-widget.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleClick = () => {
    // Extract and process ingredients
    const ingredientLines = recipe.ingredients
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        // Process amounts marked with asterisks (RecipeMD format)
        const processedLine = line.replace(/\*([^*]+)\*/g, (match, content) => {
          return multiplyAmount(content, multiplier);
        });
        // Remove markdown formatting
        return processedLine.replace(/[*_`]/g, '').replace(/^\s*[-*+]\s*/, '').trim();
      })
      .filter(item => item.trim() && !item.match(/^#+\s/));

    // Prepare data for Bring widget
    const bringData = {
      title: recipe.title,
      items: ingredientLines
    };

    // Try to use Bring widget if available
    const windowWithBring = window as Window & { BringWidget?: { addItems: (data: typeof bringData) => void } };
    if (typeof windowWithBring.BringWidget !== 'undefined') {
      windowWithBring.BringWidget.addItems(bringData);
    } else {
      // Fallback: Use standard URL format
      const itemParams = ingredientLines
        .map(item => `item=${encodeURIComponent(item)}`)
        .join('&');
      
      const url = `https://web.getbring.com/import?${itemParams}&title=${encodeURIComponent(recipe.title)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <button 
      className={styles.bringButton}
      onClick={handleClick}
      title="Add ingredients to Bring! shopping list"
      aria-label={`Add ${recipe.title} ingredients to Bring shopping list`}
      data-bring-title={recipe.title}
    >
      <BringIcon />
      <span>Add to Bring!</span>
    </button>
  );
}

/**
 * Bring Logo Icon
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
      <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
      <circle cx="12" cy="14" r="3" fill="currentColor"/>
      <path d="M12 12v4M10 14h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}