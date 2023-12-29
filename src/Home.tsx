import React from 'react';
import { Link } from 'react-router-dom';

import styles from './styles/Home.module.css'
import {SheetType, matchSheet} from './util/Sheetdata';

function Home({sheets, search, clear}: {sheets: SheetType[], search: string, clear: () => void}) {
  if (search !== "") {
    sheets.sort((a,b) => {return matchSheet(b, search) - matchSheet(a, search)});
  } else {
    sheets.sort((a,b) => a.title.localeCompare(b.title));
  }

  document.title = "Delyrium";

  return (
    <div className={styles.cardbox}>
      {sheets.map(sheet => {
        if (search === "" || matchSheet(sheet, search) >= 0.4 + search.length * 0.02) {
          return (
            <Link to={`/sheet/${sheet.slug}`} key={sheet.id} className={styles.card} onClick={clear}>
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
  );
}

export default Home;