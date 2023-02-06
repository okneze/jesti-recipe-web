import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import styles from './styles/Sheet.module.css'
import Switch from './Switch';
import Sheetdata, { TransposeMode } from './util/Sheetdata';

function Sheet({data}: {data: Sheetdata}) {

  const [sheet, setSheet] = useState(data);
  const [offset, setOffset] = useState(0);
  const [transposeMode, setTransposeMode] = useState<TransposeMode>("key");

  document.title = `Delyrium - ${sheet.title} - ${sheet.artist}`;

  function transpose(amount: number) {
    setSheet(old => old.transpose(amount, transposeMode));
    setOffset(old => old+amount);
  }

  let lineID = 0;

  return (
    <>
      <Link to="/" className={styles.homebutton}>Home</Link>
      <div className={styles.layout}>
        <div className={styles.head}>
          <div>
            <h2>{sheet.title}</h2>
            <h3>{sheet.artist}</h3>
          </div>
          <div className={styles.transpose}>
            <Switch
              isOn={transposeMode === "key"}
              handleToggle={() => {console.log(transposeMode); setTransposeMode(old => old === "key" ? "chord" : "key")}}
            />
            <button onClick={() => {transpose(-1)}}>Transpose -1</button>
            <span className={styles.chords} id="key">{data.key.toString()}</span>
            <button onClick={() => {transpose(+1)}}>Transpose +1</button>
            <span className={styles.tags}>{data.tags}</span>
          </div>
        </div>
        <div className={styles.sheet}>
          {data.lyrics.split("\n").map(line => {
            if (line === "") {
              lineID += 1;
              return <br/>;
            } else if(line[0] === "#") {
              // ignore comments and shebang
              return "";
            } else if(line[0] === "{") {
              // TODO: directives
              return "";
            } else {
              let chordLine = "";
              if(Object.keys(data.chords).includes(`${lineID}`)) {
                for(const entry of data.chords[lineID].sort((a, b)  => a.column - b.column)) {
                  // fill space left of chord, then add chord and one space on the right
                  chordLine += " ".repeat(entry.column - chordLine.length);
                  chordLine += entry.chord.transpose(offset).toString();
                  chordLine += " ";
                }
              }
              lineID += 1;
              return (
                <>
                  {chordLine !== "" && <><span className={styles.chords}>{chordLine}</span><br /></>}
                  <span>{line}</span>
                  <br/>
                </>
              )
            }

          })}
        </div>
      </div>
    </>
  );
}

export default Sheet;