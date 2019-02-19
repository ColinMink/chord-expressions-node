"use strict";

const Note = require('./note');
const Interval = require('./interval.js');
const Parser = require('./resources/parser/parser.js');

const triads = {
    "major": ["1","3","5"],
    "m": ["1", "b3", "5"],
    "+": ["1", "3", "#5"],
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
    this.rootNote = Note.fromName(chord.rootNote);
    this.quality = chord.quality;
    this.mods = chord.mods;
    this.notes = [];
    this.notation = notation;
    this.generateNotes();
    console.log(this);
}

Chord.prototype.generateNotes = function() {
    console.log("--------" + this.notation);
    console.log(this.quality.triad);
    let triad = triads[this.quality.triad];
    console.log(triad);
    let quality = this.quality.extension ? triad.concat(extensions[this.quality.extension]) : triad;
    console.log(this.quality);
    quality.forEach(function(interval) {
        let note = this.rootNote.plus(interval)
        note.interval = interval;
        note.role = parseInt(interval);
        this.notes.push(note);
    }.bind(this));
    if (this.mods.mod) {
        this.modNotes(this.mods.mod);
    }
    if (this.mods.add) {
        this.addNotes(this.mods.add);
    }
}

Chord.prototype.addNotes = function(addNotes, currentNotes) {
    addNotes.forEach(function(interval) {
        var note = this.rootNote.plus(interval);
        if (this.noDuplicateNotes(note)) {
            this.notes.push(note);
        }
    }.bind(this));
}



Chord.prototype.generateNotes = function () {
  let triad = triads[this.quality.triad];
  let quality = this.quality.extension ? triad.concat(extensions[this.quality.extension]) : triad;

  quality.forEach(interval => {
    this.notes.push(this.rootNote.plus(interval));
  });

  if(this.mods.mod) {
    this.modNotes(this.mods.mod);
  }
  if(this.mods.add) {
    this.addNotes(this.mods.add);
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
        let interval = parseInt(modNote[1]);

        let index = -1;
        let match = this.notes.find( (note, i) => {
            console.log(note.role);
            console.log("-",  interval);
            if (note.role === interval) {
                index = i;
            }
            return note.role === interval;
        })
        console.log(match);
        console.log("int",interval);
        //modNote.quality

        //note = Note.fromName(modNote);
        //if the note is in the this.notes array, mod it
        //var index = this.notes.indexOf(match);
        console.log("index: " + index);
        if (match) {
            if (accidental === 'b') {
                console.log('flatting ' + this.notes[index].name);
                //this.notes[index] = this.notes[index].flat();
                this.notes[index] = match.flat();
            } else if (acidental === '#') {
                console.log('sharping ' + this.notes[index].name);
                //this.notes[index] = this.notes[index].sharp();
                this.notes[index] = match.sharp();
            }
        }
        // if it is not in the this.notes array, add to the add array of mpds
        else {
            console.log(this.mods);
            this.mods.add.push(modNote);
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

Chord.chordFromNotation = function(notation) {
  console.log("New Chord --------");
  console.log("Chord.chordFromNotation(notation): " + notation);
        let parsedNotation = Parser.parse(notation);
        //console.log("Parser.parse(notation): " + parsedNotation;
        /* should always have a triad */
        if (parsedNotation.quality.triad == undefined) {throw new Error("no triad" + notation)}
        return new Chord(parsedNotation, notation);

}

Chord.triads = triads;
Chord.extensions = extensions;

//console.log(Chord.chordFromNotation("D6(b5)"));