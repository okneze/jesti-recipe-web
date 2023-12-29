
import Chord from "./Chord";
import { stringSimilarity, stringToHash } from "./stringUtil";

type SheetType = {
  id: number;
  path: string;
  slug: string;
  album: string;
  artist: string;
  capo: number;
  composer: string;
  copyright: string;
  duration: string;
  key: Chord;
  lyricist: string;
  meta: string[];
  sorttitle: string;
  subtitle: string;
  tags: string;
  tempo: string;
  time: string;
  title: string;
  year: string;

  columns: number;
  lyrics: string;
  chords: {[row: number]: {column: number; chord: Chord}[]};
}

function parseSheet(path: string, content: string) {

  const sheet: SheetType = {
    id: -1,
    path: "",
    slug: "",
    album: "",
    artist: "",
    capo: 0,
    composer: "",
    copyright: "",
    duration: "",
    key: new Chord(""),
    lyricist: "",
    meta: [],
    sorttitle: "",
    subtitle: "",
    tags: "",
    tempo: "",
    time: "",
    title: "",
    year: "",

    columns: 2,
    lyrics: "",
    chords: {},
  };

  sheet.id = stringToHash(path);
  sheet.path = path;
  sheet.slug = path.replace(".crd", "");

  let lineID = 0;
  for(let line of content.split("\n")) {
    // filter out comments & shebang
    if(line.startsWith("#")) {
      continue;
    }
    // process directives
    if(line.startsWith("{")) {
      let directive = line.split("{", 2)[1].split("}")[0].replace(": ", ":").split(":")
      switch (directive[0]) {
        case "album":
          sheet.album = directive[1];
          break;
        case "artist":
          sheet.artist = directive[1];
          break;
        case "capo":
          sheet.capo = Number.parseInt(directive[1]);
          break;
        case "composer":
          sheet.composer = directive[1];
          break;
        case "copyright":
          sheet.copyright = directive[1];
          break;
        case "duration":
          sheet.duration = directive[1];
          break;
        case "key":
          sheet.key = new Chord(directive[1]);
          break;
        case "lyricist":
          sheet.lyricist = directive[1];
          break;
        case "sorttitle":
          sheet.sorttitle = directive[1];
          break;
        case "subtitle":
          sheet.subtitle = directive[1];
          break;
        case "tags":
          sheet.tags = directive[1];
          break;
        case "tempo":
          sheet.tempo = directive[1];
          break;
        case "time":
          sheet.time = directive[1];
          break;
        case "title":
          sheet.title = directive[1];
          break;
        case "year":
          sheet.year = directive[1];
          break;
        case "columns":
          sheet.columns = Number.parseInt(directive[1]);
          break;
        case "meta":
          sheet.meta.push(directive[1]);
          break;
        // default:
          // TODO: Other directives
          // sheet.lyrics += `${row}\n`;
      }
    } else {
      // preprocessing
      let chordbuffer = ""
      let ischord = false
      let columnID = 0
      for (const chr of line) {
        if (chr === '[') {
          ischord = true
        } else if (chr === ']') {
          ischord = false
          // transpose
          const chord = new Chord(chordbuffer, sheet.key);
          let entry = {column: columnID, chord};
          if(Object.keys(sheet.chords).includes(`${lineID}`)) {
            sheet.chords = {...sheet.chords, [lineID]: [...sheet.chords[lineID], entry]};
          } else {
            sheet.chords = {...sheet.chords, [lineID]: [entry]}
          }
          chordbuffer = ""
        } else if (ischord) {
          chordbuffer += chr
        } else {
          sheet.lyrics += chr
          columnID += 1;
        }
      }
      lineID += 1;
      sheet.lyrics += "\n";
    }
  }
  return sheet;
}

function matchSheet(sheet: SheetType, searchString: string) {
  let max = 0;
  for(const target of [sheet.album, sheet.artist, sheet.composer, sheet.copyright, sheet.duration, sheet.lyricist, sheet.meta.join(", "), sheet.slug, sheet.sorttitle, sheet.subtitle, sheet.tags, sheet.title, sheet.year]) {
    max = Math.max(stringSimilarity(searchString, target), max)
  }
  return max
}

export { matchSheet, parseSheet };
export type { SheetType };
