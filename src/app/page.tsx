import React, { Suspense } from "react";
import { getRepositories, parseRecipe, RecipeFiles, RecipeList, getGitHubHeaders } from "@/app/lib/Recipedata";
import List from "@/app/components/List";

export default async function Home() {
  const repos = getRepositories();
  const recipes: RecipeList = {};
  const headers = getGitHubHeaders();
  
  // Debug info
  console.log('Environment check:', {
    nodeEnv: process.env.NODE_ENV,
    hasGitHubToken: !!process.env.GITHUB_TOKEN,
    repositories: repos
  });
  
  for(const repository of repos) {
    const apiUrl = `https://api.github.com/repos/${repository.author}/${repository.repository}/git/trees/${repository.branch}?recursive=1`;
    
    try {
      const response = await fetch(apiUrl, {
        cache: 'no-store', // Temporarily disable caching for debugging
        headers: headers
      });
      
      console.log('GitHub API Response:', {
        url: apiUrl,
        status: response.status,
        statusText: response.statusText,
        hasAuth: !!headers.Authorization
      });
      
      const repo: RecipeFiles = await response.json();
      
      if(!repo.tree) {
        console.error('GitHub API Error:', repo);
        return (
          <div>
            <h1>Error 500</h1>
            <p>Could not fetch data from GitHub API.</p>
            <details>
              <summary>Debug Info</summary>
              <pre>{JSON.stringify({
                url: apiUrl,
                status: response.status,
                hasToken: !!process.env.GITHUB_TOKEN,
                response: repo
              }, null, 2)}</pre>
            </details>
          </div>
        );
      }

      const recipeList = repo.tree.filter((node) => (node.path.endsWith(".md") && node.path !== "README.md"));
      console.log('Found recipe files:', recipeList.map(r => r.path));
      
      for (const element of recipeList) {
        const root = `https://raw.githubusercontent.com/${repository.author}/${repository.repository}/${repository.branch}/`;
        const recipeURL = new URL(element.path, root).href;
        const recipe = await fetch(recipeURL, {
          cache: 'no-store', // Temporarily disable caching for debugging
          headers: headers
        }).then((raw) => raw.text());
        const parsed = parseRecipe(element.path, recipe, repository);
        recipes[parsed.meta.slug] = parsed;
      };
      
    } catch (error) {
      console.error('Error fetching repository:', error);
      return (
        <div>
          <h1>Error 500</h1>
          <p>Network error while fetching recipes.</p>
          <pre>{String(error)}</pre>
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
