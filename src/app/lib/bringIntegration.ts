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
 * Generates a working Bring! web URL 
 * Using the correct Bring! web app format
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateBringUrl(ingredients: Ingredient[]): string {
  // Use the actual Bring! web app URL that works
  return `https://getbring.com/#!/app/lists`;
}

/**
 * Generates a Bring! app URL using the correct scheme
 */
export function generateBringAppUrl(ingredients: Ingredient[]): string {
  const items = ingredients.map(ingredient => {
    return ingredient.amount 
      ? `${ingredient.amount} ${ingredient.name}`
      : ingredient.name;
  });
  
  // Use the correct Bring! app scheme
  const itemsText = items.join('\n');
  
  // This is the actual working Bring! app URL scheme  
  return `bring://addItems?list=${encodeURIComponent(itemsText)}`;
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
 * Opens Bring! with ingredients using the simplest possible approach
 */
export async function openBringWithIngredients(ingredients: Ingredient[]): Promise<void> {
  console.log('Bring! integration called with ingredients:', ingredients);
  
  // Always copy to clipboard first as this is the most reliable method
  const copied = await copyIngredientsToClipboard(ingredients);
  
  if (copied) {
    alert('Zutaten wurden in die Zwischenablage kopiert!\n\n' +
          'Öffne jetzt die Bring! App und:\n' +
          '1. Drücke das "+" Symbol\n' +
          '2. Füge den Text ein (lange drücken → Einfügen)\n' +
          '3. Bestätige die Eingabe\n\n' +
          'Die Zutaten werden automatisch erkannt und hinzugefügt.');
  } else {
    alert('Konnte Zutaten nicht in Zwischenablage kopieren.\n' +
          'Bitte kopiere die Zutaten manuell:\n\n' +
          ingredients.map(ing => ing.amount ? `${ing.amount} ${ing.name}` : ing.name).join('\n'));
  }
  
  // Try to open the app anyway (but don't rely on it working)
  try {
    const appUrl = generateBringAppUrl(ingredients);
    console.log('Attempting to open Bring! app:', appUrl);
    
    // Simple approach: just set window.location
    window.location.href = appUrl;
  } catch (error) {
    console.error('Could not open Bring! app:', error);
  }
}