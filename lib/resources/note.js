const Interval = require('./Interval.js');

const LETTER_REG_EXP = "[A-G]";
const ACCIDENTAL_REG_EXP = "[#,b]+";

const names = [
    "A",
    "A#",
    "B",
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#"
];
const NOTE_COUNT = names.length;

function Note(name) {
    this.name = name;
    Note.list.push(this);
    this.value = Note.list.indexOf(this);
}



Object.defineProperty(Note, "list", {
  value: [],
  writable: false
});

Note.prototype = Object.assign(Note.prototype, Interval.behavior);

Note.fromName = function(name, nameOverride = false) {
    var reference = fromCustomName(name);
    note = Object.assign(reference);

    if (nameOverride) {
      note.reference = reference;
      note.name = name;
    } else {
      note.reference = reference;
      note.name = reference.name;
    }

    return note;
};

Note.fromValue = function(value) {
    return Note.list.find(item => item.value === value);
};

/* Accepts [A-G] + (b|#)? */
function fromNormalizedName(name) {
    return Note.list.find(note => note.name === name);
}

/* Accepts [A-G] + any sequence of #s or bs */
function fromCustomName(str) {
    const referenceNoteString = str.match(LETTER_REG_EXP)[0];
    const referenceNote = fromNormalizedName(referenceNoteString);
    const accidentalString = str.match(ACCIDENTAL_REG_EXP);
    const accidentalValue = accidentalString ? Interval.getAccidentalValue(accidentalString[0]) : 0;

    var index = (referenceNote.value + accidentalValue) % NOTE_COUNT;
    return Note.list[index];
}

(function buildNotes() {
    names.forEach(function(str) {
        Note[str] = Object.freeze(new Note(str));
    });
    Object.freeze(Note.list);
})();

module.exports = Note;

console.log(Note.list);