import React, { Suspense } from "react";
import { Metadata } from "next";
import Recipe from "@/app/components/Recipe";
import { getRepositories, parseRecipe, RecipeFiles, getGitHubHeaders } from "@/app/lib/Recipedata";

type Params = Promise<{author: string, slug: string[]}>;

export async function generateStaticParams() {
    const repos = getRepositories();
    const headers = getGitHubHeaders();
    const result: {author: string, slug: string[]}[] = [];
    for(const {author, repository, branch} of repos) {
        try {
            const response = await fetch(`https://api.github.com/repos/${author}/${repository}/git/trees/${branch}?recursive=1`, {
                next: { revalidate: 300 }, // Cache for 5 minutes
                headers: headers
            });
            
            if (!response.ok) {
                console.warn(`Failed to fetch repository ${author}/${repository}: ${response.status} ${response.statusText}`);
                continue;
            }
            
            const r: RecipeFiles = await response.json();
            if(!r.tree) {
                continue;
            }
            for(const entry of r.tree) {
                if(entry.path.endsWith(".md") && !entry.path.endsWith("README.md")) {
                    const page = {
                        author: author,
                        slug: entry.path.replace(/\.md$/, "").split("/"),
                    };
                    // special characters are not resolved correctly in development environment
                    if(process.env.NODE_ENV === "development") {
                        page.slug = page.slug.map(fragment => encodeURIComponent(fragment));
                    }
                    result.push(page);
                }
            }
        } catch (error) {
            console.warn(`Error processing repository ${author}/${repository}:`, error);
            continue;
        }
    };

    return result;
}

async function getRecipe({author, slug}: {author: string, slug: string[]}) {
    const repo = getRepositories().find((r) => r.author === author);
    if(!repo) {
        return;
    }
    const headers = getGitHubHeaders();
    const root = `https://raw.githubusercontent.com/${author}/${repo.repository}/${repo.branch}/`;
    const relativePath = slug.join("/") + ".md";
    const recipeURL = new URL(relativePath, root).href;

    const recipe = await fetch(recipeURL, {
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: headers
    }).then((raw) => raw.text());
    return parseRecipe(relativePath, recipe, repo);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { author, slug } = await params;
    const parsed = await getRecipe({author, slug});
    if(!parsed) {
        return {
          title: `Recipe Web - ${author}`,
        };
    }
    return {
      title: `Recipe Web - ${author} - ${parsed.title}`,
    };
}


export default async function Page({
    params,
}: {
    params: Params
}) {
    const { slug, author } = await params;
    const parsed = await getRecipe({author, slug});
    if(!parsed) {
        return;
    }

    return (
        <Suspense>
            <Recipe recipe={parsed} />
        </Suspense>
    )
}