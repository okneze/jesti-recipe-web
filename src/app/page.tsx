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
      
      const repo: RecipeFiles = await response.json();
      
      if(!repo.tree) {
        return (
          <div>
            <h1>Error 500</h1>
            <p>Could not fetch data from GitHub API.</p>
          </div>
        );
      }

      const recipeList = repo.tree.filter((node) => (node.path.endsWith(".md") && node.path !== "README.md"));
      
      for (const element of recipeList) {
        const root = `https://raw.githubusercontent.com/${repository.author}/${repository.repository}/${repository.branch}/`;
        const recipeURL = new URL(element.path, root).href;
        const recipe = await fetch(recipeURL, {
          next: { revalidate: 300 }, // Cache for 5 minutes
          headers: headers
        }).then((raw) => raw.text());
        const parsed = parseRecipe(element.path, recipe, repository);
        recipes[parsed.meta.slug] = parsed;
      };
      
    } catch (error) {
      return (
        <div>
          <h1>Error 500</h1>
          <p>Network error while fetching recipes.</p>
        </div>
      );
    }
  }
  return (
    <Suspense>
      <List recipes={recipes} />
    </Suspense>
  );
}
