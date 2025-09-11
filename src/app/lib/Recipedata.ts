import LanguageDetect from "languagedetect";
import { marked } from "marked";
import {z} from "zod";

type Repository = {
  author: string;
  repository: string;
  branch: string;
};

type RecipeType = {
  meta: RecipeMeta;
  title: string;
  imagePath: string;
  description: string;
  tags: string[];
  yields: string;
  ingredients: string;
  instructions: string;
  language: string;
  score: number;
};

type RecipeMeta = Repository & {
  path: string;
  slug: string;
}

type RecipeFiles = {
  sha: string;
  url: string;
  tree: {
    path: string;
    mode: string;
    type: string;
    sha: string;
    size: number;
    url: string;
  }[];
};

type RecipeList = Record<string, RecipeType>;

const GITHUB_RAW = "https://raw.githubusercontent.com";

function rawRoot(recipe: RecipeType): string {
  return `${GITHUB_RAW}/${recipe.meta.author}/${recipe.meta.repository}/${recipe.meta.branch}/`;
}

function proxyImageUrl(imagePath: string, recipe: RecipeType): string {
  // Create proxy URL for authenticated image access
  const params = new URLSearchParams({
    author: recipe.meta.author,
    repository: recipe.meta.repository,
    branch: recipe.meta.branch,
    path: imagePath
  });
  return `/api/image?${params.toString()}`;
}

function getRepositories(): Repository[] {
  const repos: Repository[] = JSON.parse(process.env.REPOSITORIES ?? '[]');
  const repositorySchema = z.object({
    author: z.string(),
    repository: z.string(),
    branch: z.string(),
  }).array();
  return repositorySchema.parse(repos);
}

function getGitHubHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

function parseRecipe(path: string, content: string, repository: Repository) {

  const recipe: RecipeType = {
    meta: {
      path: path,
      slug: `${repository.author}/${path.replace(".md", "")}`,
      ...repository,
    },
    title: "",
    imagePath: "",
    description: "",
    tags: [],
    yields: "",
    ingredients: "",
    instructions: "",
    language: "",
    score: 0,
  };

  let blockCount = 0;

  const tokens = marked.lexer(content);

  for(const token of tokens) {
    if(token.type === "hr") {
      blockCount += 1;
      continue;
    }
    switch(blockCount) {
    case 0:
      if(token.type === "heading" && token.depth === 1) {
        recipe.title = token.text;
        continue;
      }
      if(token.type === "paragraph") {
        if(token.tokens && token.tokens.length > 0) {
          if(token.tokens[0].type === "em") {
            recipe.tags = token.tokens[0].text.replaceAll(", ", ",").split(",");
            continue;
          }
          if(token.tokens[0].type === "strong") {
            recipe.yields = token.tokens[0].text;
            continue;
          }
        }
      }
      recipe.description += token.raw;
      break;
    case 1:
      recipe.ingredients += token.raw;
      break;
    default:
      recipe.instructions += token.raw;
    }
  }
  //   detect language for the static strings
  const lng = new LanguageDetect();
  recipe.language = lng.detect(content, 1)[0][0];
  // get the first image
  const matches = /!\[.*?\]\((.+?)\)|<img.+?src="(.+?)"/g.exec(content);
  if(matches) {
    const imagePath = matches[1] ?? matches[2];
    // Check if it's a relative path (doesn't start with http)
    if (!imagePath.startsWith('http')) {
      recipe.imagePath = proxyImageUrl(imagePath, recipe);
    } else {
      recipe.imagePath = imagePath;
    }
  }
  return recipe;
}

export { getRepositories, parseRecipe, rawRoot, getGitHubHeaders, proxyImageUrl };
export type { RecipeType, RecipeList, Repository, RecipeFiles };
