import LanguageDetect from "languagedetect";
import { marked } from "marked";

type RecipeType = {
  root: string;
  path: string;
  slug: string;
  author: string;
  title: string;
  imagePath: string;
  description: string;
  tags: string[];
  yields: string;
  ingredients: string;
  instructions: string;
  language: string;
};

type RecipeList = Record<string, RecipeType>;

function parseRecipe(path: string, content: string, author: string, root: string) {

  const recipe: RecipeType = {
    root: root,
    path: path,
    slug: `${author}/${path.replace(".md", "")}`,
    author: author,
    title: "",
    imagePath: "",
    description: "",
    tags: [],
    yields: "",
    ingredients: "",
    instructions: "",
    language: "",
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
    recipe.imagePath = new URL(matches[1] ?? matches[2], root).href;
  }
  return recipe;
}

export { parseRecipe };
export type { RecipeType, RecipeList };
