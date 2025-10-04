'use client'

import React, { useEffect, useRef } from 'react';
import styles from '@/app/styles/BringButton.module.css';
import { RecipeType } from '@/app/lib/Recipedata';

type Props = {
  recipe: RecipeType;
  multiplier: number;
};

/**
 * Bring Button Component
 * 
 * Integrates with Bring! shopping list app using their official widget.
 * Implementation follows the Bring! Import Developer Guide V0.8.0.
 * 
 * The widget script will parse the current page and extract ingredients.
 */
export default function BringButton({ multiplier }: Props) {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Bring widget script if not already loaded (official CDN)
    if (typeof window !== 'undefined' && !window.document.getElementById('bring-widget-script')) {
      const script = document.createElement('script');
      script.id = 'bring-widget-script';
      script.src = '//platform.getbring.com/widgets/import.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Update requested quantity when multiplier changes
    if (widgetRef.current && multiplier !== 1) {
      // Calculate requested quantity based on multiplier
      // Assuming base quantity is 4 (default in Bring widget)
      const requestedQuantity = Math.round(4 * multiplier);
      widgetRef.current.setAttribute('data-bring-requested-quantity', requestedQuantity.toString());
    }
  }, [multiplier]);

  return (
    <div 
      ref={widgetRef}
      data-bring-import=""
      data-bring-language="de"
      data-bring-theme="dark"
      data-bring-base-quantity="4"
      data-bring-requested-quantity={multiplier !== 1 ? Math.round(4 * multiplier).toString() : "4"}
      style={{ display: 'inline-block' }}
      className={styles.bringButtonContainer}
    >
      <a href="https://www.getbring.com" className={styles.bringFallback}>
        Bring! Einkaufsliste App
      </a>
    </div>
  );
}