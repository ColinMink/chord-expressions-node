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

module.exports = Note;

// function Note(name) {
//     this.name = name;
//     Note.list.push(this);
//     this.value = Note.list.indexOf(this);
// }

// Object.defineProperty(Note, "list", {
//   value: [],
//   writable: false
// });
// console.log(Interval.behavior);
// Note.prototype.plus = Interval.behavior.plus;
// Note.prototype.minus = Interval.behavior.minus;
// Note.prototype.flat = Interval.behavior.flat;
// Note.prototype.sharp = Interval.behavior.sharp;

// Note.fromName = function(name, nameOverride = false) {
//   console.log("*************************");
//   console.log("Note.fromName");
//     let refNote = fromCustomName(name);
//     let note = Object.assign({},refNote);
//     console.log(refNote);
//     console.log(note);
//     console.log("*************************");
//     if (nameOverride) {
//       note.referenceName = refNote.name;
//       note.name = name;
//     } else {
//       note.referenceName = refNote.name;
//       note.name = refNote.name;
//     }
//     return note;
// };

// Note.fromValue = function(value) {
//     return Note.list.find(function(item) {
//       return item.value === value;
//     });
// };

// /* Accepts [A-G] + (b|#)? */
// function fromNormalizedName(name) {
//     return Note.list.find(function(note) {
//       return note.name === name;
//     });
// }

// /* Accepts [A-G] + any sequence of #s or bs */
// function fromCustomName(str) {
//     if(typeof str !== 'string' || str.length < 0 ){
//         throw new Error("Invalid Note Name. Expected A-G with any sequence of # and b. Received: " + str);
//     }
//     const referenceNoteString = str.match(noteRegExp)[0];
//     const referenceNote = fromNormalizedName(referenceNoteString);
//     const accidentalString = str.match(accidentalRegExp);
//     const accidentalValue = accidentalString ? Interval.normalizeIntervalValue(Interval.getAccidentalValue(accidentalString[0])) : 0;
//     let index = (referenceNote.value + accidentalValue) % NOTE_COUNT;
//     return Note.list[index];
// }

// (function buildNotes() {
//     names.forEach(function(str) {
//         Note[str] = Object.freeze(new Note(str));
//     });
//     Object.freeze(Note.list);
// })();

function refNote(name) {
      this.name = name;
      refNote.list.push(this);
      this.value = refNote.list.indexOf(this);
  }

Object.defineProperty(refNote, "list", {
  value: [],
  writable: false
});

/* Accepts [A-G] + (b|#)? */
function fromNormalizedName(name) {
    return refNote.list.find(function(note) {
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
    let index = (referenceNote.value + accidentalValue) % NOTE_COUNT;
    return refNote.list[index];
}

(function buildNotes() {
    names.forEach(function(str) {
        Note[str] = Object.freeze(new refNote(str));
    });
    Object.freeze(refNote.list);
})();

function Note(){
  this.name = null;
  this.value = null;
}

Note.prototype.plus = Interval.behavior.plus;
Note.prototype.minus = Interval.behavior.minus;
Note.prototype.flat = Interval.behavior.flat;
Note.prototype.sharp = Interval.behavior.sharp;
Note.prototype.list = refNote.list;

Note.fromName = function(name, nameOverride = false) {
    let refNote = fromCustomName(name);
    let note = Object.assign(new Note(),refNote);
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
    return refNote.list.find(function(item) {
      return item.value === value;
    });
};

