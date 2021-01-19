"use strict";

const Note = require('./Note');

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
const scalesNames = {
    "major": ["1","2","3","4","5","6","7"],
    "dorian": ["1","2","b3","4","5","6","b7"],
    "phrygian": ["1","b2","b3","4","5","6","b7"],
    "lydian": ["1","2","3","#4","5","6","7"],
    "mixolydian": ["1","2","3","4","5","6","b7"],
    "aeolian": ["1","2","b3","4","5","b6","b7"],
    "locrian": ["1","b2","b3","4","b5","b6","b7"],
    "lydianDominant": ["1","2","3","#4","5","6","b7"], //alteration of lydian
    "rocryllic": ["1","2","3","#4","5","6", "b7", "7"], //added tone or 1-tone extension (superscale) of lydian dominant
    "salimic": ["1","2","3","#4","5", "b7"] // salimic is a subscale of lydian dominant (minus one tone)
    };

module.exports = Scale;

function Scale(rootNote,obj){
    if(Array.isArray(obj)) {
        this.intervalArray = obj;
    }
    else if(scalesNames.obj !== undefined){
        this.intervalArray = scalesNames.obj
    } 
    else {
        throw("Invalid scale name or scale array provdied: " + obj);
    }
    this.rootNote = Note.fromName(rootNote);
    this.notes = [];
    this.generateNotes();
}

Scale.prototype.generateNotes = function(){
    this.notes.push(this.rootNote);
    this.intervalArray.forEach(function(interval,index){
        if(index !== 0){
            this.notes.push(this.rootNote.plus(interval));
        }
    }.bind(this));
}
