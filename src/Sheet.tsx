import React, {useState} from 'react';
import reactStringReplace from 'react-string-replace';
import styles from './styles/Sheet.module.css'
import {SheetType, transposedKey} from './util/Sheetdata';

function Sheet({data}: {data: SheetType}) {

  const [sheet, setSheet] = useState(data);

  document.title = `Delyrium - ${sheet.title} - ${sheet.artist}`;

  function transpose(amount: number) {
    setSheet(old => ({...old, capo: (old.capo + amount) % 12}));
  }

  let lineID = 0;

  return (
      <div className={styles.layout}>
        <div className={styles.head}>
          <div>
            <h2>{sheet.title}</h2>
            <h3>{sheet.artist}</h3>
          </div>
          <div className={styles.transpose}>
            <button onClick={() => {transpose(-1)}}>Transpose -1</button>
            <span className={styles.chords} id="key">{sheet.key.toString()}{sheet.capo >= 0 ? `+${sheet.capo}` : sheet.capo}={transposedKey(sheet).toString()}</span>
            <button onClick={() => {transpose(+1)}}>Transpose +1</button>
            <span className={styles.tags}>{data.tags}</span>
          </div>
        </div>
        <div className={styles.sheet}>
          {sheet.lyrics.split("\n").map((line, idx) => {
            if (line === "") {
              lineID += 1;
              return <br key={idx}/>;
            } else if(line[0] === "#") {
              // ignore comments and shebang
              return;
            } else if(line[0] === "{") {
              // TODO: directives
              return;
            } else {
              let chordLine = "";
              if(Object.keys(data.chords).includes(`${lineID}`)) {
                for(const entry of data.chords[lineID].sort((a, b)  => a.column - b.column)) {
                  // fill space left of chord, then add chord and one space on the right
                  chordLine += " ".repeat(Math.max(entry.column - chordLine.length, 0));
                  chordLine += entry.chord.transpose(sheet.capo).toString();
                  chordLine += " ";
                }
              }
              lineID += 1;
              return (
                <span key={idx}>
                  {chordLine !== "" && <><span className={styles.chords}>{chordLine}</span><br /></>}
                  <span>{reactStringReplace(line, /_(.*?)_/g, (value) => (<span className={styles.highlight}>{value}</span>))}</span>
                  <br/>
                </span>
              )
            }

          })}
        </div>
      </div>
  );
}

export default Sheet;