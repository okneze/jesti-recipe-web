import React, {useState} from 'react';
import reactStringReplace from 'react-string-replace';
import styles from './styles/Sheet.module.css'
import {SheetType, transposedKey} from './util/Sheetdata';
import Chord from './util/Chord';
import classNames from 'classnames';

function Sheet({data}: {data: SheetType}) {

  const [sheet, setSheet] = useState(data);

  document.title = `Delyrium - ${sheet.title} - ${sheet.artist}`;

  function transpose(amount: number) {
    setSheet(old => ({...old, capo: (old.capo + amount) % 12}));
  }

  function parseBlock(line: string|React.ReactNode[]) {
    return reactStringReplace(line, /(\[(?:[^\]]*)\][^\[]*)/g, (value) => (<span className={styles.chordblock}>{parseChord(value)}</span>))
  }

  function parseChord(line: string|React.ReactNode[]) {
    const chordClasses = classNames(styles.chordflow, styles.chords);
    return reactStringReplace(line, /\[(.*?)\]/g, (value) => (<div className={chordClasses}>{new Chord(value, sheet.key).transpose(sheet.capo).toString()}</div>))
  }

  // skip empty lines before first lyrics/chords
  let skip = true;

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
              if(skip) {
                return (<></>);
              }
              return <br key={idx}/>;
            } else if(line[0] === "#") {
              // ignore comments and shebang
              return (<></>);
            } else if(line[0] === "{") {
              // TODO: directives
              return (<></>);
            } else {
              skip = false;
              const empty = line.replaceAll(/\[(.*?)\]/g, "").length === 0;
              const modifications: (string|React.ReactNode[])[] = [line];
              // parse chords
              modifications.unshift(parseBlock(modifications[0]));
              // underline
              modifications.unshift(reactStringReplace(modifications[0], /_(.*?)_/g, (value) => (<span className={styles.highlight}>{value}</span>)))
              return (
                <div key={idx} className={classNames(styles.line, empty && styles.empty)}>
                  {modifications[0]}
                </div>
              )
            }

          })}
        </div>
      </div>
  );
}

export default Sheet;