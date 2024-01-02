import React, { useState, useEffect } from 'react';
import { Route, Routes, Link, useNavigate } from 'react-router-dom';

import Sheet from './Sheet';
import Home from './Home';
import data from './sheet_list.json'
import { useFetch } from './util/useFetch';
import styles from './styles/App.module.css'

function App() {

  const [sheets] = useFetch(data.files);
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
        <input onChange={(event) => setSearchString(event.target.value)} onKeyDown={(event) => {event.key === 'Enter' && setRedirect("/")}} value={searchString} className={styles.searchbar} />
        <Link to="/" className={styles.header}>
          <h1>Delyrium</h1>
        </Link>
      </header>
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Home sheets={sheets} search={searchString} clear={clearSearchString} />} />
          {sheets.map((sheet, idx) => (
            <Route path={`sheet/${sheet.slug}`} element={<Sheet data={sheet} />} key={idx} />
          ))}
        </Routes>
      </main>
      {/* <footer>FOOTER</footer> */}
    </>
  );
}

export default App;
