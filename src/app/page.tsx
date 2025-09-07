import React, { Suspense } from "react";
import { getRepositories, parseRecipe, RecipeFiles, RecipeList, getGitHubHeaders } from "@/app/lib/Recipedata";
import List from "@/app/components/List";

export default async function Home() {
  const repos = getRepositories();
  const recipes: RecipeList = {};
  const headers = getGitHubHeaders();
  
  for(const repository of repos) {
    const repo: RecipeFiles = await fetch(`https://api.github.com/repos/${repository.author}/${repository.repository}/git/trees/${repository.branch}?recursive=1`, {
      cache: 'force-cache',
      headers: headers
    }).then((res) => res.json());
    
    if(!repo.tree) {
      return (
        <div>
          <h1>Error 500</h1>
          <p>Could not fetch data.</p>
        </div>
      );
    }

    const recipeList = repo.tree.filter((node) => (node.path.endsWith(".md") && node.path !== "README.md"));
    for (const element of recipeList) {
      const root = `https://raw.githubusercontent.com/${repository.author}/${repository.repository}/${repository.branch}/`;
      const recipeURL = new URL(element.path, root).href;
      const recipe = await fetch(recipeURL, {
        cache: 'force-cache',
        headers: headers
      }).then((raw) => raw.text());
      const parsed = parseRecipe(element.path, recipe, repository);
      recipes[parsed.meta.slug] = parsed;
    };
  }
  return (
    <Suspense>
      <List recipes={recipes} />
    </Suspense>
  );
}
