import LanguageDetect from "languagedetect";

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

  for(let line of content.split("\n")) {
    // first block with general information
    if(/^([-]{3,}|[*]{3,}|[_]{3,})$/.test(line)) {
      blockCount += 1;
      continue;
    }
    switch(blockCount) {
    case 0:
      if(line.startsWith("# ")) {
        recipe.title = line.replace("# ", "");
      } else if(line.startsWith("**")) {
        recipe.yields = line.split("**")[1];
      } else if(line.startsWith("*")) {
        recipe.tags = line.replaceAll(", ", ",").split("*")[1].split(",");
      } else {
        recipe.description += line + "\n";
        // TODO post: remove double excess new lines
      }
      break;
    case 1:
      recipe.ingredients += line + "\n";
      break;
    default:
      recipe.instructions += line + "\n";
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
