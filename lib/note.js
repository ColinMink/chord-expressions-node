"use strict";

const Interval = require('./interval');

const noteRegExp = "[A-G]";
const accidentalRegExp = "[#,b]+";
const noteNames = [
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
const NOTE_COUNT = noteNames.length;

function Note(name, value){
  this.name = name;
  this.value = value;
}

Note.prototype.copy = function() {
  let copy = Object.create(Note.prototype);
  Object.assign(copy, this);
  copy.reference = this;
  return copy;
};

Object.defineProperty(Note, "list", {
  value: (function generateReferenceNotes() {
      return Object.freeze(noteNames.map((str, value) => {
        return Object.freeze(new Note(str, value));
      }));
  })(),
  writable: false
});

Object.assign(Note.prototype, Interval.behavior);

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
    const accidentalValue = accidentalString ? Interval.Value.normalize(Interval.Notation.Accidental.getValue(accidentalString[0])) : 0;
    let index = (referenceNote.value + accidentalValue) % NOTE_COUNT;
    return Note.list[index];
}

// Why does each note object need the whole list?
// Can code dealing with a note and wanting the list not do Note.list?
Note.prototype.list = Note.list;

Note.fromName = function(name, nameOverride = false) {
    let refNote = fromCustomName(name);
    let note = refNote.copy();

    if (nameOverride) {
      note.name = name;
    }
    return note;
};

Note.fromValue = function(value) {
    let note = Note.list.find(function(item) {
      return item.value === value;
    });
    if(note === undefined) {
      throw("Invalid Note");
    }
    return note;
};

module.exports = Note;
