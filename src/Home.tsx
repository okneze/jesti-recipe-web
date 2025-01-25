import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Fuse, { IFuseOptions } from 'fuse.js';

import styles from './styles/Home.module.css'
import {RecipeList, RecipeType, Repository} from './util/Recipedata';
import { Icon } from './Icon';

type Props = {
  recipes?: RecipeList,
  search: string,
  repo?: Repository,
  callbacks: {
    clear: () => void;
  }
};

function shuffleArray<T>(array: Array<T>) {
  let curId = array.length;
  // There remain elements to shuffle
  while (0 !== curId) {
    // Pick a remaining element
    let randId = Math.floor(Math.random() * curId);
    curId -= 1;
    // Swap it with the current element.
    let tmp = array[curId];
    array[curId] = array[randId];
    array[randId] = tmp;
  }
  return array;
}

function Home({recipes, search, callbacks, repo}: Props) {
  document.title = "Recipe Web";

  const icon = new Icon();

  const fuse = useMemo(() => {
    const fuseOptions: IFuseOptions<RecipeType> = {
      keys: [
        {name: 'title', weight: 10},
        {name: 'tags', weight: 5},
        'author',
        'description',
        'ingredients',
        'instructions'
      ],
      threshold: 0.4,
    };
    return new Fuse(Object.values(recipes ?? []).filter((recipe) => !repo?.author || recipe.meta.author === repo.author), fuseOptions)
  }, [recipes, repo]);

  const [sortedRecipes, setSortedRecipes] = useState<RecipeType[]>([]);
  useEffect(() => {
    if (search !== "" && recipes) {
      setSortedRecipes(fuse.search(search).map((result) => result.item));
    } else if(recipes) {
      setSortedRecipes(shuffleArray(Object.values(recipes).filter((recipe) => !repo?.author || recipe.meta.author === repo.author)));
    }
  }, [search, recipes, repo, fuse]);

  return (
    <>
      <h1 hidden={true}>Recipe Web</h1>
      {repo && (
        <>
          <h2>@{repo.author}</h2>
          <a href={`https://github.com/${repo.author}/${repo.repository}`} target='_blank' rel='noreferrer'>
            GitHub
            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 16 16" width="20" aria-hidden="true" className={styles.github}>
              <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
          </a>
        </>
      )}
      <div className={styles.cardbox}>
        {sortedRecipes.map((recipe, idx) => {
          return (
            <Link to={`/${recipe.meta.slug}`} key={idx} className={styles.card} onClick={callbacks.clear} style={{'--rotate': `${Math.random() * 4 - 2}deg`}}>
              {recipe.imagePath.length > 1 ? <img className={styles.preview} src={recipe.imagePath} alt="" /> : <div className={styles['no-preview']}>{icon.get('food')}</div>}
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

export default Home;