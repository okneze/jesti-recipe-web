import { NextRequest, NextResponse } from 'next/server';
import { getRepositories, parseRecipe, RecipeFiles, getGitHubHeaders } from '@/app/lib/Recipedata';

/**
 * Temporary Recipe Access Endpoint
 * 
 * Serves recipe content without authentication using temporary tokens.
 * This allows Bring's servers to access and parse recipes.
 */

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const params = await context.params;
  const token = params.token;

  // Validate token
  const tokenData = global.recipeTokenStore?.get(token);
  
  if (!tokenData) {
    return new NextResponse('Invalid or expired token', { status: 404 });
  }

  if (tokenData.expiresAt < Date.now()) {
    global.recipeTokenStore.delete(token);
    return new NextResponse('Token has expired', { status: 410 });
  }

  try {
    // Fetch the recipe
    const repos = getRepositories();
    const headers = getGitHubHeaders();
    
    for (const repository of repos) {
      const apiUrl = `https://api.github.com/repos/${repository.author}/${repository.repository}/git/trees/${repository.branch}?recursive=1`;
      
      const response = await fetch(apiUrl, {
        next: { revalidate: 300 },
        headers: headers
      });
      
      if (!response.ok) continue;
      
      const repo: RecipeFiles = await response.json();
      if (!repo.tree) continue;

      const recipeList = repo.tree.filter((node) => 
        node.path.endsWith('.md') && node.path !== 'README.md'
      );
      
      for (const element of recipeList) {
        const slug = element.path.replace(/\.md$/, '').replace(/\//g, '-');
        
        if (slug !== tokenData.recipeSlug) continue;
        
        // Found the recipe!
        const root = `https://raw.githubusercontent.com/${repository.author}/${repository.repository}/${repository.branch}/`;
        const recipeURL = new URL(element.path, root).href;
        const recipeResponse = await fetch(recipeURL, {
          next: { revalidate: 300 },
          headers: headers
        });
        
        if (!recipeResponse.ok) continue;
        
        const recipeContent = await recipeResponse.text();
        const recipe = parseRecipe(element.path, recipeContent, repository);
        
        // Return HTML with schema.org markup for Bring to parse
        const html = generateRecipeHTML(recipe);
        
        return new NextResponse(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Robots-Tag': 'noindex, nofollow' // Prevent indexing of temporary URLs
          }
        });
      }
    }
    
    return new NextResponse('Recipe not found', { status: 404 });
    
  } catch (error) {
    console.error('Error serving temporary recipe:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

function generateRecipeHTML(recipe: { title: string; meta: { author: string }; yields: string; ingredients: string; instructions: string }): string {
  // Extract plain text ingredients from markdown
  const ingredients = recipe.ingredients
    .split('\n')
    .filter((line: string) => line.trim())
    .map((line: string) => {
      // Remove markdown formatting and list markers
      return line
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/[*_`]/g, '')
        .replace(/^\s*[-*+]\s*/, '')
        .trim();
    });

  return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>${recipe.title}</title>
</head>
<body itemscope itemtype="https://schema.org/Recipe">
    <h1 itemprop="name">${recipe.title}</h1>
    <p>Von: <span itemprop="author">${recipe.meta.author}</span></p>
    <meta itemprop="recipeYield" content="${recipe.yields}" />
    
    <h2>Zutaten:</h2>
    <ul>
        ${ingredients.map((ingredient: string) => 
          `<li><meta itemprop="recipeIngredient" content="${ingredient}" />${ingredient}</li>`
        ).join('\n        ')}
    </ul>
    
    <div itemprop="recipeInstructions">
        <h2>Zubereitung:</h2>
        ${recipe.instructions}
    </div>
    
    <p><em>Dieser Link ist temporär und läuft in 15 Minuten ab.</em></p>
</body>
</html>`;
}

// Type declaration for global token store
declare global {
  // eslint-disable-next-line no-var
  var recipeTokenStore: Map<string, { recipeSlug: string; expiresAt: number }>;
}
