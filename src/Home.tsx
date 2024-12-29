import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import styles from './styles/Home.module.css'
import {SheetList, SheetType, matchSheet} from './util/Sheetdata';
import { Icon } from './Icon';

type Props = {
  sheets?: SheetList,
  search: string,
  callbacks: {
    clear: () => void;
    setTitle: (title: string) => void;
    setArtist: (artist: string) => void
  }
};

function Home({sheets, search, callbacks}: Props) {
  document.title = "Delyrium";

  const icon = new Icon();

  const [sortedSheets, setSortedSheets] = useState<SheetType[]>([]);
  useEffect(() => {
    if (search !== "" && sheets) {
      setSortedSheets(Object.values(sheets).sort((a,b) => {return matchSheet(b, search) - matchSheet(a, search)}));
    } else if(sheets) {
      setSortedSheets(Object.values(sheets).sort((a,b) => a.title.localeCompare(b.title)));
    }
  }, [search, sheets]);

  useEffect(() => {
    callbacks.setTitle("Delyrium");
    callbacks.setArtist("");
  }, [callbacks]);

  return (
    <div className={styles.cardbox}>
      {sortedSheets.map((sheet) => {
        if (search === "" || matchSheet(sheet, search) >= 0.4 + search.length * 0.02) {
          return (
            <Link to={`/sheet/${sheet.slug}`} key={sheet.id} className={styles.card} onClick={callbacks.clear}>
              <h3 className={styles.title}>{sheet.title}</h3>
              <div className={styles.band}>
                {sheet.artist}
                {sheet.tags.map((tag, idx) => {
                  return (<span key={idx}>{icon.get(tag)}</span>)
                })}
              </div>
            </Link>
          )
        } else {
          return (<React.Fragment key={sheet.id}></React.Fragment>)
        }
      })}
    </div>
  );
}

export default Home;