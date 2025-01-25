import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Fuse, { IFuseOptions } from 'fuse.js';

import styles from './styles/Home.module.css'
import {RecipeList, RecipeType} from './util/Recipedata';
import { Icon } from './Icon';

type Props = {
  recipes?: RecipeList,
  search: string,
  author?: string,
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

function Home({recipes, search, callbacks, author}: Props) {
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
    return new Fuse(Object.values(recipes ?? []).filter((recipe) => !author || recipe.meta.author === author), fuseOptions)
  }, [recipes, author]);

  const [sortedRecipes, setSortedRecipes] = useState<RecipeType[]>([]);
  useEffect(() => {
    if (search !== "" && recipes) {
      setSortedRecipes(fuse.search(search).map((result) => result.item));
    } else if(recipes) {
      setSortedRecipes(shuffleArray(Object.values(recipes).filter((recipe) => !author || recipe.meta.author === author)));
    }
  }, [search, recipes, author, fuse]);

  return (
    <>
      <h1 hidden={true}>Recipe Web</h1>
      {author && (
        <>
          <h2>@{author}</h2>
          <a href={`https://github.com/${author}`} target='_blank' rel='noreferrer'>GitHub</a>
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