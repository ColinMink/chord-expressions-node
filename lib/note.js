"use strict";

const Interval = require('./interval');

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

function Note(name, value){
  this.name = name;
  this.value = value;
}

Object.defineProperty(Note, "list", {
  value: (function generateReferenceNotes() {
      return Object.freeze(names.map((str, value) => {
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
  console.log("fromCustomName(str): "+ str);
    if(typeof str !== 'string' || str.length < 0 ){
        throw new Error("Invalid Note Name. Expected A-G with any sequence of # and b. Received: " + str);
    }
    const referenceNoteString = str.match(noteRegExp)[0];
    console.log(referenceNoteString);
    const referenceNote = fromNormalizedName(referenceNoteString);
    const accidentalString = str.match(accidentalRegExp);
    const accidentalValue = accidentalString ? Interval.normalizeIntervalValue(Interval.getAccidentalValue(accidentalString[0])) : 0;
    let index = (referenceNote.value + accidentalValue) % NOTE_COUNT;
    console.log("Index");
    console.log(index);
    return Note.list[index];
}

// Why does each note object need the whole list?
// Can code dealing with a note and wanting the list not do Note.list?
Note.prototype.list = Note.list;

Note.fromName = function(name, nameOverride = false) {
    console.log("Note.fromName(name): "+name);
    let refNote = fromCustomName(name);
    // copy
    let note = Object.create(Note.prototype);
    Object.assign(note, refNote);

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
console.log(Note.list);


module.exports = Note;
