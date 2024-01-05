import React from 'react';
import { Link } from 'react-router-dom';

import styles from './styles/Home.module.css'
import {SheetType, matchSheet} from './util/Sheetdata';

type Props = {
  sheets: SheetType[],
  search: string,
  callbacks: {
    clear: () => void;
    setTitle: (title: string) => void;
    setArtist: (artist: string) => void
  }
};

function Home({sheets, search, callbacks}: Props) {
  document.title = "Delyrium";
  callbacks.setTitle("Delyrium");
  callbacks.setArtist("");

  if (search !== "") {
    sheets.sort((a,b) => {return matchSheet(b, search) - matchSheet(a, search)});
  } else {
    sheets.sort((a,b) => a.title.localeCompare(b.title));
  }

  return (
    <div className={styles.cardbox}>
      {sheets.map(sheet => {
        if (search === "" || matchSheet(sheet, search) >= 0.4 + search.length * 0.02) {
          return (
            <Link to={`/sheet/${sheet.slug}`} key={sheet.id} className={styles.card} onClick={callbacks.clear}>
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