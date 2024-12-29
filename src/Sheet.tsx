import React, {useEffect, useState} from 'react';
import reactStringReplace from 'react-string-replace';
import styles from './styles/Sheet.module.css'
import {SheetType, transposedKey} from './util/Sheetdata';
import Chord from './util/Chord';
import classNames from 'classnames';
import useLocalstorage from './util/useLocalstorage';
import {Parser} from './util/Parser';
import { Icon } from './Icon';

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

  const icon = new Icon();

  document.title = `Delyrium - ${sheet.title} - ${sheet.artist}`;

  useEffect(() => {
    callbacks.setTitle(sheet.title);
    callbacks.setArtist(sheet.artist);
  }, [callbacks, sheet]);

  function transpose(amount: number) {
    setSheet(old => ({...old, capo: (old.capo + amount) % 12}));
  }

  function transposeChord(chord: string) {
    return new Chord(chord, new Chord(sheet.key)).transpose(originalKey ? 0 : sheet.capo).toString();
  }
  const parser = new Parser(transposeChord);

  let directiveMode: DirectiveModes = "normal";

  return (
      <div className={styles.layout}>
        <div className={styles.head}>
          <div className={styles.transpose}>
            <button onClick={() => {transpose(-1)}} className={styles['transpose-button']}>{icon.get("minus")}</button>
            <span className={styles.chords} id="key">{new Chord(sheet.key).toString()}{sheet.capo >= 0 ? `+${sheet.capo}` : sheet.capo}={transposedKey(sheet).toString()}</span>
            <button onClick={() => {transpose(+1)}} className={styles['transpose-button']}>{icon.get("plus")}</button>
            <span className={styles.tags}>{data.tags.map((tag, idx) => (<React.Fragment key={idx}>{icon.get(tag)}</React.Fragment>))}</span>
            <label>
              Original
              <input type="checkbox" checked={originalKey} onChange={(e) => {setOriginalKey((e.target as HTMLInputElement).checked)}} />
            </label>
          </div>
        </div>
        <div className={styles.sheet} style={{"--columns": sheet.columns}}>
          {sheet.lyrics.split("\n\n").map((block, blockId) => {
            let blockClasses = styles.block;
            // peek what comes next
            if(block.match(/^[ \t]{1,4}|{soc}|{start_of_chorus}/g)) {
              blockClasses = classNames(blockClasses, styles.chorus);
            }
            return (<div className={blockClasses} key={`block-${blockId}`}>
              {block.split("\n").map((line, idx) => {
              if(line === "" || line[0] === "#") {
                // ignore comments and shebang and empty lines
                return (<React.Fragment key={idx}></React.Fragment>);
              }
              if(line[0] === "{") {
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
                    return (<div className={styles['chord-definition']} key={idx}>{parser.directiveDefine(line)}</div>);
                  default:
                    console.log('found directive', line);
                    break;
                }
                return (<React.Fragment key={idx}></React.Fragment>);
              }
              const empty = line.replaceAll(/\[(.*?)\]/g, "").length === 0;
              const modifications: (string|React.ReactNode[])[] = [line];

              if(directiveMode === 'grid') {
                modifications.unshift(parser.parseGrid(line));
              } else {
                // parse chords
                modifications.unshift(parser.parseBlock(modifications[0]));
                // underline
                modifications.unshift(reactStringReplace(modifications[0], /_(.*?)_/g, (value, matchId) => (<span className={styles.highlight} key={`match-${matchId}`}>{value}</span>)))
              }
              return (
                <div key={`line-${idx}`} className={classNames(styles.line, empty && styles.empty)}>
                  {modifications[0]}
                </div>
              );

            })}</div>);
          })}
        </div>
      </div>
  );
}

export default Sheet;