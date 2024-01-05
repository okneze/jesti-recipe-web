import React, { useState, useEffect } from 'react';
import { Route, Routes, Link, useNavigate } from 'react-router-dom';

import Sheet from './Sheet';
import Home from './Home';
import data from './sheet_list.json'
import { useFetch } from './util/useFetch';
import styles from './styles/App.module.css';
import {ReactComponent as HouseSVG} from "./assets/icons/house.svg";
import {ReactComponent as MagnifierSVG} from "./assets/icons/magnifying-glass.svg";

function App() {

  const [sheets] = useFetch(data.files);
  const [searchString, setSearchString] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [title, setTitle] = useState("Delyrium");
  const [artist, setArtist] = useState("");

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
        <Link to="/" className={styles.header}>
          <HouseSVG />
        </Link>
        <button onClick={() => setShowSearch((show) => !show)} className={styles.magnifier}><MagnifierSVG /></button>
        {showSearch && <input onChange={(event) => setSearchString(event.target.value)} onKeyDown={(event) => {event.key === 'Enter' && setRedirect("/")}} value={searchString} className={styles.searchbar} />}
        <h1>{title}{artist !== "" && <>- <span>{artist}</span></>}</h1>
      </header>
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Home sheets={sheets} search={searchString} callbacks={{clear: clearSearchString, setTitle, setArtist}} />} />
          {sheets.map((sheet, idx) => (
            <Route path={`sheet/${sheet.slug}`} element={<Sheet data={sheet} callbacks={{setTitle, setArtist}} />} key={idx} />
          ))}
        </Routes>
      </main>
      {/* <footer>FOOTER</footer> */}
    </>
  );
}

export default App;
