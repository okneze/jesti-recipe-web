import React, { useState, useEffect } from 'react';
import { Route, Routes, Link, useNavigate } from 'react-router-dom';

import Home from './Home';
import { useFetch } from './util/useFetch';
import styles from './styles/App.module.css';
import globalStyles from './styles/Global.module.css';
import {ReactComponent as HouseSVG} from "./assets/icons/house.svg";
import Recipe from './Recipe';

function App() {

  const repos = [
    {username: "heinrob", repository: "recipes", branch: "master"},
    {username: "tstehr", repository: "recipes", branch: "master"}
  ];

  const [recipes] = useFetch(repos);

  const [searchString, setSearchString] = useState("");

  const [redirect, setRedirect] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (redirect !== ""){
      navigate(redirect);
      setRedirect("");
    }
  }, [redirect, navigate]);

  function clearSearchString() {
    setSearchString("");
  }

  return (
    <>
      <header>
        <div className={styles['header-wrapper']}>
          <div className={styles['header-left']}>
            <Link to="/" className={styles.home} onClick={() => setSearchString("")}>
              <HouseSVG />
            </Link>
          </div>
          <span className={styles.title}>Recipe Web</span>
          <div className={styles['search-wrapper']}>
            <label>
              <span className={globalStyles['sr-only']}>Search</span>
              <input onChange={(event) => setSearchString(event.target.value)} onKeyDown={(event) => {event.key === 'Enter' && setRedirect("/")}} value={searchString} className={styles.searchbar} />
            </label>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Home recipes={recipes} search={searchString} callbacks={{clear: clearSearchString}} />} />
          {repos.map(({username}, idx) => (
            <Route path={username} element={<Home recipes={recipes} author={username} search={searchString} callbacks={{clear: clearSearchString}} />} key={idx} />
          ))}
          {Object.entries(recipes ?? {}).map(([slug, recipe], idx) => (
            <Route path={`${slug}`} element={<Recipe recipe={recipe} key={`recipe-${idx}`} />} key={`route-${idx}`} />
          ))}
        </Routes>
      </main>
      <footer className={styles.footer}>©2025, Robin Heinbockel<br />recipes provided by the respective GitHub users</footer>
    </>
  );
}

export default App;
