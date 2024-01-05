import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import styles from './styles/Home.module.css'
import {SheetType, matchSheet} from './util/Sheetdata';
import { Icon } from './Icon';

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

  if (search !== "") {
    sheets.sort((a,b) => {return matchSheet(b, search) - matchSheet(a, search)});
  } else {
    sheets.sort((a,b) => a.title.localeCompare(b.title));
  }

  const icon = new Icon();

  useEffect(() => {
    callbacks.setTitle("Delyrium");
    callbacks.setArtist("");
  }, [callbacks]);

  return (
    <div className={styles.cardbox}>
      {sheets.map(sheet => {
        if (search === "" || matchSheet(sheet, search) >= 0.4 + search.length * 0.02) {
          return (
            <Link to={`/sheet/${sheet.slug}`} key={sheet.id} className={styles.card} onClick={callbacks.clear}>
              <h3 className={styles.title}>{sheet.title}</h3>
              <div className={styles.band}>
                {sheet.artist}
                {sheet.tags.map((tag) => icon.get(tag))}
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