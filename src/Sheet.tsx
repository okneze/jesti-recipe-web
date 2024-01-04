import React, {useState} from 'react';
import reactStringReplace from 'react-string-replace';
import styles from './styles/Sheet.module.css'
import {SheetType, transposedKey} from './util/Sheetdata';
import Chord from './util/Chord';
import classNames from 'classnames';
import useLocalstorage from './util/useLocalstorage';

type DirectiveModes = "normal" | "grid";

function Sheet({data}: {data: SheetType}) {

  const [sheet, setSheet] = useState(data);
  const [originalKey, setOriginalKey] = useLocalstorage<boolean>("originalKeyToggle", false);

  document.title = `Delyrium - ${sheet.title} - ${sheet.artist}`;

  function transpose(amount: number) {
    setSheet(old => ({...old, capo: (old.capo + amount) % 12}));
  }

  function parseBlock(line: string|React.ReactNode[]) {
    return reactStringReplace(line, /(\[(?:[^\]]*)\][^[]*)/g, (value) => (
      <span className={styles.chordblock}>{parseChord(value)}</span>
    ));
  }

  function parseChord(line: string|React.ReactNode[]) {
    const chordClasses = classNames(styles.chordflow, styles.chords);
    return reactStringReplace(line, /\[(.*?)\]/g, (value) => (
      <div className={chordClasses}>
        {new Chord(value, sheet.key).transpose(originalKey ? 0 : sheet.capo).toString()}
      </div>
    ));
  }

  function parseGrid(line: string): React.ReactNode[] {
    // special bars
    const classes: Record<number, string> = {};
    const bars = /(?<double>\|\|)|(?<esorep>:\|:)|(?<sorep>\|:)|(?<eorep>:\|)/g;
    let off = 0;
    for(const match of line.matchAll(bars)) {
      const cls = Object.entries(match.groups ?? []).reduce((prev, obj) => obj[1] !== undefined ? obj[0] : prev, "");
      if(match.index !== undefined) {classes[match.index - off] = styles[`bar-${cls}`]};
      off += match[0].length - 1;
    }
    line = line.replaceAll(bars, "|");
    function getClasses(id: number) {
      return Object.keys(classes).includes(`${id}`) ? classes[id] : undefined;
    }
    let barCounter = 0;
    return [<div className={styles['chord-grid']}>{
      reactStringReplace(line, /\|([^|]*)/g, (value, _, offset) => {
        barCounter += 1;
        if (value !== "") {
          return (
            <div className={classNames(styles['chord-bar'], getClasses(offset + barCounter - 1))}>
              {parseChord(value)}
            </div>
          )
        } else if(getClasses(offset + barCounter - 1)) {
          return (<div className={classNames(getClasses(offset + barCounter - 1))}></div>)
        }
      })
    }</div>]
  }

  function directiveDefine(directive: string) {
    let match = directive.match(/(?<={(define|chord): ).*(?=})/g);
    if (!match) {
      return ""
    }
    const name = match[0].split(" ", 1)[0];
    const frets = match[0].match(/frets( [0-9xN]+)+/g)?.[0].replace("frets ", "").replaceAll(" ", "-");
    return `${name}: ${frets}`;
  }

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
            <label>
              Original
              <input type="checkbox" checked={originalKey} onChange={(e) => {setOriginalKey((e.target as HTMLInputElement).checked)}} />
            </label>
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
              if(line === "" || line[0] === "#") {
                // ignore comments and shebang and empty lines
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
                  case line.match(/^{define:|^{chord:/)?.input:
                    return (<div className={styles['chord-definition']}>{directiveDefine(line)}</div>);
                  default:
                    console.log('found directive', line);
                    break;
                }
                return (<></>);
              } else {
                const empty = line.replaceAll(/\[(.*?)\]/g, "").length === 0;
                const modifications: (string|React.ReactNode[])[] = [line];

                if(directiveMode === 'grid') {
                  modifications.unshift(parseGrid(line));
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