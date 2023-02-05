import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import styles from './styles/Sheet.module.css'
import Switch from './Switch';
import Chord from './util/Chord';
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
          {data.body.split("\n").map(line => {
            if (line === "") {
              return <br/>
            } else if(line[0] === "#") {
              // ignore comments and shebang
              return ""
            } else if(line[0] === "{") {
              // TODO: directives
              return ""
            } else {
              if (line.includes("[")) {
                let chordLine = ""
                let lyricLine = ""
                let chordbuffer = ""
                let ischord = false
                let chordLength = 0
                for (const chr of line) {
                  if (chr === '[') {
                    ischord = true
                  } else if (chr === ']') {
                    ischord = false
                    // transpose
                    const chord = new Chord(chordbuffer)
                    chordbuffer = `${chord.transpose(offset).toString()} `
                    chordLine += chordbuffer
                    chordLength = chordbuffer.length
                    chordbuffer = ""
                  } else if (ischord) {
                    chordbuffer += chr
                  } else {
                    lyricLine += chr
                    if (chordLength === 0) {
                      chordLine += " "
                    } else {
                      chordLength -= 1
                    }
                  }
                }
                return (
                  <>
                    <span className={styles.chords}>{chordLine}</span>
                    <br/>
                    <span>{lyricLine}</span>
                    <br/>
                  </>
                )
              } else {
                return (
                  <>
                    <span>{line}</span>
                    <br/>
                  </>
                )
              }
            }
          })}
        </div>
      </div>
    </>
  );
}

export default Sheet;