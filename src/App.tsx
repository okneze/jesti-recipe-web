import React, {useState} from 'react';
import {BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';

import Sheet from './Sheet';
import Home from './Home';
import data from './sheet_list.json'
import { useFetch } from './util/useFetch';
import styles from './styles/App.module.css'

function App() {

  const [sheets] = useFetch(data.files);
  const [searchString, setSearchString] = useState("");

  function clearSearchString() {
    setSearchString("");
  }

  return (
    <Router>
      <header>
        <div className={styles.searchbar}>
          {/* <Magnifier className={styles.icon} /> */}
          <input onChange={(event) => setSearchString(event.target.value)} value={searchString} />
        </div>
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
    </Router>
  );
}

export default App;
