
export default class Chord {
  static SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  static FLAT  = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

  static FLAT_MAJORS = [5, 10, 3, 8, 1]//6
  static FLAT_MINORS = [2, 7, 0, 5, 10]//3

  private third: boolean;
  private base: string;
  private addition: string;
  private index = -1;

  private relativeKey?: Chord;

  constructor(text: string, key?: Chord) {
    this.relativeKey = key;
    text = text.replace("H", "B").replace("h", "b")
    this.third = /^[A-G]$/.test(text.charAt(0))
    if (text.length === 1) {
      this.base = text
    }
    const first = text.charAt(0)
    const checkChord = `${first.toUpperCase()}${text.charAt(1)}`
    if (Chord.SHARP.includes(checkChord) || Chord.FLAT.includes(checkChord)) {
      this.base = checkChord.substring(0,2)
      this.addition = text.substring(2)
    } else {
      this.base = checkChord.substring(0,1)
      this.addition = text.substring(1)
    }
    this.index = Chord.SHARP.includes(this.base) ? Chord.SHARP.indexOf(this.base) : Chord.FLAT.indexOf(this.base)
  }

  transpose(amount: number, ) {
    const idx = (((this.index + amount) % 12) + 12) % 12;
    if (this.relativeKey) {
      const keyIdx = (((this.relativeKey.index + amount) % 12) + 12) % 12;
      if ((this.relativeKey.third && Chord.FLAT_MAJORS.includes(keyIdx)) || (!this.relativeKey.third && Chord.FLAT_MINORS.includes(keyIdx))) {
        this.base = Chord.FLAT[idx]
      } else {
        this.base = Chord.SHARP[idx]
      }
    } else {
      if ((this.third && Chord.FLAT_MAJORS.includes(idx)) || (!this.third && Chord.FLAT_MINORS.includes(idx))) {
        this.base = Chord.FLAT[idx]
      } else {
        this.base = Chord.SHARP[idx]
      }
    }
    // console.log(idx, this.third)
    // split bass into separate chord on "/" and reapply on addition
    // if (this.#addition.includes("/")) {
    //   const bass = new Chord(this.#addition.split("/", 1)[1])
    //   this.#addition = `${this.#addition.split("/", 1)[0]}/${bass.transpose(amount).toString()}`
    // }
    return this
  }

  toString() {
    return `${this.third ? this.base : this.base.toLowerCase()}${this.addition}`
  }

}
