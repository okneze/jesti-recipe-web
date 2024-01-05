import React, {useEffect, useState} from 'react';
import reactStringReplace from 'react-string-replace';
import styles from './styles/Sheet.module.css'
import {SheetType, transposedKey} from './util/Sheetdata';
import Chord from './util/Chord';
import classNames from 'classnames';
import useLocalstorage from './util/useLocalstorage';
import {Parser} from './util/Parser';
import {ReactComponent as PlusSVG} from "./assets/icons/plus.svg";
import {ReactComponent as MinusSVG} from "./assets/icons/minus.svg";

type DirectiveModes = "normal" | "grid";
type Props = {
  data: SheetType;
  callbacks: {
    setTitle: (title: string) => void;
    setArtist: (artist: string) => void
  }
};

function Sheet({data, callbacks}: Props) {

  const [sheet, setSheet] = useState(data);
  const [originalKey, setOriginalKey] = useLocalstorage<boolean>("originalKeyToggle", false);

  document.title = `Delyrium - ${sheet.title} - ${sheet.artist}`;

  useEffect(() => {
    callbacks.setTitle(sheet.title);
    callbacks.setArtist(sheet.artist);
  }, [callbacks, sheet]);

  function transpose(amount: number) {
    setSheet(old => ({...old, capo: (old.capo + amount) % 12}));
  }

  function transposeChord(chord: string) {
    return new Chord(chord, sheet.key).transpose(originalKey ? 0 : sheet.capo).toString();
  }
  const parser = new Parser(transposeChord);

  let directiveMode: DirectiveModes = "normal";

  return (
      <div className={styles.layout}>
        <div className={styles.head}>
          <div className={styles.transpose}>
            <button onClick={() => {transpose(-1)}}><MinusSVG /></button>
            <span className={styles.chords} id="key">{sheet.key.toString()}{sheet.capo >= 0 ? `+${sheet.capo}` : sheet.capo}={transposedKey(sheet).toString()}</span>
            <button onClick={() => {transpose(+1)}}><PlusSVG /></button>
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
                    return (<div className={styles['chord-definition']}>{parser.directiveDefine(line)}</div>);
                  default:
                    console.log('found directive', line);
                    break;
                }
                return (<></>);
              } else {
                const empty = line.replaceAll(/\[(.*?)\]/g, "").length === 0;
                const modifications: (string|React.ReactNode[])[] = [line];

                if(directiveMode === 'grid') {
                  modifications.unshift(parser.parseGrid(line));
                } else {
                  // parse chords
                  modifications.unshift(parser.parseBlock(modifications[0]));
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