'use client'

import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Fraction from 'fraction.js';
import styles from '@/app/styles/Recipe.module.css'
import { rawRoot, RecipeType } from '@/app/lib/Recipedata';
import { useMarkdown } from '@/app/lib/useMarkdown';
import { imageRenderer, ingredientRenderer, linkRenderer, multiplyAmount, splitAmountList, splitAmountUnit } from '@/app/lib/marked';

import MinusSVG from '@/app/svg/minus';
import PlusSVG from '@/app/svg/plus';
import GithubSVG from '@/app/svg/github';
import Flag from '@/app/svg/Flag';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

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

export default function Recipe({recipe}: Props) {
  const searchParams = useSearchParams();
  const queryMultiplier = searchParams.get("m");
  const router = useRouter();
  const pathName = usePathname();

  const [multiplier, setMultiplier] = useState(queryMultiplier ? parseFloat(queryMultiplier) : 1);
  const [multiplierStr, setMultiplierStr] = useState("" + multiplier);
  const baseYields = useMemo(() => splitAmountList(recipe.yields).map(splitAmount), [recipe]);
  const [yields, setYields] = useState(splitAmountList(recipe.yields).map((amnt) => multiplyAmount(amnt, multiplier)));
  const [ingredientsOptions] = useState({renderer: {...ingredientRenderer(multiplier), ...linkRenderer()}});
  const [description] = useMarkdown(recipe.description, {renderer: imageRenderer(rawRoot(recipe))});
  const [ingredients, setIngredients] = useMarkdown(recipe.ingredients, ingredientsOptions);
  const [instructions] = useMarkdown(recipe.instructions, {renderer: {...imageRenderer(rawRoot(recipe)), ...linkRenderer()}});

  // document.title = `Recipe Web - ${recipe.title} - ${recipe.meta.author}`;

  useEffect(() => {
    setIngredients({renderer: {...ingredientRenderer(multiplier), ...linkRenderer()}});
  }, [multiplier, setIngredients]);

  useEffect(() => {
    setYields(splitAmountList(recipe.yields).map((amnt) => multiplyAmount(amnt, multiplier)));
  }, [multiplier, setYields, recipe, baseYields]);

  function adjustMultiplier(value: string, divisor: number = 1): void {
    const v = value.replace(/^0*/, "");
    const result = v === "" || v.startsWith("-") ? 0 : Number.parseFloat(v) / divisor;
    setMultiplier(result);
    setMultiplierStr(`${Number.parseFloat(new Fraction(result).simplify().valueOf().toFixed(2))}`);

    // update search parameter
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("m", "" + result);
    const param = current.toString();
    router.replace(`${pathName}${param ? '?' : ""}${param}`);
  }

  return (
      <div className={styles.layout}>
        <div className={styles.head}>
          <h1>
            <a href={`https://github.com/${recipe.meta.author}/${recipe.meta.repository}/blob/${recipe.meta.branch}/${recipe.meta.path}`} target='_blank' rel='noreferrer'>
              {recipe.title}
              <GithubSVG aria-hidden="true" className={styles.github} />
            </a>
          </h1>
          <a className={styles.author} href={`/${recipe.meta.author}`}>@{recipe.meta.author}</a>
          <div className={styles.tags}>
            {recipe.tags.map((tag, idx) => (<a href={`/?tag=${tag}`} key={idx} className={styles.tag}>{tag}</a>))}
            <div className={styles.flag}><Flag code={recipe.language} /></div>
          </div>
        </div>
        <div className={styles.recipe}>
          <div className={styles.description} dangerouslySetInnerHTML={{__html: description}}></div>
          <div className={styles['instructions-container']}>
            <div className={styles['yields-and-ingredients']}>
              <div className={styles.yields}>
                {yields.map((value, idx) => {
                  const amount = splitAmountUnit(value);
                  return (
                    <div key={idx}>
                      <button className={styles['yields-btn']} onClick={() => adjustMultiplier(`${multiplier - 1 / baseYields[idx]}`)}><MinusSVG /></button>
                      <label className={styles['yields-label']}>
                        <input type='number' className={styles['yields-input']} onChange={(event) => adjustMultiplier(event.target.value, baseYields[idx])} value={amount[0]} />
                        <span>{amount.length > 1 && amount[1]}</span>
                      </label>
                      <button className={styles['yields-btn']} onClick={() => adjustMultiplier(`${multiplier + 1 / baseYields[idx]}`)}><PlusSVG /></button>
                    </div>
                  );
                })}
                <div>
                  <button className={styles['yields-btn']} onClick={() => adjustMultiplier(multiplier - 1 + "")}><MinusSVG /></button>
                  <label className={styles['yields-label']}>
                    <input type='number' className={styles['yields-input']} onChange={(event) => adjustMultiplier(event.target.value)} value={multiplierStr} />
                    <span> (Multiplier)</span>
                  </label>
                  <button className={styles['yields-btn']} onClick={() => adjustMultiplier(multiplier + 1 + "")}><PlusSVG /></button>
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
