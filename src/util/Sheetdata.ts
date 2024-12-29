
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
  key: string;
  lyricist: string;
  meta: string[];
  sorttitle: string;
  subtitle: string;
  tags: string[];
  tempo: string;
  time: string;
  title: string;
  year: string;

  columns: number;
  lyrics: string;
};

type SheetList = Record<string, SheetType>;

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
    key: "",
    lyricist: "",
    meta: [],
    sorttitle: "",
    subtitle: "",
    tags: [],
    tempo: "",
    time: "",
    title: "",
    year: "",

    columns: 2,
    lyrics: "",
  };

  sheet.id = stringToHash(path);
  sheet.path = path;
  sheet.slug = path.replace(".crd", "");

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
          sheet.key = directive[1];
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
          sheet.tags = directive[1].replace(", ", ",").split(",");
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
        default:
          // TODO: Other directives
          sheet.lyrics += `${line}\n`;
      }
    } else {
      sheet.lyrics += line + "\n";
    }
  }
  return sheet;
}

function matchSheet(sheet: SheetType, searchString: string) {
  let max = 0;
  for(const target of [sheet.album, sheet.artist, sheet.composer, sheet.copyright, sheet.duration, sheet.lyricist, sheet.meta.join(", "), sheet.slug, sheet.sorttitle, sheet.subtitle, sheet.tags.join(", "), sheet.title, sheet.year]) {
    max = Math.max(stringSimilarity(searchString, target), max);
  }
  return max
}

function transposedKey(sheet: SheetType) {
  const key = new Chord(sheet.key);
  return key.transpose(sheet.capo);
}

export { matchSheet, parseSheet, transposedKey };
export type { SheetType, SheetList };
