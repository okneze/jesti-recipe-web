import React from 'react';
import styles from './styles/Recipe.module.css'
import { RecipeType } from './util/Recipedata';
import { useMarkdown } from './util/useMarkdown';
import { Icon } from './Icon';
import { imageRenderer } from './util/md2img';

type Props = {
  recipe: RecipeType;
};

function Recipe({recipe}: Props) {
  const descriptionRef = useMarkdown<HTMLDivElement>(recipe.description, {renderer: imageRenderer(recipe.root)});
  const ingredientsRef = useMarkdown<HTMLDivElement>(recipe.ingredients);
  const instructionsRef = useMarkdown<HTMLDivElement>(recipe.instructions, {renderer: imageRenderer(recipe.root)});

  const icon = new Icon();
  document.title = `Recipe Web - ${recipe.title} - ${recipe.author}`;

  return (
      <div className={styles.layout}>
        <div className={styles.head}>
          <h1>{recipe.title}</h1>
          <a className={styles.author} href={`https://github.com/${recipe.author}`} target='_blank'>@{recipe.author}</a>
          <div className={styles.tags}>
            {recipe.tags.map((tag, idx) => (<div key={idx} className={styles.tag}>{tag}</div>))}
            <div className={styles.flag}>{icon.get(recipe.language)}</div>
          </div>
        </div>
        <div className={styles.recipe}>
          <div>Description: <div ref={descriptionRef}></div></div>
          <div>Yield: {recipe.yield}</div>
          <hr />
          <div>Ingredients: <div ref={ingredientsRef}></div></div>
          <hr />
          <div>Instructions: <div ref={instructionsRef}></div></div>
        </div>
      </div>
  );
}

export default Recipe;