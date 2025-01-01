import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import styles from './styles/Home.module.css'
import {RecipeList, RecipeType, matchRecipe} from './util/Recipedata';
import { Icon } from './Icon';

type Props = {
  recipes?: RecipeList,
  search: string,
  callbacks: {
    clear: () => void;
  }
};

function Home({recipes, search, callbacks}: Props) {
  document.title = "Recipe Web";

  const icon = new Icon();

  const [sortedRecipes, setSortedRecipes] = useState<RecipeType[]>([]);
  useEffect(() => {
    if (search !== "" && recipes) {
      setSortedRecipes(Object.values(recipes).sort((a,b) => {return matchRecipe(b, search) - matchRecipe(a, search)}));
    } else if(recipes) {
      setSortedRecipes(Object.values(recipes).sort((a,b) => a.title.localeCompare(b.title)));
    }
  }, [search, recipes]);

  return (
    <>
      <h1 hidden={true}>Recipe Web</h1>
      <div className={styles.cardbox}>
        {sortedRecipes.map((recipe, idx) => {
          const match = matchRecipe(recipe, search);
          if (search === "" || match >= 0.4 + search.length * 0.02) {
            return (
              <Link to={`/${recipe.slug}`} key={idx} className={styles.card} onClick={callbacks.clear} style={{'--rotate': `${Math.random() * 4 - 2}deg`}}>
                {recipe.imagePath.length > 1 ? <img className={styles.preview} src={recipe.imagePath} alt="" /> : <div className={styles['no-preview']}>{icon.get('food')}</div>}
                <div className={styles.flag}>{icon.get(recipe.language)}</div>
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
          } else {
            return (<React.Fragment key={idx}></React.Fragment>)
          }
        })}
      </div>
    </>
  );
}

export default Home;