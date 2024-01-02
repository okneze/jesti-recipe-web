import React, {useState} from 'react';
import reactStringReplace from 'react-string-replace';
import styles from './styles/Sheet.module.css'
import {SheetType, transposedKey} from './util/Sheetdata';
import Chord from './util/Chord';
import classNames from 'classnames';

type DirectiveModes = "normal" | "grid";

function Sheet({data}: {data: SheetType}) {

  const [sheet, setSheet] = useState(data);

  document.title = `Delyrium - ${sheet.title} - ${sheet.artist}`;

  function transpose(amount: number) {
    setSheet(old => ({...old, capo: (old.capo + amount) % 12}));
  }

  function parseBlock(line: string|React.ReactNode[]) {
    return reactStringReplace(line, /(\[(?:[^\]]*)\][^[]*)/g, (value) => (<span className={styles.chordblock}>{parseChord(value)}</span>))
  }

  function parseChord(line: string|React.ReactNode[]) {
    const chordClasses = classNames(styles.chordflow, styles.chords);
    return reactStringReplace(line, /\[(.*?)\]/g, (value) => (<div className={chordClasses}>{new Chord(value, sheet.key).transpose(sheet.capo).toString()}</div>))
  }

  function parseGrid(line: string|React.ReactNode[]): React.ReactNode[] {
    return [<div className={styles['chord-grid']}>{reactStringReplace(line, /\|([^|]*)/g, (value) => value !== "" && (<div className={styles['chord-bar']}>{parseChord(value)}</div>))}</div>]
  }

  // skip empty lines before first lyrics/chords
  let skip = true;
  let directiveMode: DirectiveModes = "normal";



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
        <div className={styles.sheet} style={{"--columns": sheet.columns}}>
          {sheet.lyrics.split("\n\n").map((block, blockidx) => {
            let blockClasses = styles.block;
            // peek what comes next
            if(block.match(/^[ \t]{1,4}|{soc}|{start_of_chorus}/g)) {
              blockClasses = classNames(blockClasses, styles.chorus);
            }
            return (<div className={blockClasses}>{block.split("\n").map((line, idx) => {
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
                switch (line) {
                  case "{start_of_grid}":
                  case "{sog}":
                    directiveMode = "grid";
                    break;
                  case "{end_of_grid}":
                  case "{eog}":
                    directiveMode = "normal";
                    break;
                  default:
                    console.log('found directive', line);
                    break;
                }
                return (<></>);
              } else {
                skip = false;
                const empty = line.replaceAll(/\[(.*?)\]/g, "").length === 0;
                const modifications: (string|React.ReactNode[])[] = [line];

                if(directiveMode === 'grid') {
                  modifications.unshift(parseGrid(modifications[0]));
                } else {
                  // parse chords
                  modifications.unshift(parseBlock(modifications[0]));
                  // underline
                  modifications.unshift(reactStringReplace(modifications[0], /_(.*?)_/g, (value) => (<span className={styles.highlight}>{value}</span>)))
                }
                return (
                  <div key={idx} className={classNames(styles.line, empty && styles.empty)}>
                    {modifications[0]}
                  </div>
                );
              }

            })}</div>);
          })}
        </div>
      </div>
  );
}

export default Sheet;