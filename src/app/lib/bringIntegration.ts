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
 * Since the exact API format isn't clearly documented, we try the most common pattern
 */
export function createBringImportURL(ingredients: string[], recipeTitle: string): string {
  // Format ingredients as individual parameters (most common pattern)
  const itemParams = ingredients
    .map(item => `item=${encodeURIComponent(item.trim())}`)
    .join('&');
  
  return `https://web.getbring.com/import?${itemParams}&title=${encodeURIComponent(recipeTitle)}`;
}

/**
 * Creates alternative Bring URL formats for testing
 */
export function createAlternativeBringURLs(ingredients: string[], recipeTitle: string): string[] {
  const encodedIngredients = ingredients.map(item => encodeURIComponent(item.trim()));
  
  return [
    // Format 1: Comma-separated items
    `https://web.getbring.com/import?items=${encodedIngredients.join(',')}&title=${encodeURIComponent(recipeTitle)}`,
    
    // Format 2: Hash-based routing with individual items
    `https://web.getbring.com/#!/import?${ingredients.map(item => `item=${encodeURIComponent(item.trim())}`).join('&')}&title=${encodeURIComponent(recipeTitle)}`,
    
    // Format 3: Hash-based with comma-separated
    `https://web.getbring.com/#!/import?items=${encodedIngredients.join(',')}&title=${encodeURIComponent(recipeTitle)}`,
    
    // Format 4: Data parameter with newline-separated ingredients
    `https://web.getbring.com/import?data=${encodeURIComponent(ingredients.join('\n'))}&title=${encodeURIComponent(recipeTitle)}`,
    
    // Format 5: List parameter format
    `https://web.getbring.com/add-items?list=${encodedIngredients.join('&list=')}&source=${encodeURIComponent(recipeTitle)}`
  ];
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
 * Tries multiple URL formats and provides user feedback
 */
export function importToBring(recipe: RecipeType, multiplier: number): void {
  const ingredients = extractIngredientsForBring(recipe, multiplier);
  
  if (ingredients.length === 0) {
    alert('No ingredients found to import.');
    return;
  }
  
  // Get primary and alternative URLs
  const primaryURL = createBringImportURL(ingredients, recipe.title);
  const alternativeURLs = createAlternativeBringURLs(ingredients, recipe.title);
  
  // Log for debugging
  if (typeof console !== 'undefined') {
    console.log('Bring Integration Debug:');
    console.log('Recipe:', recipe.title);
    console.log('Multiplier:', multiplier);
    console.log('Extracted ingredients:', ingredients);
    console.log('Primary URL:', primaryURL);
    console.log('Alternative URLs:', alternativeURLs);
  }
  
  if (typeof window !== 'undefined') {
    // Open the primary URL
    window.open(primaryURL, '_blank');
    
    // Provide user feedback and alternatives
    setTimeout(() => {
      const userWantsAlternatives = confirm(
        `Bring! page opened. If ingredients were not added automatically, click OK to try alternative formats.`
      );
      
      if (userWantsAlternatives) {
        // Show user a choice of alternatives
        const choice = prompt(
          `Choose an alternative format to try:\n` +
          `1. Comma-separated format\n` +
          `2. Hash-based individual items\n` +
          `3. Hash-based comma-separated\n` +
          `4. Data parameter format\n` +
          `5. List parameter format\n\n` +
          `Enter 1-5 or cancel:`
        );
        
        const choiceNum = parseInt(choice || '0') - 1;
        if (choiceNum >= 0 && choiceNum < alternativeURLs.length) {
          console.log('Trying alternative URL:', alternativeURLs[choiceNum]);
          window.open(alternativeURLs[choiceNum], '_blank');
        }
      }
    }, 2000);
  }
}