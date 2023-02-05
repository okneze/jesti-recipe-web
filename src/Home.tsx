import React, {useState} from 'react';
import { Link } from 'react-router-dom';

import styles from './styles/Home.module.css'
import Sheetdata from './util/Sheetdata';

function Home({sheets}: {sheets: Sheetdata[]}) {
  const [searchString, setSearchString] = useState("");
  if (searchString !== "") {
    sheets.sort((a,b) => {return b.match(searchString) - a.match(searchString)});
  } else {
    sheets.sort((a,b) => a.title.localeCompare(b.title));
  }

  document.title = "Delyrium";

  return (
    <>
      <div className={styles.searchbar}>
        {/* <Magnifier className={styles.icon} /> */}
        <input onChange={(event) => setSearchString(event.target.value)} value={searchString} />
      </div>
      <h1 style={{textAlign: "center", margin: "0px"}}>Delyrium</h1>
      <div className={styles.cardbox}>
        {sheets.map(sheet => {
          if (searchString === "" || sheet.match(searchString) >= 0.4 + searchString.length * 0.02) {
            return (
              <Link to={`/sheet/${sheet.slug}`} key={sheet.id} className={styles.card} onClick={() => setSearchString("")}>
                  <h3 className={styles.title}>{sheet.title}</h3>
                  <div className={styles.band}>
                    {sheet.artist}
                    {/* {iconifyTags(sheet.frontmatter.tags ?? "")} */}
                  </div>
              </Link>
            )
          } else {
            return (<></>)
          }
        })}
      </div>
    </>
  );
}

export default Home;