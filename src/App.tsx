import React, { useState, useEffect } from 'react';
import { Route, Routes, Link, useNavigate } from 'react-router-dom';

import Home from './Home';
import { useFetch } from './util/useFetch';
import styles from './styles/App.module.css';
import globalStyles from './styles/Global.module.css';
import {ReactComponent as HouseSVG} from "./assets/icons/house.svg";
import Recipe from './Recipe';

function App() {

  const repo = "heinrob/recipes";
  const branch = "master";

  const [recipes] = useFetch(repo, branch);

  const [searchString, setSearchString] = useState("");
  const [title, setTitle] = useState("Recipe Web");
  const [author, setAuthor] = useState("");

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
            <label>
              <span className={globalStyles['sr-only']}>Search</span>
              <input onChange={(event) => setSearchString(event.target.value)} onKeyDown={(event) => {event.key === 'Enter' && setRedirect("/")}} value={searchString} className={styles.searchbar} />
            </label>
          </div>
          <h1>{title}{author !== "" && <> - <span>{author}</span></>}</h1>
        </div>
      </header>
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Home recipes={recipes} search={searchString} callbacks={{clear: clearSearchString, setTitle, setAuthor}} />} />
          {Object.entries(recipes ?? {}).map(([slug, recipe], idx) => (
            <Route path={`${slug}`} element={<Recipe recipe={recipe} callbacks={{setTitle, setAuthor}} key={`recipe-${idx}`} />} key={`route-${idx}`} />
          ))}
        </Routes>
      </main>
      <footer className={styles.footer}>©2025, Robin Heinbockel<br />recipes provided by the respective GitHub users</footer>
    </>
  );
}

export default App;
