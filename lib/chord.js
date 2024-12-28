"use strict";

const Note = require('./note');
const Interval = require('./interval');
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
    "dim7": ["bb7"],
    "dim9": ["bb7","9"],
    "dim11": ["bb7","9", "11"],
    "dim13": ["bb7","9", "11", "13"],
    "9": ["b7", "9"],
    "11": ["b7", "9", "11"],
    "13": ["b7", "9", "11", "13"],
    "maj7": ["7"],
    "maj9": ["7", "9"],
    "maj11": ["7", "9", "11"],
    "maj13": ["7", "9", "11", "13"]
};

const traidHumanNames = {
    "major": "Major",
    "minor": "Minor",
    "aug": "Augmented",
    "dim": "Diminished",
    "sus2": "Suspended Two",
    "sus4": "Suspended Four",
    "lyd": "Lydian",
    "phryg": "Phrygian"
}

const numberHumanNames = {
    "1" : "One",
    "2" : "Two",
    "3" : "Three",
    "4" : "Four",
    "5" : "Five",
    "6" : "Six",
    "7" : "Seven",
    "8" : "Eight",
    "9" : "Nine",
    "10": "Ten",
    "11": "Eleven",
    "13": "Thirteen"
}
const categories = [
    "Triad",
    "Six",
    "Seven",
    "Nine",
    "Eleven",
    "Thirteen"
];

module.exports = Chord;
// nameOverride for the app knows name just needs the rest of the chord built
// theres two different overlapping functions one makes new Chord for insert database (what this is all largely written for), other makes new Chord for pulling into app, a simpler affair
function Chord(chord, notation, fromDB) {

    //console.log(chord);
    //console.log("{arsedNotation^");
    
    this.rootNote = Note.fromName(chord.note);
    this.bassNote = chord.slashNote.length ? Note.fromName(chord.slashNote) : null;
    this.quality = chord.quality;

    if (fromDB && chord.quality.triad.symbol == "m") {this.dbRootName = this.rootNote.name + " Minor";}
    if (fromDB && chord.quality.triad.symbol == "ø") {this.dbRootName = this.rootNote.name + " Half-Diminished";}
    if (fromDB && chord.quality.triad.symbol == "dim") {this.dbRootName = this.rootNote.name + " Diminished";}


    this.modList = chord.modList;
    this.addList = chord.addList;
    this.notes = [];
    this.name = "";
    this.notation = notation;
    //console.log(this.quality.extension);
    //console.log("this.quality.extension^");
    this.category = this.generateCategory(this.quality.extension);
    this.generateNotes();
    this.generateName(fromDB);
    //if (nameOverride) {this.name = nameOverride;}
    
}

Chord.prototype.generateNotes = function() {
    //console.log("Chord.prototype.generateNotes");

    let triad = triads[this.quality.triad.value];
    //console.log("check:");
    //console.log(triad);
    //console.log(this.quality.extension);
    //TYPO FIX! This fixed extensions

    //console.log(this.quality);
    //console.log("this.quality^");

    //console.log(this.quality.extension);
    
    // did this code ever work? is this what was needed for chord generation? TODO: Explore the potentiality that commenting this out
    // and replacing with the next line broke chord generation?
    //let quality = this.quality.extension.children > 0 ? triad.concat(extensions[this.quality.extension.value]) : triad;

    // solution for the app grabbing from database
    let quality = this.quality.extension.value ? triad.concat(extensions[this.quality.extension.value]) : triad;

    // THIS IS BREAKING TODO::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::around here

    //console.log(quality);
    //console.log("quality^");
    //console.log(this.rootName);
    //console.log("qual ", quality);
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
//root + quality + modList + addlist
//TODO: This does not accurately name all chords, come back to fix later
Chord.prototype.generateName = function(fromDB){

    let rootName = (fromDB && this.quality.triad.symbol === "m") ? this.dbRootName : this.rootNote.name;
    rootName = (fromDB && this.quality.triad.symbol === "ø") ? this.dbRootName: rootName;
    rootName = (fromDB && this.quality.triad.symbol === "dim") ? this.dbRootName : rootName;

    let traidName =  this.quality.triad ? traidHumanNames[this.quality.triad.symbol] : null;
    traidName = (fromDB && this.quality.triad.symbol === "dim") ? "" : traidName;
    //console.log("Chord.prototype.generateName");
    //console.log(this.quality.triad);
    //console.log("this.quality.triad");
    const extensionName = this.extensionName(this.quality.extension.symbol, fromDB); //this.quality.extension ? numberHumanNames[this.quality.extension.symbol] : null;
    const slashName = this.bassNote ? " Slash " + this.bassNote.name : null;

    //console.log(extensionName);
    //console.log("extensionName");


    //console.log(this.modList.length > 0);
    //console.log(this.modList);

    //TODO Parser should instead only put mods in one bucket, and this code should check to see if it should "write an add as a mod in the string"

    //need to remove duplicates from addlist that were in Modlist (quirk of the parser, which throws mods into BOTH buckets)
    // if something is in mod, delete it in add (because )

    //TODO: can/should maybe edit the list on this.addList but do this for now
    const addList = this.addList.reduce((previousValue, currentValue) => {
        if (!this.modList.includes(currentValue)) {
            //console.log("curr");
            //console.log(currentValue);
            previousValue.push(currentValue);
        }
        return previousValue;
    }, []);

    

    let modName = this.modList.length > 0 ? this.modList.map(mod =>{
        return Interval.Notation.toText(mod) + (addList.length > 0 ? ", " : "" );
    }) :null;


    let addName = addList.length > 0  ?  "Add " + addList.map(add =>{
        return Interval.Notation.toText(add) + ", ";
    }) : null;

    //console.log(modName);
    //console.log("modName");
            

    if (fromDB) {
        if (modName) {
            modName = this.modList.length > 0 ? "" + this.modList.map(mod =>{
                return Interval.Notation.toText(mod) + ", ";
            }).join("") :null;

            if (modName.endsWith(", ")) { 
                modName = modName.slice(0, -2); // Removes trailing character ", "
            }
            modName = `(${modName})`;
        }
        if (addName) {
            addName = addList.length > 0  ?  "Add " + addList.map(add =>{
                return Interval.Notation.toText(add);
            }).join(", ") : null;

            //console.log(addName);
            //console.log("addName");

            if (addName.endsWith(", ")) { 
                addName = addName.slice(0, -2); // Removes trailing character ", "
            }
            addName = `(${addName})`;

            //console.log(addName);
            //console.log("addName again");
        }
    }

    this.name = rootName +
    (extensionName ? " " + extensionName : "") + 
    (traidName ? " " + traidName : "") + 
    (modName ? " " + modName : "") + 
    (addName ? " " + addName : "") + 
    (slashName ? " " + slashName : "");
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
        // TODO: This is 
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

            return check.value === note.value;
        });

        //modNote.quality

        //note = Note.fromName(modNote);
        //if the note is in the this.notes array, mod it
        //var index = this.notes.indexOf(match);
        if (match) {
            if (accidental === 'b') {
                //this.notes[index] = this.notes[index].flat();
                this.notes[index] = match.flat();
            } else if (accidental === '#') {
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


Chord.chordFromNotation = function(notation, fromDB) {
    let parsedNotation = Parser.parse(notation);
    //console.log("Chord.chordFromNotation");
    //console.log(parsedNotation);
    //console.log(parsedNotation[0].quality.extension);
    //console.log("parsedNotation[0].quality.extension^"); // { symbol: '9', value: '9' }
    if(Array.isArray(parsedNotation)) {parsedNotation = parsedNotation[0]}
    /* should always have a triad */
    if (parsedNotation.quality.triad == undefined) {throw new Err1or("no triad: " + notation)}
    return new Chord(parsedNotation, notation, fromDB);
}
/*
N
Major N
Diminished N
Half Diminished N Dø7
*/
Chord.prototype.generateCategory = function(extension) {
    if(Array.isArray(extension)){
        return "Triad";
    } else{
        extension = extension.symbol;
        if(!extension){
            return "Triad";
        }
        extension.replace(/-?M?maj/,'');                 //first line wwas here before i added second to work IN APP. WHY WAS IT GENERATING CHORDS WITH THIS ANYWAY? IT MAKES NO SENSE
        extension = extension.replace(/-?M?maj/,'');
        
        //console.log();
        return numberHumanNames[parseInt(extension)];
        
    }
}
//returns the next logically extended chord
Chord.prototype.extendChord = function(){
    //there is no next logically chord
    if(this.category === "Thirteen"){
        return null;
    }
    let  nextCategory = categories[categories.indexOf(this.category) + 1];
}

Chord.prototype.extensionNameDB = function(str, triadStr) {

    //console.log(triadStr);
    //console.log("triadStr^ ___________________________extensionNameDB");
 //fix it somehwere hear idk how
 if(!str){
    return null;
    }
    //does this break with -maj instead of maj? switch with a regular expression replace instead?
    else if(str.substring(0,4) === '-maj'){
        return "Major " + numberHumanNames[str.substring(4)];
    }
    else if(str.substring(0,3) === 'maj'){
        return "Major " + numberHumanNames[str.substring(3)];
    } else if(str[0] === "ø"){
        // TODO THISS__________________________________________________________________
        return "Half Diminished " + numberHumanNames[str.substring(1)];
    } else if (triadStr === "dim") {
        //console.log("YESSssssssssssssssssssssssssssssssssssssssssssssssssssssssss");
        return "";
    }
    else {
        return numberHumanNames[str];
    }
}

Chord.prototype.extensionName = function(str, fromDB, triadStr){
    //console.log(str);
    //console.log("str________________________________");
    if (fromDB) {return Chord.prototype.extensionNameDB(str, triadStr)};

    if(!str){
        return null;
    }
    //does this break with -maj instead of maj? switch with a regular expression replace instead?
    else if(str.substring(0,3) === 'maj'){
        return "Major " + numberHumanNames[str.substring(3)];
    } else if(str[0] === "ø"){
        return "Half Diminished " + numberHumanNames[str.substring(1)];
    } 


    else {
        return numberHumanNames[str];
    }
}

// -args-
// noteStringList: ["E", "F#", "G#", etc]
Chord.prototype.allNotesFoundInNoteStringList = function(noteStringList) { 
    // iterate through chord notes
    // is chord.note.name found in noteStringList?
    // if ONE of them isn't, return false
    if (noteStringList.length < 1) {return false;}
    //console.log("allNotesFoundInNoteStringList(" + noteStringList + ")")
    let bool = true;
    let match;

    noteStringList.forEach(noteStringListNote => {
        match = this.notes.find( note => note.name === noteStringListNote );
        if(bool && match === undefined) { 
            // since bool is true to start, if its true and theres no match, set to false. If it's false, stay false until the end of iteration regardless
            bool = false;
        }
    })
    return bool;
}

Chord.triads = triads;
Chord.extensions = extensions;

/* let n = Chord.chordFromNotation("D7(#11)");
//console.log(n);

let x = Chord.chordFromNotation("B7(#9)");
console.log(x);*/

 /*console.log(JSON.stringify(Parser.parse("D7(b5)")));
console.log("Parser.parse('D7(b5)^')");
console.log(JSON.stringify(Parser.parse("D7b5")));
console.log("Parser.parse('D7b5^')");


console.log(JSON.stringify(Parser.parse("D7(b5,#9)")));
console.log("Parser.parse('D7(b5#9)')"); 


console.log(JSON.stringify(Parser.parse("D7b5(add 11)")));
console.log("Parser.parse('D7b5(add11)^')");

console.log(JSON.stringify(Parser.parse("D75")));
console.log("Parser.parse('D75^')");

console.log(JSON.stringify(Parser.parse("D7b5(add b11)")));
console.log("Parser.parse('D7b5(add b11)^')");


console.log(JSON.stringify(Parser.parse("D7b5(b6)")));
console.log("Parser.parse('D7b5(b6)^')");

console.log(JSON.stringify(Parser.parse("D7b5b6")));
console.log("Parser.parse('D7b5b6^')");
console.log(JSON.stringify(Parser.parse("D6#9#11")));
console.log("Parser.parse('D6#9#11^')");

console.log(JSON.stringify(Parser.parse("D6(#9,#11)")));
console.log("Parser.parse('D6(#9,#11)^')");*/


/* want to support commas? */
/*
console.log(JSON.stringify(Parser.parse("D6#9,#11")));
console.log("Parser.parse('D6#9,#11^')");*/

