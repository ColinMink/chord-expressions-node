"use strict";

const Note = require('./Note');
const Interval = require('./Interval.js');
const Parser = require('./resources/parser/parser.js');

const triads = {
    "major": ["1","3","5"],
    "minor": ["1", "b3", "5"],
    "aug": ["1", "3", "#5"],
    "dim": ["1", "b3", "b5"],
    "sus2": ["1", "2", "5"],
    "sus4": ["1", "4", "5"],
    "lyd": ["1", "#4", "5"],
    "phryg": ["1", "b2", "5"]
};

const extensions = {
    "6": ["6"],
    "7": ["b7"],
    "9": ["b7", "9"],
    "11": ["b7", "9", "11"],
    "13": ["b7", "9", "11", "13"],
    "maj7": ["7"],
    "maj9": ["7", "9"],
    "maj11": ["7", "9", "11"],
    "maj13": ["7", "9", "11", "13"]
};

module.exports = Chord;

function Chord(chord, notation) {
    this.rootNote = Note.fromName(chord.note);
    this.baseNote = chord.slashNote.length ? Note.fromName(chord.slashNote) : null;
    this.quality = chord.quality;
    this.modList = chord.modList;
    this.addList = chord.addList;
    this.notes = [];
    this.notation = notation;
    this.generateNotes();
}

Chord.prototype.generateNotes = function() {
    let triad = triads[this.quality.triad.value];
    let quality = this.quality.extension.length > 0 ? triad.concat(extensions[this.quality.extension.value]) : triad;
    quality.forEach(function(interval) {
        let note = this.rootNote.plus(interval);
        this.notes.push(note);
    }.bind(this));
    if (this.modList.length > 0) {
        this.modNotes(this.modList);
    }
    if (this.addList.length > 0) {
        this.addNotes(this.addList);
    }
}

Chord.prototype.addNotes = function (addNotes,currentNotes) {

  addNotes.forEach(interval => {
    let note = this.rootNote.plus(interval);

    if(this.noDuplicateNotes(note)) {
      this.notes.push(note);
    }
  });
}

Chord.prototype.modNotes = function(modNotes) {
    //check all currentNotes for the modNote. If they match add the interval to the note
    modNotes.forEach(function(modNote) {
        let accidental = modNote[0];
        let interval = parseInt(modNote.substring(1));
        //locate the note you are attempting to mod in the chords note list
        let index = -1;
        let match = this.notes.find( (note, i) => {
            let check = this.rootNote.plus(interval.toString());
            if (check.value === note.value) {
                index = i;
                return true;
            }
        });

        //modNote.quality

        //note = Note.fromName(modNote);
        //if the note is in the this.notes array, mod it
        //var index = this.notes.indexOf(match);
        if (match) {
            if (accidental === 'b') {
                //this.notes[index] = this.notes[index].flat();
                this.notes[index] = match.flat();
            } else if (acidental === '#') {
                //this.notes[index] = this.notes[index].sharp();
                this.notes[index] = match.sharp();
            }
        }
        // if it is not in the this.notes array, add to the add array of mpds
        else {
            this.addList.push(modNote);
        }
    }.bind(this));
}

Chord.prototype.noDuplicateNotes = function(note) {
    return !this.notes.find(function(currentNote) {
        return currentNote.value === this;
    }.bind(note));
}

Chord.prototype.duplicateNote = function(note) {
    return this.notes.findIndex(function(currentNote) {
        return currentNote.value === this.value
    }.bind(note));
}

Chord.prototype.hasNote = function(note) {
    if(typeof note === 'object' && typeof note.name === 'string'){
        note = note.name;
    }
    return !!(this.notes.find(function(currentNote) {
        return currentNote.name === this;
    }.bind(note)));
}


Chord.chordFromNotation = function(notation) {
    let parsedNotation = Parser.parse(notation);
    if(Array.isArray(parsedNotation)) {parsedNotation = parsedNotation[0]}
    /* should always have a triad */
    if (parsedNotation.quality.triad == undefined) {throw new Error("no triad: " + notation)}
    return new Chord(parsedNotation, notation);
}

Chord.triads = triads;
Chord.extensions = extensions;
