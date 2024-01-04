import React from "react";
import reactStringReplace from "react-string-replace";
import styles from '../styles/Sheet.module.css';
import classNames from "classnames";

export class Parser {
    private transpose: (chord: string) => string;

    constructor(transpose: (chord: string) => string) {
        this.transpose = transpose;
    }

    parseBlock(line: string|React.ReactNode[]) {
        return reactStringReplace(line, /(\[(?:[^\]]*)\][^[]*)/g, (value) => (
            <span className={styles.chordblock}>{this.parseChord(value)}</span>
        ));
    }

    parseChord(line: string|React.ReactNode[]) {
        const chordClasses = classNames(styles.chordflow, styles.chords);
        return reactStringReplace(line, /\[(.*?)\]/g, (value) => (
            <div className={chordClasses}>
                {this.transpose(value)}
            </div>
        ));
    }

    parseGrid(line: string): React.ReactNode[] {
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
                    {this.parseChord(value)}
                </div>
                )
            } else if(getClasses(offset + barCounter - 1)) {
                return (<div className={classNames(getClasses(offset + barCounter - 1))}></div>)
            }
            })
        }</div>]
    }

    directiveDefine(directive: string) {
        let match = directive.match(/(?<={(define|chord): ).*(?=})/g);
        if (!match) {
            return ""
        }
        const name = match[0].split(" ", 1)[0];
        const frets = match[0].match(/frets( [0-9xN]+)+/g)?.[0].replace("frets ", "").replaceAll(" ", "-");
        return `${name}: ${frets}`;
    }
}
