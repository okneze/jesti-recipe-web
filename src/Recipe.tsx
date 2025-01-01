import React, { useEffect, useState } from 'react';
import styles from './styles/Recipe.module.css'
import { RecipeType } from './util/Recipedata';
import { useMarkdown } from './util/useMarkdown';
import { Icon } from './Icon';
import { imageRenderer, ingredientRenderer } from './util/marked';

type Props = {
  recipe: RecipeType;
};

function Recipe({recipe}: Props) {
  const [multiplier, setMultiplier] = useState(1);
  const [ingredientsOptions] = useState({renderer: ingredientRenderer(multiplier)});
  const [description] = useMarkdown(recipe.description, {renderer: imageRenderer(recipe.root)});
  const [ingredients, setIngredients] = useMarkdown(recipe.ingredients, ingredientsOptions);
  const [instructions] = useMarkdown(recipe.instructions, {renderer: imageRenderer(recipe.root)});

  const icon = new Icon();
  document.title = `Recipe Web - ${recipe.title} - ${recipe.author}`;

  useEffect(() => {
    setIngredients({renderer: ingredientRenderer(multiplier)});
  }, [multiplier, setIngredients]);

  return (
      <div className={styles.layout}>
        <div className={styles.head}>
          <h1>{recipe.title}</h1>
          <a className={styles.author} href={`https://github.com/${recipe.author}`} target='_blank' rel='noreferrer'>@{recipe.author}</a>
          <div className={styles.tags}>
            {recipe.tags.map((tag, idx) => (<div key={idx} className={styles.tag}>{tag}</div>))}
            <div className={styles.flag}>{icon.get(recipe.language)}</div>
          </div>
        </div>
        <label>
          <span>Multiplier: </span>
          <input type='number' onChange={(event) => setMultiplier(Number.parseFloat(event.target.value))} value={multiplier} />
        </label>
        <div className={styles.recipe}>
          <div>Description: <div dangerouslySetInnerHTML={{__html: description}}></div></div>
          <div>Yield: {recipe.yield}</div>
          <hr />
          <div>Ingredients: <div dangerouslySetInnerHTML={{__html: ingredients}}></div></div>
          <hr />
          <div>Instructions: <div dangerouslySetInnerHTML={{__html: instructions}}></div></div>
        </div>
      </div>
  );
}

export default Recipe;