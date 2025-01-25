import React, { useEffect, useMemo, useState } from 'react';
import styles from './styles/Recipe.module.css'
import { rawRoot, RecipeType } from './util/Recipedata';
import { useMarkdown } from './util/useMarkdown';
import { Icon } from './Icon';
import { imageRenderer, ingredientRenderer, linkRenderer, multiplyAmount, splitAmountList, splitAmountUnit } from './util/marked';
import Fraction from 'fraction.js';

type Props = {
  recipe: RecipeType;
};

function splitAmount(amount: string) {
  try {
    return new Fraction(splitAmountUnit(amount)[0].replace(",", ".").split("-")[0]).valueOf();
  } catch {
    return 1;
  }
}

function Recipe({recipe}: Props) {
  const [multiplier, setMultiplier] = useState(1);
  const [multiplierStr, setMultiplierStr] = useState("1");
  const baseYields = useMemo(() => splitAmountList(recipe.yields).map(splitAmount), [recipe]);
  const [yields, setYields] = useState(splitAmountList(recipe.yields).map((amnt) => multiplyAmount(amnt, multiplier)));
  const [ingredientsOptions] = useState({renderer: {...ingredientRenderer(multiplier), ...linkRenderer()}});
  const [description] = useMarkdown(recipe.description, {renderer: imageRenderer(rawRoot(recipe))});
  const [ingredients, setIngredients] = useMarkdown(recipe.ingredients, ingredientsOptions);
  const [instructions] = useMarkdown(recipe.instructions, {renderer: {...imageRenderer(rawRoot(recipe)), ...linkRenderer()}});

  const icon = new Icon();
  document.title = `Recipe Web - ${recipe.title} - ${recipe.meta.author}`;

  useEffect(() => {
    setIngredients({renderer: {...ingredientRenderer(multiplier), ...linkRenderer()}});
  }, [multiplier, setIngredients]);

  useEffect(() => {
    setYields(splitAmountList(recipe.yields).map((amnt) => multiplyAmount(amnt, multiplier)));
  }, [multiplier, setYields, recipe, baseYields]);

  function adjustMultiplier(value: string, divisor: number = 1): void {
    const v = value.replace(/^0*/, "");
    if(v === "" || v.startsWith("-")) {
      setMultiplier(0);
      setMultiplierStr("0");
    } else {
      const result = Number.parseFloat(v) / divisor;
      setMultiplier(result);
      setMultiplierStr(`${Number.parseFloat(new Fraction(result).simplify().valueOf().toFixed(2))}`);
    }
  }

  return (
      <div className={styles.layout}>
        <div className={styles.head}>
          <h1>
            <a href={`https://github.com/${recipe.meta.author}/${recipe.meta.repository}/blob/${recipe.meta.branch}/${recipe.meta.path}`} target='_blank' rel='noreferrer'>
              {recipe.title}
              <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 16 16" width="20" aria-hidden="true" className={styles.github}>
                <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
            </a>
          </h1>
          <a className={styles.author} href={`/${recipe.meta.author}`}>@{recipe.meta.author}</a>
          <div className={styles.tags}>
            {recipe.tags.map((tag, idx) => (<div key={idx} className={styles.tag}>{tag}</div>))}
            <div className={styles.flag}>{icon.get(recipe.language)}</div>
          </div>
        </div>
        <div className={styles.recipe}>
          <div className={styles.description} dangerouslySetInnerHTML={{__html: description}}></div>
          <div className={styles['instructions-container']}>
            <div className={styles['yields-and-ingredients']}>
              <div className={styles.yields}>
                {yields.map((value, idx) => {
                  let amount = splitAmountUnit(value);
                  return (
                    <div key={idx}>
                      <button className={styles['yields-btn']} onClick={() => adjustMultiplier(`${multiplier - 1 / baseYields[idx]}`)}>{icon.get('minus')}</button>
                      <label className={styles['yields-label']}>
                        <input type='number' className={styles['yields-input']} onChange={(event) => adjustMultiplier(event.target.value, baseYields[idx])} value={amount[0]} />
                        <span>{amount.length > 1 && amount[1]}</span>
                      </label>
                      <button className={styles['yields-btn']} onClick={() => adjustMultiplier(`${multiplier + 1 / baseYields[idx]}`)}>{icon.get('plus')}</button>
                    </div>
                  );
                })}
                <div>
                  <button className={styles['yields-btn']} onClick={() => adjustMultiplier(multiplier - 1 + "")}>{icon.get('minus')}</button>
                  <label className={styles['yields-label']}>
                    <input type='number' className={styles['yields-input']} onChange={(event) => adjustMultiplier(event.target.value)} value={multiplierStr} />
                    <span> (Multiplier)</span>
                  </label>
                  <button className={styles['yields-btn']} onClick={() => adjustMultiplier(multiplier + 1 + "")}>{icon.get('plus')}</button>
                </div>
              </div>
              <div className={styles.ingredients} dangerouslySetInnerHTML={{__html: ingredients}}></div>
            </div>
            <div className={styles.instructions} dangerouslySetInnerHTML={{__html: instructions}}></div>
          </div>
        </div>
      </div>
  );
}

export default Recipe;