

const Interval = require('./Interval.js');

const noteRegExp = "[A-G]";
const accidentalRegExp = "[#,b]+";
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
    var refNote = fromCustomName(name);
    note = Object.assign(refNote);

    if (nameOverride) {
      note.referenceName = refNote.name;
      note.name = name;
    } else {
      note.referenceName = refNote.name;
      note.name = refNote.name;
    }

    return note;
};

Note.fromValue = function(value) {
    return Note.list.find(function(item) {
      return item.value === value;
    });
};

/* Accepts [A-G] + (b|#)? */
function fromNormalizedName(name) {
    return Note.list.find(function(note) {
      return note.name === name;
    });
}

/* Accepts [A-G] + any sequence of #s or bs */
function fromCustomName(str) {
    if(typeof str !== 'string' || str.length < 0 ){
        throw new Error("Invalid Note Name. Expected A-G with any sequence of # and b. Received: " + str);
    }
    const referenceNoteString = str.match(noteRegExp)[0];
    const referenceNote = fromNormalizedName(referenceNoteString);
    const accidentalString = str.match(accidentalRegExp);
    const accidentalValue = accidentalString ? Interval.normalizeIntervalValue(Interval.getAccidentalValue(accidentalString[0])) : 0;
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