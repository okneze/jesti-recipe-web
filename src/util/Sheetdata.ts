
import Chord from "./Chord";
import { stringSimilarity, stringToHash } from "./stringUtil";

export type TransposeMode = "chord" | "key";

class Sheetdata {

  id: number = -1;
  path: string = "";
  slug: string = "";
  album: string = "";
  artist: string = "";
  capo: number = 0;
  composer: string = "";
  copyright: string = "";
  duration: string = "";
  key: Chord = new Chord("");
  lyricist: string = "";
  meta: string[] = [];
  sorttitle: string = "";
  subtitle: string = "";
  tags: string = "";
  tempo: string = "";
  time: string = "";
  title: string = "";
  year: string = "";

  columns: number = 2;
  body: string;

  constructor(path: string, content: string) {
    this.id = stringToHash(path);
    this.path = path;
    this.slug = path.replace(".crd", "");

    this.body = "";
    for(let row of content.split("\n")) {
      // filter out comments & shebang
      if(row.startsWith("#")) {
        continue;
      }
      // process directives
      if(row.startsWith("{")) {
        let directive = row.split("{", 2)[1].split("}")[0].replace(": ", ":").split(":")
        switch (directive[0]) {
          case "album":
            this.album = directive[1];
            break;
          case "artist":
            this.artist = directive[1];
            break;
          case "capo":
            this.capo = Number.parseInt(directive[1]);
            break;
          case "composer":
            this.composer = directive[1];
            break;
          case "copyright":
            this.copyright = directive[1];
            break;
          case "duration":
            this.duration = directive[1];
            break;
          case "key":
            this.key = new Chord(directive[1]);
            break;
          case "lyricist":
            this.lyricist = directive[1];
            break;
          case "sorttitle":
            this.sorttitle = directive[1];
            break;
          case "subtitle":
            this.subtitle = directive[1];
            break;
          case "tags":
            this.tags = directive[1];
            break;
          case "tempo":
            this.tempo = directive[1];
            break;
          case "time":
            this.time = directive[1];
            break;
          case "title":
            this.title = directive[1];
            break;
          case "year":
            this.year = directive[1];
            break;
          case "columns":
            this.columns = Number.parseInt(directive[1]);
            break;
          case "meta":
            this.meta.push(directive[1]);
            break;
          default:
            this.body += `${row}\n`;
        }
      } else {
        this.body += `${row}\n`;
      }
    }
  }

  match(searchString: string) {
    let max = 0;
    for(const target of [this.album, this.artist, this.composer, this.copyright, this.duration, this.lyricist, this.meta.join(", "), this.slug, this.sorttitle, this.subtitle, this.tags, this.title, this.year]) {
      max = Math.max(stringSimilarity(searchString, target), max)
    }
    return max
  }

  transpose(amount: number, mode: TransposeMode): Sheetdata {
    // TODO
    return this;
  }
}

export default Sheetdata;
