import { multiplyAmount } from './marked';

/**
 * Represents an ingredient with its amount and name
 */
export interface Ingredient {
  amount: string;
  name: string;
  originalLine: string;
}

/**
 * Extracts ingredients from markdown content and applies a multiplier to amounts
 */
export function extractIngredientsFromMarkdown(ingredientsMarkdown: string, multiplier: number = 1): Ingredient[] {
  const ingredients: Ingredient[] = [];
  
  // Simple approach: split by lines and parse each line
  const lines = ingredientsMarkdown.split('\n');
  
  lines.forEach(line => {
    // Skip empty lines and non-list items
    const trimmedLine = line.trim();
    if (!trimmedLine || (!trimmedLine.startsWith('-') && !trimmedLine.startsWith('*') && !trimmedLine.startsWith('+'))) {
      return;
    }
    
    // Remove list markers (-, *, +) and trim
    const cleanLine = trimmedLine.replace(/^[-*+]\s*/, '').trim();
    if (cleanLine) {
      const ingredient = parseIngredientLine(cleanLine, multiplier);
      if (ingredient) {
        ingredients.push(ingredient);
      }
    }
  });
  
  return ingredients;
}

/**
 * Parses a single ingredient line and extracts amount and name
 */
function parseIngredientLine(line: string, multiplier: number): Ingredient | null {
  // Look for amounts in emphasized text (typically between * or _)
  const emphasisMatch = line.match(/[*_]([^*_]+)[*_]/);
  let amount = '';
  let name = line;
  
  if (emphasisMatch) {
    const rawAmount = emphasisMatch[1];
    // Apply multiplier to the amount
    amount = multiplyAmount(rawAmount, multiplier);
    // Remove the emphasis markers and the amount from the name
    name = line.replace(emphasisMatch[0], '').trim();
  } else {
    // If no amount is found in emphasis, try to detect numbers at the beginning
    const numberMatch = line.match(/^(\d+(?:[.,\/]\d+)?(?:\s*-\s*\d+(?:[.,\/]\d+)?)?)\s+(.+)/);
    if (numberMatch) {
      amount = multiplyAmount(numberMatch[1], multiplier);
      name = numberMatch[2];
    }
  }
  
  // Clean up the name by removing extra whitespace
  name = name.trim();
  
  if (name) {
    return {
      amount: amount || '',
      name,
      originalLine: line
    };
  }
  
  return null;
}

/**
 * Generates a Bring! shopping list URL with the ingredients
 * Based on Bring! official web integration
 */
export function generateBringUrl(ingredients: Ingredient[]): string {
  const items = ingredients.map(ingredient => {
    return ingredient.amount 
      ? `${ingredient.amount} ${ingredient.name}`
      : ingredient.name;
  });
  
  // Use Bring!'s web interface for adding items
  const itemsText = items.join('\n');
  return `https://web.getbring.com/app/lists/shared?text=${encodeURIComponent(itemsText)}`;
}

/**
 * Generates the Bring! app deep link URL
 * Based on official Bring! deep linking documentation
 */
export function generateBringAppUrl(ingredients: Ingredient[]): string {
  const items = ingredients.map(ingredient => {
    return ingredient.amount 
      ? `${ingredient.amount} ${ingredient.name}`
      : ingredient.name;
  });
  
  // Use comma-separated format for Bring! app
  const itemsList = items.join(',');
  
  // Try the official Bring! deep link format
  return `bring://addtolist?items=${encodeURIComponent(itemsList)}`;
}

/**
 * Copies ingredients to clipboard for manual pasting into Bring!
 */
export async function copyIngredientsToClipboard(ingredients: Ingredient[]): Promise<boolean> {
  const items = ingredients.map(ingredient => {
    return ingredient.amount 
      ? `${ingredient.amount} ${ingredient.name}`
      : ingredient.name;
  });
  
  const text = items.join('\n');
  
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Uses Web Share API to share ingredients if available
 */
export async function shareIngredients(ingredients: Ingredient[]): Promise<boolean> {
  const items = ingredients.map(ingredient => {
    return ingredient.amount 
      ? `${ingredient.amount} ${ingredient.name}`
      : ingredient.name;
  });
  
  const text = items.join('\n');
  
  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Rezept Zutaten',
        text: text
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to share:', error);
    return false;
  }
}

/**
 * Opens Bring! with the ingredient list using a direct approach
 * Tries app first, then provides clear fallback options
 */
export async function openBringWithIngredients(ingredients: Ingredient[]): Promise<void> {
  console.log('Opening Bring! with ingredients:', ingredients);
  
  const appUrl = generateBringAppUrl(ingredients);
  const webUrl = generateBringUrl(ingredients);
  
  console.log('Trying Bring! app URL:', appUrl);
  
  // Try to open the Bring! app directly
  try {
    // Create a hidden iframe to try the app URL
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = appUrl;
    document.body.appendChild(iframe);
    
    // Check if app opened by monitoring page visibility
    let appOpened = false;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        appOpened = true;
        cleanup();
      }
    };
    
    const cleanup = () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Wait to see if app opens
    setTimeout(() => {
      cleanup();
      
      if (!appOpened) {
        console.log('App did not open, providing fallback options');
        showFallbackOptions(ingredients, webUrl);
      } else {
        console.log('App opened successfully');
      }
    }, 2000);
    
  } catch (error) {
    console.error('Error trying to open Bring! app:', error);
    showFallbackOptions(ingredients, webUrl);
  }
}

/**
 * Shows fallback options when the app doesn't open
 */
async function showFallbackOptions(ingredients: Ingredient[], webUrl: string): Promise<void> {
  // Try clipboard copy first
  try {
    const copied = await copyIngredientsToClipboard(ingredients);
    if (copied) {
      const message = 'Bring! App konnte nicht automatisch geöffnet werden.\n\n' +
                     'Die Zutaten wurden in die Zwischenablage kopiert!\n\n' +
                     'Öffne Bring! und füge die Zutaten manuell hinzu:\n' +
                     '1. Bring! App öffnen\n' +
                     '2. "+" Button drücken\n' +
                     '3. Text einfügen (Strg+V)\n\n' +
                     'Oder soll die Web-Version geöffnet werden?';
      
      if (confirm(message)) {
        window.open(webUrl, '_blank');
      }
      return;
    }
  } catch (error) {
    console.log('Clipboard copy failed:', error);
  }
  
  // If clipboard fails, just open web version
  const message = 'Bring! App konnte nicht automatisch geöffnet werden.\n\n' +
                 'Die Web-Version von Bring! wird geöffnet.';
  alert(message);
  window.open(webUrl, '_blank');
}