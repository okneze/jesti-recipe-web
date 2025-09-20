/**
 * Bring Shopping List Integration
 * 
 * This module handles the integration with the Bring! shopping list app
 * following the official Bring import developer guide.
 */

import { RecipeType } from './Recipedata';
import { multiplyAmount } from './marked';

/**
 * Extracts plain text from HTML-rendered ingredient content
 */
function extractTextFromHTML(html: string): string {
  // Create a temporary DOM element to parse HTML
  if (typeof window !== 'undefined') {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }
  // Fallback for server-side: simple HTML tag removal
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Processes ingredients and extracts them as plain text items with current multipliers
 */
export function extractIngredientsForBring(recipe: RecipeType, multiplier: number): string[] {
  const ingredientLines = recipe.ingredients.split('\n').filter(line => line.trim());
  
  return ingredientLines.map(line => {
    // Process amounts marked with asterisks (RecipeMD format)
    const processedLine = line.replace(/\*([^*]+)\*/g, (match, content) => {
      return multiplyAmount(content, multiplier);
    });
    
    // Remove any remaining markdown formatting and extract plain text
    let cleanedLine = extractTextFromHTML(processedLine.replace(/[*_`]/g, ''));
    
    // Remove list markers (-, *, +) if present at the beginning
    cleanedLine = cleanedLine.replace(/^\s*[-*+]\s*/, '');
    
    return cleanedLine.trim();
  }).filter(item => item.trim() && !item.match(/^#+\s/)); // Remove empty items and headers
}

/**
 * Creates the Bring import URL following their integration guide
 * Based on the official Bring developer guide, the URL scheme is:
 * https://web.getbring.com/#!/app/lists/YOUR_LIST_ID?items=item1,item2,item3
 */
export function createBringImportURL(ingredients: string[], recipeTitle: string): string {
  // Encode ingredients for URL - each item should be URL encoded
  const encodedIngredients = ingredients
    .map(item => encodeURIComponent(item.trim()))
    .join(',');
  
  // Create the Bring web URL that should deep link to the app
  // This follows the pattern from the Bring developer integration guide
  const bringURL = `https://web.getbring.com/#!/app/lists?items=${encodedIngredients}&source=${encodeURIComponent(recipeTitle)}`;
  
  return bringURL;
}

/**
 * Creates a fallback web URL for browsers that don't support the URL scheme
 * This opens the Bring web interface with the ingredients
 */
export function createBringWebFallback(ingredients: string[], recipeTitle: string): string {
  // Create the same URL as the main one since we're using web URLs now
  return createBringImportURL(ingredients, recipeTitle);
}

/**
 * Triggers the Bring import with proper fallback handling
 * Opens the Bring web interface which will redirect to the app if available
 */
export function importToBring(recipe: RecipeType, multiplier: number): void {
  const ingredients = extractIngredientsForBring(recipe, multiplier);
  
  if (ingredients.length === 0) {
    alert('No ingredients found to import.');
    return;
  }
  
  const bringURL = createBringImportURL(ingredients, recipe.title);
  
  // Open the Bring web URL which should handle app redirection automatically
  if (typeof window !== 'undefined') {
    window.open(bringURL, '_blank');
  }
}