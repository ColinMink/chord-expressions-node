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

const Modes = [
    {
        scales: {
            "Major": ["1","2","3","4","5","6","7"],
            "Major": ["1","2","3","4","5","6","7"],
            "Dorian": ["1","2","b3","4","5","6","b7"],
            "Phrygian": ["1","b2","b3","4","5","6","b7"],
            "Lydian": ["1","2","3","#4","5","6","7"],
            "Mixolydian": ["1","2","3","4","5","6","b7"],
            "Aeolian": ["1","2","b3","4","5","b6","b7"],
            "Locrian": ["1","b2","b3","4","b5","b6","b7"],
        },
        name: "Diatonic",
        makeup: "2w h 3w h"
    },
 
    {
        scales: {
            "Melodic Minor": ["1","2","b3","4","5","6","7"],
            "Dorian b2": ["1","b2","b3","4","5","6","b7"],
            "Lydian Augmented": ["1","2","3","#4","#5","6","7"],
            "Lydian Dominant": ["1","b2","b3","4","5","6","b7"],
            "Mixolydian b6": ["1","2","3","4","5","b6","b7"],
            "Aeolian b5": ["1","2","b3","4","b5","b6","b7"],
            "Superlocrian": ["1","b2","b3","b4","b5","b6","b7"],// aka Altered
        },
        name: "Melodic Minor",
        makeup: "1w h 4w h"
    },
    
    {
        scales: {
            "Neapolitan Major": ["1","b2","b3","4","5","6","7"],// Melodic Minor b2
            "Leading Whole Tone": ["1","2","3","#4","#5","#6","7"],
            "Lydian Augmented Dominant": ["1","2","3","#4","#5","6","b7"],
            "Lydian Dominant b6": ["1","2","3","#4","5","b6","b7"], //aka Lydian Minor 
            "Major Locrian": ["1","2","3","4","b5","b6","b7"],
            "Superlocrian ♮2": ["1","2","b3","b4","b5","b6","b7"],
            "Superlocrian bb3": ["1","b2","bb3","b4","b5","b6","b7"],
        },
        name: "Neapolitan Major",
        makeup: "5w 2h"
    },
 
    {
        scales: {
            "Neapolitan Minor": ["1","b2","b3","4","5","b6","7"],
            "Lydian #6": ["1","2","3","#4","5","#6","7"],
            "Mixolydian Augmented": ["1","2","3","4","#5","6","b7"],
            "Aeolian #4": ["1","2","b3","#4","5","b6","b7"],
            "Locrian ♮3": ["1","b2","b3","4","b5","b6","b7"],
            "Ionian #2": ["1","#2","3","4","5", "6","7"],
            "Locrian bb3 b4 bb7": ["1","b2","bb3","b4","b5", "b6","bb7"],
        },
        name: "Neapolitan Minor",
        makeup: "h 3w wh h"
    },
 
    {
        scales: {
            "Harmonic Minor": ["1","2","b3","4","5","b6","7"],
            "Locrian ♮6": ["1","b2","b3","4","b5","6","b7"],
            "Ionian Augmented": ["1","2","3","4","#5","6","7"],
            "Dorian #4": ["1","2","b3","#4","5","6","b7"], // aka Lydian Dominant b3
            "Phrygian Dominant": ["1","b2","3","4","5","b6","b7"],
            "Lydian #2": ["1","#2","3","#4","5", "6","7"],
            "Locrian b4 bb7": ["1","b2","b3","b4","b5", "b6","bb7"],// aka Superlocrian bb7,
                                                                    // aka Altered bb7
        },
        name: "Harmonic Minor",
        makeup: "w h 2w h wh h"
    }, 
 
    {
        scales: {
            "Harmonic Major": ["1","2","3","4","5","b6","7"],
            "Dorian b5": ["1","2","b3","4","b5","6","b7"],
            "Phrygian b4": ["1","b2","b3","b4","5","b6","b7"],
            "Lydian b3": ["1","2","b3","#4","5","6","7"], //aka Melodic Minor #4
            "Mixolydian b2": ["1","b2","3","4","5", "6","b7"],
            "Lydian Augmented #2": ["1","#2","3", "#4","#5", "6","7"], //aka Altered bb7
            "Locrian bb7": ["1","b2","b3","4","b5","b6","bb7"],
        },
        name: "Harmonic Major",
        makeup: "2w h w h wh"
    },
 
    {
        scales: {
            "Double Harmonic Major": ["1","b2","3","4","5","b6","7"],
            "Lydian #2 #6": ["1","#2","3","#4","5","#6","7"],
            "Phrygian b4 bb7": ["1","b2","b3","b4","5","b6","bb7"],
            "Double Harmonic Minor": ["1","2","b3","#4","5","b6","7"],
            "Mixolydian b2 b5": ["1","b2","3","4","b5", "6","b7"],
            "Ionian Augmented #2": ["1","#2","3","4","#5", "6","7"],
            "Locrian bb3 bb7": ["1","b2","bb3","4","b5","b6","bb7"],
        },
        name: "Double Harmonic",
        makeup: "w h wh 2h wh h"
    },
 
    {
        scales: {
            "Hungarian Major": ["1","#2","3","#4","5","6","b7"],
            "Locrian b4 bb6 bb7": ["1","b2", "b3","b4","b5","bb6","bb7"],
            "Harmonic Minor b5": ["1","b2","b3","4","b5","b6","7"],
            "Locrian b4 ♮6": ["1","b2","b3","b4","b5", "6","b7"],
            "Melodic Minor #5": ["1","2","b3","4","#5","6","7"],
            "Dorian b2 #4": ["1","b2","b3","#4","5","6","b7"],
            "Lydian Augmented #3": ["1","2","#3","#4","#5","6","7"],
        },
        name: "Hungarian Major",
        makeup: "wh h w h w h w"
    },
 
    {
        scales: {
            "Harmonic Lydian": ["1","2","3","#4","5","b6","7"],
            "Mixolydian b5": ["1","2", "3","4","b5","6", "b7"],
            "Aeolian b4": ["1","2","b3","b4","5","b6","b7"],
            "Locrian bb3": ["1","b2","bb3","4","b5", "b6","b7"],
            "Ionian b2": ["1","b2","3","4","5","6","7"],
            "Lydian Augmented #2 #6": ["1","#2","3","#4","#5","#6","7"],
            "Phrygian bb7": ["1","b2","b3","4","5","b6","bb7"],
        },
        name: "Harmonic Lydian",
        makeup: "3w 2h wh"
    },
 
    {
        scales: {
            "Harmonic Minor b4": ["1","2","b3","b4","5","b6","7"],
            "Locrian bb3 ♮6": ["1","b2", "bb3","4","b5","6", "b7"],
            "Ionian Augmented b2": ["1","b2","3","4","#5","6","7"],
            "Katathian": ["1","#2","3","##4","#5", "#6","7"],
            "Phrygian Dominant bb7": ["1","b2","3","4","5","b6","bb7"],
            "Harmonic Lydian #2": ["1","#2","3","#4","5","b6","7"],
            "Mixolocrian": ["1","b2","b3","b4","bb5","b6","bb7"],
        },
        name: "Harmonic Minor b4",
        makeup: "w h wh 2h wh h"
    },
 
    {
        scales: {
            "Melodic Minor b4": ["1","2","b3","b4","5","6","7"],
            "Dorian b2 bb3": ["1","b2", "bb3","4","5","6", "b7"],
            "Lydian Augmented b2": ["1","b2","3","#4","#5","6","7"],
            "Phrolian": ["1","#2","#3","##4","#5", "#6","7"],
            "Mixolydian b6 bb7": ["1","2", "3","4","5","b6","bb7"],
            "Modified Blues": ["1","2","b3","4","#4","5","b7"],
            "Locrian b4 bb5": ["1","b2","b3","b4","bb5","b6","b7"],
        },
        name: "Melodic Minor b4",
        makeup: "w 2h wh 2w"
    },
 
    {
        scales: {
            "Melodic Minor #6": ["1","2","b3","4","5","#6","7"],
            "Dorian b2 #5": ["1","b2", "b3","4","#5","6", "b7"],
            "Darian": ["1","2","3","##4","#5","6","7"],
            "Lonian": ["1","2","#3","#4","5", "6","b7"],
            "Mixolydian b6 #2": ["1","#2", "3","4","5","b6","b7"],
            "Sarian": ["1","b2","bb3","b4","bb5","bb6","bb7"],
            "Zoptian": ["1","b2","b3","b4","b5","b6","7"],
        },
        name: "Melodic Minor #6",
        makeup: "w h 2w wh"
    },
 
    {
        scales: {
            "Dorian b4": ["1","2","b3","b4","5","6","b7"],
            "Phrygian bb3": ["1","b2", "bb3","4","5","b6", "b7"],
            "Lydian b2": ["1","b2","3","#4","5","6","7"],
            "Thonian": ["1","#2","#3","#4","#5", "#6","7"],
            "Aeolian bb7": ["1","b2", "b3","4","5","b6","bb7"],
            "Locrian bb6": ["1","b2","b3","4","b5","bb6","b7"],
            "Ionian b5": ["1","2","3","4","b5","6","7"],
        },
        name: "Dorian b4",
        makeup: "w 2h wh w 2h"
    },
 
    {
        scales: {
            "Phrygian #4": ["1","b2","b3","#4","5","b6","b7"],
            "Lydian #3": ["1","2", "#3","#4","5","6", "7"],
            "Mixolydian #2": ["1","#2","3","4","5","6","b7"],
            "Phradian": ["1","b2","bb3","b4","b5", "bb6","bb7"],
            "Locrian ♮7": ["1","b2", "b3","4","b5","b6","7"],
            "Ionian #6": ["1","2","3","4","5","#6","7"],
            "Dorian #5": ["1","b2","b3","4","#5","6","b7"],
        },
        name: "Phrygian #4",
        makeup: "h w wh 2h w"
    },
 
    {
        scales: {
            "Lydian b2 #6": ["1","b2","3","#4","5","#6","7"],
            "Katocrian": ["1","#2", "4","#4","6","#6", "7"],
            "Aeolian #4 bb7": ["1","2","b3","#4","5","b6","bb7"],
            "Phrygian Dominant b5 bb6": ["1","b2","3","4","b5", "5","b7"],
            "Ionian #2 b5": ["1","#2","3","4","b5","6","7"],
            "Ganian": ["1","b2","2","3","b5","b6","bb7"],
            "Eparian": ["1","b2","2","4","5","b6","7"],
        },
        name: "Lydian b2 #6",
        makeup: "h wh w h wh h"
    },
 
    {
        scales: {
            "Neapolitan Major b4": ["1","b2","b3","b4","5","6","7"],
            "Stynian": ["1","2","b3","#4","#5","#6", "7"],
            "Persichetti Scale": ["1","b2","3","#4","#5","6","b7"],
            "Epacrian": ["1","#2","#3","##4","#5", "6","7"],
            "Sathian": ["1","2", "3","4","b5","b6","bb7"],
            "Lathian": ["1","2","b3","b4","#4","5","b7"],
            "Elephant Scale": ["1","b2","2","3","4","b6","b7"],
        },
        name: "Neapolitan Major b4",
        makeup: "2h w h wh 2w"
    },
 
    {
        scales: {
            "Neapolitan Major #4": ["1","b2","b3","#4","5","6","7"],
            "Marian": ["1","2","#3","#4","#5","#6", "7"],
            "Katorian": ["1","#2","3","#4","#5","6","b7"],
            "Lynian": ["1","b2","b3","4","#4", "5","6"],
            "Malian": ["1","2", "3","4","b5","b6","7"],
            "Synian": ["1","2","b3","b4","b5","6","b7"],
            "Phragian": ["1","b2","2","3","5","b6","b7"],
        },
        name: "Neapolitan Major #4",
        makeup: "h w wh h 2w"
    },
 
    {
        scales: {
            "Neapolitan Minor b4": ["1","b2","b3","b4","5","b6","7"],
            "Aeolian #4 #6": ["1","2","b3","#4","5","#6", "7"],          //Lydian b3 #6
            "Mixolydian Augmented b2": ["1","b2","3","4","#5","6","b7"],
            "Tholian": ["1","#2","3","5","#5", "6","7"],
            "Ralian": ["1","b2", "3","4","b5","b6","bb7"],
            "Harmonic Major #2": ["1","#2","3","4","5","b6","7"],
            "Stodian": ["1","b2","2","3","4","#5","6"],
        },
        name: "Neapolitan Minor b4",
        makeup: "2h w h wh h w"
    },
 
    {
        scales: {
            "Neapolitan Minor #4": ["1","b2","b3","#4","5","b6","7"], //todi that
            "Chromatic Mixolydian Inverse": ["1","2","#3","#4","5","#6", "7"],
            "Chromatic Hypodorian Inverse": ["1","#2","3","4","#5","6","b7"],
            "Chromatic Hypophrygian Inverse": ["1","b2","2","4","#4", "5","6"],
            "Raga Lalita": ["1","b2", "3","4","b5","b6","7"],
            "Ionian #2 #6": ["1","#2","3","4","5","#6","b7"],
            "Chromatic Phrygian Inverse": ["1","b2","2","3","5","b6","6"],
        },
        name: "Neapolitan Minor #4",
        makeup: "2h w wh 2h wh"
    },
 
    {
        scales: {
            "Hungarian Major b6": ["1","#2","3","#4","5","b6","b7"], 
            "Aerothian": ["1","b2","b3","3","4","5", "6"],
            "Stagian": ["1","2","b3","3","#4","6","7"],
            "Lothian": ["1","b2","2","3","#4", "6","b7"],
            "Phrycrian": ["1","b2", "b3","4","#5","6","7"],
            "Kyptian": ["1","2","3","5","b6","b7","7"],
            "Ionylian": ["1","2","4","#4","#5","6","b7"],
        },
        name: "Hungarian Major b6",
        makeup: "wh h w 2h 2w"
    },
 
    {
        scales: {
            "Neapolitan Major #6": ["1","b2","b3","4","5","#6","7"], 
            "Mothian": ["1","2","3","#4","6","b7", "7"],
            "Aeranian": ["1","2","3","5","b6","6","b7"],
            "Ragian": ["1","2","4","#4","5", "b6","b7"],
            "Pagian": ["1","#2", "3","4","b5","b6","b7"],
            "Aeolythian": ["1","b2","2","b3","4","5","6"],
            "Molian": ["1","b2","2","3","#4","#5","7"],
        },
        name: "Neapolitan Major #6",
        makeup: "2h 3w wh"
    },
 
    {
        scales: {
            "Phrygian Dominant #4": ["1","b2","3","#4","5","b6","b7"], //Lydian Minor b2
            "Eporian": ["1","b3","4","#4","5","6","7"],
            "Rylian": ["1","2","b3","3","#4","#5","6"],
            "Epaptian": ["1","b2","2","3","#4", "5","b7"],
            "Byrian": ["1","b2", "b3","4","b5","6","7"],
            "Katanian": ["1","2","3","4","#5","#6","7"],
            "Katyrian": ["1","2","b3","#4","#5","6","b7"],
        },
        name: "Phrygian Dominant #4",
        makeup: "h wh w 2h 2w"
    },
 
    {
        scales: {
            "Lydian Dominant b2": ["1","b2","3","#4","5","6","b7"], 
            "Pogian": ["1","b3","4","#4","#5","6","7"],
            "Moravian Pistalkova": ["1","2","b3","4","b5","b6","bb7"],
            "Epylian": ["1","b2","b3","3","#4","5","b7"],
            "Jeth's Mode": ["1","2","b3","4","b5","6","7"],
            "Dorian b2 b4": ["1","b2","b3","b4","5","6","b7"],
            "Lylian": ["1","2","b3","#4","#5","6","7"],
        },
        name: "Lydian Dominant b2",
        makeup: "h wh w h w h w"
    },
 
    {
        scales: {
            "Harmonic Lydian b2": ["1","b2","3","#4","5","b6","7"], 
            "Chromatic Hypophrygian": ["1","b3","4","#4","5","#6","7"],
            "Chromatic Hypodorian": ["1","2","b3","3","5","b6","6"],
            "Chromatic Mixolydian": ["1","b2","2","4","#4","6","7"],
            "Chromatic Lydian": ["1","b2","3","4","b5","6","7"],
            "Chromatic Phrygian": ["1","b2","b3","b4","5","6","b7"],
            "Chromatic Dorian": ["1","b2","2","4","5","b6","6"],
        },
        name: "Harmonic Lydian b2",
        makeup: "2h wh w 2h wh"
    },
 
    {
        scales: {
            "Lydian Minor bb7": ["1","2","3","#4","5","b6","bb7"], 
            "Katythian": ["1","2","3","4","#4","5","b7"],
            "Madian": ["1","2","b3","3","4","#5","b7"],
            "Aerygian": ["1","b2","2","b3","#4","#5","b7"],
            "Mela Manavati": ["1","b2","2","4","5","6","7"],
            "Enigmatic": ["1","b2","3","#4","#5","#6","7"],
            "Phraptian": ["1","b2","4","5","6","b7","7"],
        },
        name: "Lydian Minor bb7",
        makeup: "3w 3h wh"
    },
 
    {
        scales: {
            "Ionian b2 #6": ["1","b2","3","4","5","#6","7"], 
            "Ranian": ["1","#2","3","#4","6","b6","7"],
            "Phrygian #4 bb7": ["1","b2","b3","#4","5","b6","bb7"], // 
            "Podian": ["1","2","4","#4","5","b6","7"],
            "Ionothian": ["1","#2","3","4","b5","6","b7"],
            "Kanian": ["1","b2","2","b3","#4","5","6"],
            "Zylian": ["1","b2","2","4","b5","b6","7"],
        },
        name: "Ionian b2 #6",
        makeup: "h wh h w wh 2h"
    },
 
 
];

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