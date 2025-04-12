'use client'

import React from 'react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Fuse from 'fuse.js';

import styles from '@/app/styles/Home.module.css';
import {RecipeList, RecipeType, Repository} from '@/app/lib/Recipedata';
import FoodSVG from '@/app/svg/food';
import GithubSVG from '@/app/svg/github';
import { useSearchContext } from '@/app/context/search';

type Props = {
  recipes?: RecipeList,
  repo?: Repository,
};

function shuffleArray<T>(array: Array<T>) {
  let curId = array.length;
  // There remain elements to shuffle
  while (0 !== curId) {
    // Pick a remaining element
    const randId = Math.floor(Math.random() * curId);
    curId -= 1;
    // Swap it with the current element.
    const tmp = array[curId];
    array[curId] = array[randId];
    array[randId] = tmp;
  }
  return array;
}

export default function List({recipes, repo}: Props) {
  // document.title = "Recipe Web";

  const query = useSearchParams();
  const [searchSlow] = useSearchContext();
  const search = useDeferredValue(searchSlow);

  const recipesPrefiltered = useMemo(() => {
    if (!recipes) {
      return [];
    }
    const tag = query.get("tag");
    return Object.values(recipes ?? []).filter((recipe) => (!repo?.author || recipe.meta.author === repo.author) && (!tag || recipe.tags.includes(tag)));
  }, [recipes, repo, query]);

  const [sortedRecipes, setSortedRecipes] = useState<RecipeType[]>([]);
  useEffect(() => {
    if(!recipes) {
      return;
    }

    const fuse = new Fuse(recipesPrefiltered, {
      keys: [
        {name: 'title', weight: 10},
        {name: 'tags', weight: 5},
        'author',
        'description',
        'ingredients',
        'instructions'
      ],
      threshold: 0.4,
    });
    const fuseAuthor = new Fuse(Object.values(recipes), {keys: ['author']});
    if (search.startsWith("@")) {
      setSortedRecipes(fuseAuthor.search(search.replace(/^@/, "")).map((result) => result.item));
    // } else if(search.startsWith("#") && recipes) {
    //   setSortedRecipes(fuseTag.search(search.replace(/^#/, "")).map((result) => result.item));
    } else if(search !== "") {
      setSortedRecipes(fuse.search(search).map((result) => result.item));
    } else {
      setSortedRecipes(shuffleArray(recipesPrefiltered));
    }
  }, [search, recipes, repo, recipesPrefiltered]);

  return (
    <>
      <h1 hidden={true}>Recipe Web</h1>
      {search && (
        <>
          <div className={styles['search-result-count']}>{sortedRecipes.length} / {recipesPrefiltered.length}</div>
        </>
      )}
      {repo && (
        <>
          <h2>@{repo.author}</h2>
          <a href={`https://github.com/${repo.author}/${repo.repository}`} target='_blank' rel='noreferrer'>
            GitHub
            <GithubSVG aria-hidden="true" className={styles.github} />
          </a>
        </>
      )}
      <div className={styles.cardbox}>
        {sortedRecipes.map((recipe, idx) => {
          return (
            <Link href={`/${recipe.meta.slug}`} key={idx} className={styles.card} style={{'--rotate': `${Math.random() * 4 - 2}deg`} as React.CSSProperties}>
              {recipe.imagePath.length > 1 ? <Image className={styles.preview} src={recipe.imagePath} alt="" width={400} height={300} loading='lazy' /> : <div className={styles['no-preview']}><FoodSVG /></div>}
              <div className={styles.author}>@{recipe.meta.author}</div>
              <div className={styles['card-content']}>
                <h3 className={styles.title}>
                  {recipe.title}
                </h3>
                <div className={styles.tags}>
                  {recipe.tags.join(", ")}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  );
}
