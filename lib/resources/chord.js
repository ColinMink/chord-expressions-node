const Note = require('./Note.js');

const triads = {
  "major": ["1","3","5"],
  "m": ["1","b3","5"],
  "+": ["1","3","#5"],
  "dim": ["1","b3","b5"],
  "sus2": ["1","2","5"],
  "sus4": ["1","4","5"],
  "lyd": ["1","#4","5"],
  "phryg": ["1","b2","5"]
};

const extensions = {
  "6": ["6"],
  "7": ["b7"],
  "9": ["b7","9"],
  "11": ["b7","9","11"],
  "13": ["b7","9","11", "13"],
  "maj7": ["7"],
  "maj9": ["7", "9"],
  "maj11": ["7","9","11"],
  "maj13": ["7","9","11", "13"]
};

function Chord(rootNote, quality, mods) {
  this.rootNote = Note.fromName(rootNote);
  this.quality = quality;
  this.mods = mods;
  this.notes = [];
  this.init();
}
Chord.prototype.init = function () {
  this.generateNotes();
}

Chord.prototype.generateNotes = function () {
  let triad = triads[this.quality.triad];
  let quality = this.quality.extension ? triad.concat(extensions[this.quality.extension]) : triad;
  quality.forEach(function(interval){
    this.notes.push(this.rootNote.plus(interval));
  }.bind(this));
  if(this.mods.mod) {
    this.modNotes(this.mods.mod);
  }
  if(this.mods.add) {
    this.addNotes(this.mods.add);
  }
}

Chord.prototype.addNotes = function (addNotes,currentNotes) {
  addNotes.forEach(function(interval){
    var note = this.rootNote.plus(interval);
      if(this.noDuplicateNotes(note)) {
        this.notes.push(note);
      }
  }.bind(this));
}

Chord.prototype.modNotes = function(modNotes) {
  //check all currentNotes for the modNote. If they match add the interval to the note
  modNotes.forEach(function(modNote){
    let accidental = modNote[0];
    let interval = parseInt(modNote[1]);
    note = Note.fromValue(interval);
    //if the note is in the this.notes array, mod it
    var index = this.duplicateNote(note);
    console.log("index: " + index);
    if(index >= 0){
      if(accidental === 'b') {
        console.log('flatting ' + this.notes[index].name);
        this.notes[index] = this.notes[index].flat();
      }
      else if(acidental === '#') {
        console.log('sharping ' + this.notes[index].name);
        this.notes[index] = this.notes[index].sharp();
      }
    }
    // if it is not in the this.notes array, add to the add array of mpds
    else {
      console.log(this.mods);
      this.mods.add.push(modNote);
    }
  }.bind(this));
}

Chord.prototype.noDuplicateNotes = function (note) {
  return !this.notes.find(function(currentNote){
    return currentNote.value === this;
    }.bind(note));
}

Chord.prototype.duplicateNote = function (note) {
  return this.notes.findIndex(function(currentNote){
    return currentNote.value === this.value
    }.bind(note));
}

module.exports = Chord;