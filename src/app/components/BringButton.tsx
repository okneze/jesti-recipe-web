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
 * Integrates with Bring! shopping list app using the official widget.
 * Implementation follows the Bring! Import Developer Guide V0.8.0 (Pages 1-3).
 * 
 * The widget loads from Bring's CDN and handles parsing and import automatically.
 */
export default function BringButton({ multiplier }: Props) {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Bring widget script if not already loaded
    if (typeof window !== 'undefined' && !document.getElementById('bring-widget-script')) {
      const script = document.createElement('script');
      script.id = 'bring-widget-script';
      script.src = '//platform.getbring.com/widgets/import.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Update requested quantity when multiplier changes
    if (widgetRef.current) {
      const baseQuantity = 4;
      const requestedQuantity = Math.round(baseQuantity * multiplier);
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
      data-bring-requested-quantity={Math.round(4 * multiplier).toString()}
      className={styles.bringButtonContainer}
      style={{ display: 'none' }}
    >
      <a href="https://www.getbring.com">Bring! Einkaufsliste App</a>
    </div>
  );
}