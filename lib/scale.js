"use strict";

const Note = require('./note');

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

const Modes = {
    diatonic : {
        "scales" : {
        "major": ["1","2","3","4","5","6","7"],
        "dorian": ["1","2","b3","4","5","6","b7"],
        "phrygian": ["1","b2","b3","4","5","6","b7"],
        "lydian": ["1","2","3","#4","5","6","7"],
        "mixolydian": ["1","2","3","4","5","6","b7"],
        "aeolian": ["1","2","b3","4","5","b6","b7"],
        "locrian": ["1","b2","b3","4","b5","b6","b7"],
    },
        makeup: "2w h 3w h"
    },
    melodicMinor : {
        scales: {
            "Melodic_Minor": ["1","2","b3","4","5","6","7"],
            "Dorian_b2": ["1","b2","b3","4","5","6","b7"],
            "Lydian_Augmented": ["1","2","3","#4","#5","6","7"],
            "Lydian_Dominant": ["1","b2","b3","4","5","6","b7"],
            "Mixolydian_b6": ["1","2","3","4","5","b6","b7"],
            "Aeolian_b5": ["1","2","b3","4","b5","b6","b7"],
            "Locrian_b4": ["1","b2","b3","b4","b5","b6","b7"],
        },
        makeup: "1w h 4w h"
    },
    neapolitanMajor : {
        scales: {
            "Neapolitan_Major": ["1","b2","b3","4","5","6","7"],
            "Leading_Whole_Tone": ["1","2","3","#4","#5","#6","7"],
            "Lydian_Augmented_Dominant": ["1","2","3","#4","#5","6","b7"],
            "Lydian_Dominant_b6": ["1","2","3","#4","5","b6","b7"],
            "Major_Locrian": ["1","2","3","4","b5","b6","b7"],
            "Locrian_♮2_b4": ["1","2","b3","b4","b5","b6","b7"],
            "Locrian_b4_bb3": ["1","b2","bb3","b4","b5","b6","b7"],
        },
        makeup: "5w 2h"
    },
    neapolitanMinor : {
        scales: {
            "Neapolitan_Minor": ["1","b2","b3","4","5","6","7"],
            "Lydian_#6": ["1","2","3","#4","5","#6","7"],
            "Mixolydian_Augmented": ["1","2","3","4","#5","6","b7"],
            "Aeolian_#4": ["1","2","b3","#4","5","b6","b7"],
            "Locrian_♮3": ["1","b2","b3","4","b5","b6","b7"],
            "Ionian_#2": ["1","#2","3","4","5", "6","7"],
            "Locrian_bb3_b4_bb7": ["1","b2","bb3","b4","b5", "b6","bb7"],
        },
        makeup: "h 3w wh h"
    },
    harmonicMinor : {
        scales: {
            "Harmonic_Minor": ["1","b2","b3","4","5","b6","7"],
            "Locrian_♮6": ["1","b2","b3","4","b5","6","b7"],
            "Ionian_Augmented": ["1","2","3","4","#5","6","7"],
            "Dorian_#4": ["1","2","b3","#4","5","6","b7"],
            "Phrygian_Dominant": ["1","b2","3","4","5","b6","b7"],
            "Lydian_#2": ["1","#2","3","#4","5", "6","7"],
            "Locrian_b4_bb7": ["1","b2","b3","b4","b5", "b6","bb7"],
        },
        makeup: "w h 2w h wh h"
    },
    harmonicMajor : {
        scales: {
            "Harmonic_Major": ["1","2","3","4","5","b6","7"],
            "Dorian_b5": ["1","2","b3","4","b5","6","b7"],
            "Phrygian_b4": ["1","b2","b3","b4","5","b6","b7"],
            "Lydian_b3": ["1","2","b3","#4","5","6","7"],
            "Mixolydian_b2": ["1","b2","3","4","5", "6","b7"],
            "Locrian_b4_bb7": ["1","b2","b3","b4","b5", "b6","bb7"],
            "Locrian_bb7": ["1","b2","b3","4","b5","b6","bb7"],
        },
        makeup: "2w h w h wh"
    },
    doubleHarmonic : {
        scales: {
            "Double_Harmonic_Major": ["1","b2","3","4","5","b6","7"],
            "Lydian_#2_#6": ["1","#2","3","#4","5","#6","7"],
            "Phrygian_b4_bb7": ["1","b2","b3","b4","5","b6","bb7"],
            "Double_Harmonic_Minor": ["1","2","b3","#4","5","6","7"],
            "Mixolydian_b2_b5": ["1","b2","3","4","b5", "6","b7"],
            "Ionian_Augmented_#2": ["1","#2","3","4","#5", "6","7"],
            "Locrian_bb3_bb7": ["1","b2","bb3","4","b5","b6","bb7"],
        },
        makeup: "w h wh 2h wh h"
    },
    hungarianMajor : {
        scales: {
            "Hungarian_Major": ["1","#2","3","#4","5","6","b7"],
            "Locrian_b4_bb6_bb7": ["1","b2", "b3","b4","b5","bb6","bb7"],
            "Harmonic_Minor_b5": ["1","b2","b3","4","b5","b6","7"],
            "Locrian_b4_♮6": ["1","b2","b3","b4","b5", "6","b7"],
            "Melodic_Minor_#5": ["1","2","b3","4","#5","6","7"],
            "Dorian_b2_#4": ["1","b2","b3","#4","5","6","b7"],
            "Lydian_Augmented_#3": ["1","2","#3","#4","#5","6","7"],
        },
        makeup: "wh h w h w h w"
    },
    harmonicLydian : {
        scales: {
            "Harmonic_Lydian": ["1","2","3","#4","5","b6","7"],
            "Mixolydian_b5": ["1","2", "3","4","b5","6", "b7"],
            "Aeolian_b4": ["1","2","b3","b4","5","b6","b7"],
            "Locrian_bb3": ["1","b2","bb3","4","b5", "b6","b7"],
            "Ionian_b2": ["1","b2","3","4","5","6","7"],
            "Lydian_Augmented_#2_#6": ["1","#2","3","#4","#5","#6","7"],
            "Phrygian_bb7": ["1","b2","b3","4","5","b6","bb7"],
        },
        makeup: "3w 2h wh"
    }
    }

module.exports = {Scale, Modes};

function Scale(rootNote,mode,scale){
    if(Modes[mode] !== undefined && Modes[mode].scales[scale] !== undefined) {
        this.modeName = mode;
        this.scaleName = scale;
        this.intervalArray = Modes[mode].scales[scale];
    } 
    else {
        throw("Invalid mode or scale name provdied: " + mode + " | " + scale );
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

console.log(new Scale("C", "diatonic" , "major" ));
