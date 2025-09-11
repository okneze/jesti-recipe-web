import React, { Suspense } from "react";
import { getRepositories, parseRecipe, RecipeFiles, RecipeList, getGitHubHeaders } from "@/app/lib/Recipedata";
import List from "@/app/components/List";

export default async function Home() {
  const repos = getRepositories();
  const recipes: RecipeList = {};
  const headers = getGitHubHeaders();
  
  for(const repository of repos) {
    const apiUrl = `https://api.github.com/repos/${repository.author}/${repository.repository}/git/trees/${repository.branch}?recursive=1`;
    
    try {
      const response = await fetch(apiUrl, {
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: headers
      });
      
      if (!response.ok) {
        console.warn(`Failed to fetch repository ${repository.author}/${repository.repository}: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const repo: RecipeFiles = await response.json();
      
      if(!repo.tree) {
        console.warn(`No tree data found for ${repository.author}/${repository.repository}`);
        continue;
      }

      const recipeList = repo.tree.filter((node) => (node.path.endsWith(".md") && node.path !== "README.md"));
      
      for (const element of recipeList) {
        try {
          const root = `https://raw.githubusercontent.com/${repository.author}/${repository.repository}/${repository.branch}/`;
          const recipeURL = new URL(element.path, root).href;
          const recipeResponse = await fetch(recipeURL, {
            next: { revalidate: 300 }, // Cache for 5 minutes
            headers: headers
          });
          
          if (!recipeResponse.ok) {
            console.warn(`Failed to fetch recipe ${element.path}: ${recipeResponse.status} ${recipeResponse.statusText}`);
            continue;
          }
          
          const recipe = await recipeResponse.text();
          const parsed = parseRecipe(element.path, recipe, repository);
          recipes[parsed.meta.slug] = parsed;
        } catch (error) {
          console.warn(`Error processing recipe ${element.path}:`, error);
          continue;
        }
      };
      
    } catch (error) {
      console.error(`Network error while fetching repository ${repository.author}/${repository.repository}:`, error);
      continue;
    }
  }
  return (
    <Suspense>
      <List recipes={recipes} />
    </Suspense>
  );
}
