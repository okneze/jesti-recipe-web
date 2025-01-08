import React, { useEffect, useMemo, useState } from 'react';
import styles from './styles/Recipe.module.css'
import { RecipeType } from './util/Recipedata';
import { useMarkdown } from './util/useMarkdown';
import { Icon } from './Icon';
import { imageRenderer, ingredientRenderer, multiplyAmount, splitAmountList, splitAmountUnit } from './util/marked';
import Fraction from 'fraction.js';

type Props = {
  recipe: RecipeType;
};

function Recipe({recipe}: Props) {
  const [multiplier, setMultiplier] = useState(1);
  const baseYields = useMemo(() => splitAmountList(recipe.yields).map((amnt) => new Fraction(splitAmountUnit(amnt)[0].replace(",", ".").split("-")[0]).valueOf()), [recipe]);
  const [yields, setYields] = useState(splitAmountList(recipe.yields).map((amnt) => multiplyAmount(amnt, multiplier)));
  const [ingredientsOptions] = useState({renderer: ingredientRenderer(multiplier)});
  const [description] = useMarkdown(recipe.description, {renderer: imageRenderer(recipe.root)});
  const [ingredients, setIngredients] = useMarkdown(recipe.ingredients, ingredientsOptions);
  const [instructions] = useMarkdown(recipe.instructions, {renderer: imageRenderer(recipe.root)});

  const icon = new Icon();
  document.title = `Recipe Web - ${recipe.title} - ${recipe.author}`;

  useEffect(() => {
    setIngredients({renderer: ingredientRenderer(multiplier)});
  }, [multiplier, setIngredients]);

  useEffect(() => {
    setYields(splitAmountList(recipe.yields).map((amnt) => multiplyAmount(amnt, multiplier)));
  }, [multiplier, setYields, recipe, baseYields]);

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
        <div className={styles.recipe}>
          <div>Description: <div dangerouslySetInnerHTML={{__html: description}}></div></div>
          <div>Yields: 
            {yields.map((value, idx) => {
              let amount = splitAmountUnit(value);
              return (
                <label key={idx} className={styles['yield-label']}>
                  <input type='number' className={styles['yield-input']} onChange={(event) => setMultiplier(Number.parseFloat(event.target.value) / baseYields[idx])} value={amount[0]} />
                  <span>{amount.length > 1 && amount[1]}</span>,
                </label>
              );
            })}
            <label className={styles['yield-label']}>
              {`(`}
              <span>Multiplier: </span>
              <input type='number' className={styles['yield-input']} onChange={(event) => setMultiplier(Number.parseFloat(event.target.value))} value={multiplier} />
              {`)`}
            </label>
          </div>
          <hr />
          <div>Ingredients: <div dangerouslySetInnerHTML={{__html: ingredients}}></div></div>
          <hr />
          <div>Instructions: <div dangerouslySetInnerHTML={{__html: instructions}}></div></div>
        </div>
      </div>
  );
}

export default Recipe;