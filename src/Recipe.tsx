import React, { useEffect, useMemo, useState } from 'react';
import styles from './styles/Recipe.module.css'
import { RecipeType } from './util/Recipedata';
import { useMarkdown } from './util/useMarkdown';
import { Icon } from './Icon';
import { imageRenderer, ingredientRenderer, linkRenderer, multiplyAmount, splitAmountList, splitAmountUnit } from './util/marked';
import Fraction from 'fraction.js';

type Props = {
  recipe: RecipeType;
};

function Recipe({recipe}: Props) {
  const [multiplier, setMultiplier] = useState(1);
  const [multiplierStr, setMultiplierStr] = useState("1");
  const baseYields = useMemo(() => splitAmountList(recipe.yields).map((amnt) => new Fraction(splitAmountUnit(amnt)[0].replace(",", ".").split("-")[0]).valueOf()), [recipe]);
  const [yields, setYields] = useState(splitAmountList(recipe.yields).map((amnt) => multiplyAmount(amnt, multiplier)));
  const [ingredientsOptions] = useState({renderer: {...ingredientRenderer(multiplier), ...linkRenderer()}});
  const [description] = useMarkdown(recipe.description, {renderer: imageRenderer(recipe.root)});
  const [ingredients, setIngredients] = useMarkdown(recipe.ingredients, ingredientsOptions);
  const [instructions] = useMarkdown(recipe.instructions, {renderer: {...imageRenderer(recipe.root), ...linkRenderer()}});

  const icon = new Icon();
  document.title = `Recipe Web - ${recipe.title} - ${recipe.author}`;

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
          <h1>{recipe.title}</h1>
          <a className={styles.author} href={`https://github.com/${recipe.author}`} target='_blank' rel='noreferrer'>@{recipe.author}</a>
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