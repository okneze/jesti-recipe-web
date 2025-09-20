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
 * Based on common web-to-app integration patterns
 */
export function generateBringUrl(ingredients: Ingredient[]): string {
  // Create ingredient list for Bring!
  const items = ingredients.map(ingredient => {
    // Format: "amount name" or just "name" if no amount
    return ingredient.amount 
      ? `${ingredient.amount} ${ingredient.name}`
      : ingredient.name;
  });
  
  // Bring! typically supports URL schemes like bring://add or bring://import
  // We'll use a flexible approach that works with their web integration
  const encodedItems = encodeURIComponent(items.join('\n'));
  
  // This URL pattern is commonly used by shopping list apps
  // It should open the Bring! app and add the items
  return `https://www.getbring.com/#!/app/lists/shared?items=${encodedItems}`;
}

/**
 * Alternative function for direct app scheme (if supported)
 */
export function generateBringAppUrl(ingredients: Ingredient[]): string {
  const items = ingredients.map(ingredient => {
    return ingredient.amount 
      ? `${ingredient.amount} ${ingredient.name}`
      : ingredient.name;
  });
  
  const encodedItems = encodeURIComponent(items.join(','));
  return `bring://add?items=${encodedItems}`;
}

/**
 * Opens Bring! with the ingredient list
 * Tries app scheme first, falls back to web URL
 */
export function openBringWithIngredients(ingredients: Ingredient[]): void {
  const appUrl = generateBringAppUrl(ingredients);
  const webUrl = generateBringUrl(ingredients);
  
  // Try to open the app scheme first
  const link = document.createElement('a');
  link.href = appUrl;
  
  // Check if the app scheme is supported
  let appOpened = false;
  
  // Use a timeout to detect if the app opened
  const timeout = setTimeout(() => {
    if (!appOpened) {
      // App didn't open, try web URL
      window.open(webUrl, '_blank');
    }
  }, 1000);
  
  // Try to open the app
  link.click();
  
  // Listen for page visibility change (app opened)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      appOpened = true;
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Clean up after a delay
  setTimeout(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, 3000);
}