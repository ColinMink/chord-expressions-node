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
    //let note = Object.assign({}, proto);
    
    
    this.name = name;
    //note.name = name;
    Note.list.push(this);
    //note.value = Note.list.indexOf(note);
    this.value = Note.list.indexOf(this);
    
    Object.assign(this, Interval.behavior);
    console.log(this.prototype);
}

<<<<<<< HEAD
Note.prototype = Object.assign(Note.prototype, Interval.behavior);
=======

>>>>>>> be66d005a79e4a2b5d50511651b5854d05488d24

Object.defineProperty(Note, "list", {
  value: [],
  writable: false
});


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
<<<<<<< HEAD
    return Object.assign({}, Note.list.find(function(item) {
      return item.value === value;
    }));
=======
    return Note.list.find(item => item.value === value);
>>>>>>> be66d005a79e4a2b5d50511651b5854d05488d24
};

/* Accepts [A-G] + (b|#)? */
function fromNormalizedName(name) {
    return Note.list.find(note => note.name === name);
}

/* Accepts [A-G] + any sequence of #s or bs */
function fromCustomName(str) {
<<<<<<< HEAD
    if(typeof str !== 'string' || str.length < 0 ){
        throw new Error("Invalid Note Name. Expected A-G with any sequence of # and b. Received: " + str);
    }
    const referenceNoteString = str.match(noteRegExp)[0];
    const referenceNote = fromNormalizedName(referenceNoteString);
    const accidentalString = str.match(accidentalRegExp);
    const accidentalValue = accidentalString ? Interval.normalizeIntervalValue(Interval.getAccidentalValue(accidentalString[0])) : 0;
=======
    const referenceNoteString = str.match(LETTER_REG_EXP)[0];
    const referenceNote = fromNormalizedName(referenceNoteString);
    const accidentalString = str.match(ACCIDENTAL_REG_EXP);
    const accidentalValue = accidentalString ? Interval.getAccidentalValue(accidentalString[0]) : 0;

>>>>>>> be66d005a79e4a2b5d50511651b5854d05488d24
    var index = (referenceNote.value + accidentalValue) % NOTE_COUNT;
    return Note.list[index];
}

(function buildNotes() {
    names.forEach(function(str) {
        Note[str] = new Note(str);
    });
    Object.freeze(Note.list);
})();

module.exports = Note;

console.log(Note.list);