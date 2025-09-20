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
 * Tries multiple URL formats that are commonly supported
 */
export function generateBringUrl(ingredients: Ingredient[]): string {
  const items = ingredients.map(ingredient => {
    return ingredient.amount 
      ? `${ingredient.amount} ${ingredient.name}`
      : ingredient.name;
  });
  
  const itemsText = items.join('\n');
  const encodedItems = encodeURIComponent(itemsText);
  
  // Use the Bring! web app URL format for importing items
  return `https://web.getbring.com/#/app/lists/add?text=${encodedItems}`;
}

/**
 * Generates multiple possible Bring! app URLs to try
 */
export function generateBringAppUrls(ingredients: Ingredient[]): string[] {
  const items = ingredients.map(ingredient => {
    return ingredient.amount 
      ? `${ingredient.amount} ${ingredient.name}`
      : ingredient.name;
  });
  
  const itemsText = items.join('\n');
  const itemsList = items.join(',');
  const encodedText = encodeURIComponent(itemsText);
  const encodedList = encodeURIComponent(itemsList);
  
  // Try different URL schemes that Bring! might support
  return [
    `bring://import?text=${encodedText}`,
    `bring://add?text=${encodedText}`,
    `bring://list?items=${encodedList}`,
    `bring://shopping?list=${encodedList}`,
    `bring://addItems?items=${encodedList}`,
    `getbring://import?text=${encodedText}`,
    `getbring://add?text=${encodedText}`
  ];
}

/**
 * Legacy function for backwards compatibility
 */
export function generateBringAppUrl(ingredients: Ingredient[]): string {
  return generateBringAppUrls(ingredients)[0];
}

/**
 * Opens Bring! with the ingredient list
 * Tries multiple app URL schemes with intelligent fallback
 */
export function openBringWithIngredients(ingredients: Ingredient[]): void {
  const appUrls = generateBringAppUrls(ingredients);
  const webUrl = generateBringUrl(ingredients);
  
  let appOpened = false;
  
  // First, try a simple direct link approach
  const tryDirectLink = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Try the first few app URLs with direct links
  appUrls.slice(0, 3).forEach((url, index) => {
    setTimeout(() => {
      if (!appOpened) {
        tryDirectLink(url);
      }
    }, index * 300);
  });
  
  // Iframe approach as backup
  let currentUrlIndex = 3;
  const tryNextAppUrl = () => {
    if (currentUrlIndex >= appUrls.length || appOpened) {
      return;
    }
    
    const currentUrl = appUrls[currentUrlIndex];
    currentUrlIndex++;
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = currentUrl;
    
    iframe.onload = () => {
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      }, 100);
    };
    
    iframe.onerror = () => {
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
      setTimeout(tryNextAppUrl, 200);
    };
    
    document.body.appendChild(iframe);
    
    setTimeout(() => {
      if (!appOpened && iframe.parentNode) {
        document.body.removeChild(iframe);
        tryNextAppUrl();
      }
    }, 600);
  };
  
  // Start iframe attempts after direct link attempts
  setTimeout(tryNextAppUrl, 1000);
  
  // Listen for page visibility/focus changes
  const handleVisibilityChange = () => {
    if (document.hidden) {
      appOpened = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    }
  };
  
  const handleBlur = () => {
    appOpened = true;
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleBlur);
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleBlur);
  
  // Final fallback to web URL
  setTimeout(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleBlur);
    
    if (!appOpened) {
      window.open(webUrl, '_blank');
    }
  }, 3500);
}