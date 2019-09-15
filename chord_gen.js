"use strict";

const Note = require('./lib/Note.js');
const Interval = require('./lib/Interval.js');


const Blueprint = {};

Blueprint.copy = function(source) {
    // Shallow copy
    let blueprint = Object.assign({}, source);

    // shallow copy internal properties
    blueprint.activeAlterations = Alterations.copy(blueprint.activeAlterations);
    blueprint.capabilities = Alterations.copy(blueprint.capabilities);
    blueprint.intervals = [...source.intervals];

    // blueprint.base is used to preserve the blueprint we started with (before any alterations)
    // if it exists already then we just use that
    // if it doesn't, then that can only be because we're the source blueprint
    blueprint.base = blueprint.base || {
        name: blueprint.name,
        sym: blueprint.sym,
        intervals: [...blueprint.intervals]
    };



    return blueprint;
};

// intervalList: Array of intervals in symbol form (String)
// interval: MUST be interval with mod, NOT pure, is a symbol (String) TODO: enforce
// Returns: Boolean
function pureIntervalAlreadyExistsInList(intervalList, interval) {
    var passedValue = Interval.intervalStringToInterval(interval);

    return Boolean(intervalList.find(sym => {
        let checkValue = Interval.intervalStringToInterval(sym);
        return checkValue === passedValue;
    }));
};



// this takes a blueprint.capabilities and moves from capabilities.add
// to capabilities.mod where items are intervals with one or more accidentals
// for the purpose of representing them in the string in a better shorthand,
// but ONLY if the pure (unaltered) form of that interval doesn't already exist in the 
// chord
// i.e. instead of being stuck with 'E7(add #9)' which is logical
// this would help us to generate a string 'E7#9' which is readable and terse
// and the distinstion between E(b5) and E(add b5) is that 
// in E(b5) the '5' in 'E' is being flattened, thus it has notes E, G#, A#
// whereas in E(add b5) the'b5' is being added to the chord, not modifying/replacing
// so it has the notes E, G# B, A#

// TODO: do both? for naming coverage
// this is specific to alterations more than blueprint?
Blueprint.generateStringNormalizedAlterations = function (blueprint) {

    // shallow copy
    let alterations = Alterations.copy(blueprint.activeAlterations);

    // Copy the intervals with accidentals from .add to .mod
    alterations.add.forEach((interval, index) => {
        if (Interval.hasAccidental(interval) && !pureIntervalAlreadyExistsInList(alterations.mod, interval)) {
            // Note: notice that the order will ALWAYS be mods first before the mods that are accidental adds
            alterations.mod.push(interval);
        }
    });

    // remove the items that we pulled from .add
    alterations.add = alterations.add.reduce((list,interval) => {
        if (!Interval.hasAccidental(interval)) { list.push(interval) };
        return list;
    }, []);

    return alterations;

}

Blueprint.generateName = function (print) {
    // No symbol to customize
    if (!isAltered(print)) { return print.name; }

    // copy blueprint
    let blueprint = Blueprint.copy(print);

    // send that blueprint to function to generate new capabilities object
    // where capabilities.mod now has items that were previously in capabilities.add
    // i.e. added tones with accidentals

    // generates strings that prefer adds with accidentals as part of the mod string
    blueprint.activeAlterations = Blueprint.generateStringNormalizedAlterations(blueprint);

    // generate a string for mods
    let mods = !isModified(blueprint) ? "" :
        "(".concat(blueprint.activeAlterations.mod.map(sym => {
            return Interval.symbolToEnglish(sym);
        }).join(", ")).concat(")");

    // generate a string for adds
    let adds = !hasAddedTones(blueprint) ? "" :
        "(Add ".concat(blueprint.activeAlterations.add.map(sym => { return Interval.symbolToEnglish(sym); }).join(", ").concat(")"));

    if (mods && adds) {
        mods = mods.concat(" ");
    }

    // bring it all together
    return blueprint.base.name.concat(" ".concat(mods.concat(adds)));
}

Blueprint.generateSymbol = function (print) {

    // No symbol to customize
    if (!isAltered(print)) { return print.sym; }

    // copy blueprint
    let blueprint = Blueprint.copy(print);

    // generates strings that prefer adds with accidentals as part of the mod string
    blueprint.activeAlterations = Blueprint.generateStringNormalizedAlterations(blueprint);

    // generate a string for mods
    let mods = !isModified(blueprint) ? "" : (() => {
        if (blueprint.base.sym === "") {
            return "(".concat(blueprint.activeAlterations.mod.join()).concat(")");
        }
        return blueprint.activeAlterations.mod.join();
    })();

    // generate a string for adds
    let adds = !hasAddedTones(blueprint) ? "" :
        "(add ".concat(blueprint.activeAlterations.add.join(", ").concat(")"));

    // bring it all together
    return blueprint.base.sym.concat(mods.concat(adds));

    //   For when we support accidental adds. Maybe just do two versions: one with all accidental adds in the mod list (if we can) and
    //   another for all accidental adds in the add list
}


const Capabilities = {};
// ARRAY:STRING modList: something like blueprint.capabilities.mod
// STRING interval : interval symbol

// pass a mod (interval with accidental) and modlist (array of mod symbols (string))
// will return a list that removes all lost mod capabilities incurred by the initial mod in question
Capabilities.removeModsForMod = function (modlist, interval) {
    // 'b5' --> '5'
    let pureSource = Interval.removeAccidentals(interval);

    return modlist.reduce((list, target) => {
        let pureTarget = Interval.removeAccidentals(target);
        if (pureTarget !== pureSource) {
            list.push(target);
        }
        return list;
    }, []);
};
//
// ARRAY:STRING addList: something like blueprint.capabilities.add
// STRING interval : interval symbol
//
//   When a chord, like G#aug-maj7 is modified (taking a pure interval and b or # it)
//     We want to add the now missing pure interval to the capabilities.add list
//     if it does not exist. If it does exist, the list produced is identical.
//
Capabilities.addPureAddToneFromMod = function(addList, interval) {
    let list = [...addList];
    let pureInterval = Interval.removeAccidentals(interval);
    if (!list.find(add => add !== pureInterval)) {
        list.push(pureInterval);
    }
    return list;
};


/* Alterations */
const Alterations = {};

Alterations.copy = function (source) {
    // shallow copy
    let copy = source ? Object.assign({}, source) : {
        add: [],
        mod: []
    };

    // shallow copy internal properties
    copy.mod = copy.mod ? [...copy.mod] : [];
    copy.add = copy.add ? [...copy.add] : [];

    return copy;
};

Alterations.areEmpty = function (altObj) {
    return (altObj.add.length === 0 && altObj.mod.length === 0);
};

Alterations.haveCapabilities = function (altObj) {
    return !Alterations.areEmpty(obj.capabilities);
};

// Orphaned functions

// intervals: list of string symbols
// interval: a string symbol with an accidental (one hopes)
// todo: this function is octave specific. b2 wouldn't knock a pure 9 out of the way or vice versa etc
// is that GOOD behavior?
function replacePureIntervalWithMod(intervals, interval) {
    let pureInterval = Interval.removeAccidentals(interval);
    return intervals.map(reference => {
        return (reference === pureInterval) ? interval : reference;
    });
}

// blueprint and chord both share these functions
function isAltered(obj) {
    return !Alterations.areEmpty(obj.activeAlterations);
}

function isModified(obj) {
    return obj.activeAlterations.mod.length > 0;
}

function hasAddedTones(obj) {
    return obj.activeAlterations.add.length > 0;
}

// TODO: the order generateNormalizedAlterations produces should dictate the order of the .notes and .intervals
//  for preserving note order in the database and making these chords truly distinct in written form

// OR perhaps calculating VOICINGS for a chord is a separate matter altogether!

// root = Note object
// intervals = array of interval symbols

function Chord(note, blueprint) {
    const bp = Blueprint.copy(blueprint);
    this.blueprint = bp;
    this.root = Note.fromName(note);
    this.name = this.root.name.concat(" ").concat(bp.name);
    this.sym = this.root.name.concat(bp.sym);

    this.notes = Chord.generateNotes(this.root, bp.intervals);

    // Take a cloned activeAlterations object '{add:[],mod:[]}' from the blueprint
    //   where each list item is an interval symbol string
    this.activeAlterations = Alterations.copy(bp.activeAlterations);

    // Take a cloned capabilities object '{add:[],mod:[]}' from the blueprint
    //   where each list item is an interval symbol string
    this.capabilities = Alterations.copy(bp.capabilities);

    console.log("chord created (NO ALTERATIONS GENERATED YET)");

/* temp for data dumping // NOTE MAKE SURE TO CLEAR OUT my_file.text FIRST SINCE THIS APPENDS!
    if (this.root.name === "A" && this.blueprint.base.name === "Major") {
        var fs = require('fs');

        //var stream = fs.createWriteStream("my_file.txt");
        let t = Chord.toQuickJSON(this).concat(",\n\n");
        console.log("d");
        fs.appendFileSync('my_file.txt', t, function (err) {
            if (err) throw err;
            //chords.forEach(chord => stream.appendFile(Chord.toQuickJSON(chord).concat(",\n\n")));
        });

    } */
    


    // Use blueprint.capabilities to generate an alteration object '{add:[],mod:[]}'
    //   where each list item is a chord object of one alteration step away from this chord
    this.alteredChords = Chord.generateAlterations(this, bp);

    // Enter into database?
}

Chord.generateNotes = function (root, intervals) {
    return [root].concat(intervals.map(interval => root.plus(interval)));
};

Chord.generateAlterations = function (chord, blueprint) {
    return {
        mod: blueprint.capabilities.mod.map(interval => Chord.createMod(chord, interval)),
        add: blueprint.capabilities.add.map(interval => Chord.createAdd(chord, interval))
    };
};

// shouldn't we use this function instead of 
function removeIntervalValueFromlist(list, intSymbol) {
    var passedValue = Interval.intervalStringToInterval(intSymbol);

    return list.reduce((collection, sym) => {
        let checkValue = Interval.intervalStringToInterval(sym);
        if (checkValue !== passedValue) { collection.push(sym);}
        return collection;
    }, []);

}


// if mod, always accidental, so always check if modded note
// needs to be removed from capabilities.mod and capabilities.add

Chord.createMod = function(chord, intSymbol) {
    // Start creating a new blueprint for the modified chord
    let blueprint = Blueprint.copy(chord.blueprint);

    // replace the appropriate item in blueprint.intervals
    blueprint.intervals = replacePureIntervalWithMod(blueprint.intervals, intSymbol);

    // remove the new modification from blueprint.capabilities.mod
    // as it's not a capability
    let index = blueprint.capabilities.mod.indexOf(intSymbol);
    blueprint.capabilities.mod.splice(index, 1);

    // Since this mod could be a capability for add, remove that too
    // (based on absolute interval value ())
    blueprint.capabilities.add = removeIntervalValueFromlist(blueprint.capabilities.add, intSymbol);

    //let index = blueprint.capabilities.add.indexOf(intSymbol);
    //blueprint.capabilities.add.splice(index, 1);

    // Remove any capabilities.mod item that has the natural symbol anywhere
    // i.e. if int symbol is #9, that means we modified a natural 9,
    // so any other entry for 9 (b9, bb9, ##9, etc) should also be removed
    /* deprecated removeAllCapabilitiesForModSymbol(blueprint, intSymbol); */
    blueprint.capabilities.mod = Capabilities.removeModsForMod(blueprint.capabilities.mod, intSymbol);

    // Identify the mod as active
    blueprint.activeAlterations.mod.push(intSymbol);

    // A pure interval was modded, so that same pure interval just became available to add
    blueprint.capabilities.add = Capabilities.addPureAddToneFromMod(blueprint.capabilities.add, intSymbol);

    // Generate blueprint specific symbol and human readable English name
    blueprint.sym = Blueprint.generateSymbol(blueprint);
    blueprint.name = Blueprint.generateName(blueprint);

    // Generate the new chord using the blueprint
    let newChord = new Chord(chord.root.name, blueprint);

    return newChord;
};

Chord.createAdd = function(chord, intSymbol) {
    // Start creating a new blueprint for the add chord
    let blueprint = Blueprint.copy(chord.blueprint);

    // add an item to blueprint.intervals
    blueprint.intervals.push(intSymbol);

    // remove the new add from blueprint.capabilities.add
    let index = blueprint.capabilities.add.indexOf(intSymbol);
    blueprint.capabilities.add.splice(index, 1);

    // if accidental
    //blueprint.capabilities.add = removeIntervalValueFromlist(blueprint.capabilities.add, intSymbol);

    // [Part of Accidental Adds]
    //   If accidental add, it's possible that a capability.mod was made
    //   redundant e.g. E13(add #9) the '#9' item in capability.mod
    //   would now be inconsequential (you'd be subtracting notes rather 
    //   than adding since two notes are repeated)

    // NEW_FEATURE accidental adds
    if (Interval.hasAccidental(intSymbol)) {
        console.log("It's an add with an accidental");
        //blueprint.capabilities.mod = Capabilities.removeModsForMod(blueprint.capabilities.mod, intSymbol);


        blueprint.capabilities.mod = removeIntervalValueFromlist(blueprint.capabilities.mod, intSymbol);
    }

    // Identify the alteration as active
    blueprint.activeAlterations.add.push(intSymbol);
    ;
    // Generate blueprint specific symbol and human readable English name
    blueprint.sym = Blueprint.generateSymbol(blueprint);
    blueprint.name = Blueprint.generateName(blueprint);

    // Generate the new chord
    let newChord = new Chord(chord.root.name, blueprint);

    return newChord;
};


Chord.toQuickJSON = function (chord) {
    let intermed = {
        name: chord.name,
        sym: chord.sym,
        activeAlterations: chord.activeAlterations,
        capabilities: chord.capabilities
    };
    let json = JSON.stringify(intermed);
    return json;
}


// MASSIVE TODO: Are we doing odd things like allowing mod: b5 and add: #11?? We are!
//  There needs to be a way that this is self-correcting. We have to check if that interval EXISTS
//  compare absolute values??! Probably easy



// just for right now, let's avoid (add 6s) or (add 13s) but we'll want the extra names later (because 6 chords exist)
//  b6 is fine!

// TODO: b5 mod and #11 add cause problems. At some point, we need to prevent that combination from happening
//  whichever step happens first, when b5 goes in, both b5 and #11 which has the same interval value should be nixed
//  from the lists of capabilities, and vice versa.

// HUGE TODO: #5 is not fine on Major triad. Actually, be careful about accidental adds, because right now they would
// get appended to the mod list in string generation! BUT we aren't modifying a note! So that means on Blueprint.generateNormalizedAlterations
// we need to CHECK, does the pure form of the note (interval) exist in the BASE CHORD (BLUEPRINT) notes (harkens back to another todo)?
// if it already exists in the base chord then we need to keep it in the add list


const MAJOR_BLUEPRINTS = [{
    name: "Major",
    sym: "",
    intervals: ["3", "5"],
    capabilities: {
        mod: ["b5"],
        add: ["9", "11", "b9", "#9", "#11"]
    }
},
{
    name: "Six",
    sym: "6",
    intervals: ["3", "5", "6"],
    capabilities: {
        mod: ["b5"],
        add: ["9", "11"]
    }
},
{
    name: "Seven",
    sym: "7",
    intervals: ["3", "5", "b7"],
    capabilities: {
        mod: ["b5"],
        add: ["11", "13"],
    }
},
{
    name: "Nine",
    sym: "9",
    intervals: ["3", "5", "b7", "9"],
    capabilities: {
        mod: ["b5"],
        add: ["13"]
    }
},
{
    name: "Eleven",
    sym: "11",
    intervals: ["3", "5", "b7", "9", "11"],
    capabilities: {
        mod: ["b5", "b9", "#9"],
        add: []
    }
},
{
    name: "Thirteen",
    sym: "13",
    intervals: ["3", "5", "b7", "9", "11", "13"],
    capabilities: {
        mod: ["b5", "b9", "#9", "#11"],
        add: []
    }
},
{
    name: "Major Seven",
    sym: "maj7",
    intervals: ["3", "5", "7"],
    capabilities: {
        mod: ["b5"],
        add: ["11", "13"]
    }
},
{
    name: "Major Nine",
    sym: "maj9",
    intervals: ["3", "5", "7", "9"],
    capabilities: {
        mod: ["b5"],
        add: ["13"]
    }
},
{
    name: "Major Eleven",
    sym: "maj11",
    intervals: ["3", "5", "7", "9", "11"],
    capabilities: {
        mod: ["b5", "b9", "#9"],
        add: []
    }
},
{
    name: "Major Thirteen",
    sym: "maj13",
    intervals: ["3", "5", "7", "9", "11", "13"],
    capabilities: {
        mod: ["b5", "b9", "#9", "#11"],
        add: [],
    }
}];

const MINOR_BLUEPRINTS = [{
    name: "Minor",
    sym: "m",
    intervals: ["b3", "5"],
    capabilities: {
        mod: [],
        add: ["9", "11"],
    }
},
{
    name: "Minor Six",
    sym: "m6",
    intervals: ["b3", "5", "6"],
    capabilities: {
        mod: [],
        add: ["9", "11"]
    }
},
{
    name: "Minor Seven",
    sym: "m7",
    intervals: ["b3", "5", "b7"],
    capabilities: {
        mod: [],
        add: ["11", "13"]
    }
},
{
    name: "Minor Nine",
    sym: "m9",
    intervals: ["b3", "5", "b7", "9"],
    capabilities: {
        mod: [],
        add: ["13"]
    }
},
{
    name: "Minor Eleven",
    sym: "m11",
    intervals: ["b3", "5", "b7", "9", "11"],
    capabilities: {
        mod: ["b9"],
        add: []
    }
},
{
    name: "Minor Thirteen",
    sym: "m13",
    intervals: ["b3", "5", "b7", "9", "11", "13"],
    capabilities: {
        mod: ["b9", "b11", "#11"],
        add: []
    }
},
{
    name: "Minor Major Seven",
    sym: "m-maj7",
    intervals: ["b3", "5", "7"],
    capabilities: {
        mod: [],
        add: ["11", "13"]
    }
},
{
    name: "Minor Major Nine",
    sym: "m-maj9",
    intervals: ["b3", "5", "7", "9"],
    capabilities: {
        mod: [],
        add: ["13"]
    }
},
{
    name: "Minor Major Eleven",
    sym: "m-maj11",
    intervals: ["b3", "5", "7", "9", "11"],
    capabilities: {
        mod: ["b9"],
        add: []
    }
},
{
    name: "Minor Major Thirteen",
    sym: "m-maj13",
    intervals: ["b3", "5", "7", "9", "11", "13"],
    capabilities: {
        mod: ["b9", "b11", "#11"],
        add: []
    }
    }];

const SUSPENDED_BLUEPRINTS = [{
    name: "Suspended Two",
    sym: "sus2",
    intervals: ["2", "5"],
    capabilities: {
        mod: ["b5"],
        add: ["11"],
    }
},
{
    name: "Six Suspended Two",
    sym: "6sus2",
    intervals: ["2", "5", "6"],
    capabilities: {
        mod: ["b5"],
        add: ["11"]
    }
},
{
    name: "Seven Suspended Two",
    sym: "7sus2",
    intervals: ["2", "5", "b7"],
    capabilities: {
        mod: ["b5"],
        add: ["11", "13"]
    }
},
{
    name: "Nine Suspended Two",
    sym: "9sus2",
    intervals: ["2", "5", "b7", "9"],
    capabilities: {
        mod: ["b5"],
        add: ["13"]
    }
},
{
    name: "Eleven Suspended Two",
    sym: "11sus2",
    intervals: ["2", "5", "b7", "9", "11"],
    capabilities: {
        mod: ["b5", "b9", "#9"],
        add: []
    }
},
{
    name: "Thirteen Suspended Two",
    sym: "13sus2",
    intervals: ["2", "5", "b7", "9", "11", "13"],
    capabilities: {
        mod: ["b5", "b9", "#9", "b11", "#11"],
        add: []
    }
},
{
    name: "Major Seven Suspended Two",
    sym: "maj7sus2",
    intervals: ["2", "5", "7"],
    capabilities: {
        mod: ["b5"],
        add: ["11", "13"]
    }
},
{
    name: "Major Nine Suspended Two",
    sym: "maj9sus2",
    intervals: ["2", "5", "7", "9"],
    capabilities: {
        mod: ["b5"],
        add: ["13"]
    }
},
{
    name: "Major Eleven Suspended Two",
    sym: "maj11sus2",
    intervals: ["2", "5", "7", "9", "11"],
    capabilities: {
        mod: ["b5", "b9", "#9"],
        add: []
    }
},
{
    name: "Major Thirteen Suspended Two",
    sym: "maj13sus2",
    intervals: ["2", "5", "7", "9", "11", "13"],
    capabilities: {
        mod: ["b9", "#9", "b11", "#11"],
        add: []
    }
},
{
    name: "Suspended Four",
    sym: "sus4",
    intervals: ["4", "5"],
    capabilities: {
        mod: ["b5"],
        add: ["9"],
    }
},
{
    name: "Six Suspended Four",
    sym: "6sus4",
    intervals: ["4", "5", "6"],
    capabilities: {
        mod: ["b5"],
        add: ["9"]
    }
},
{
    name: "Minor Seven Suspended Four",
    sym: "7sus4",
    intervals: ["4", "5", "b7"],
    capabilities: {
        mod: ["b5"],
        add: ["9", "13"]
    }
},
{
    name: "Nine Suspended Four",
    sym: "9sus4",
    intervals: ["4", "5", "b7", "9"],
    capabilities: {
        mod: ["b5"],
        add: ["13"]
    }
},
{
    name: "Eleven Suspended Four",
    sym: "11sus4",
    intervals: ["4", "5", "b7", "9", "11"],
    capabilities: {
        mod: ["b5", "b9", "#9"],
        add: []
    }
},
{
    name: "Thirteen Suspended Four",
    sym: "13sus4",
    intervals: ["4", "5", "b7", "9", "11", "13"],
    capabilities: {
        mod: ["b5", "b9", "#9", "b11", "#11"],
        add: []
    }
},
{
    name: "Major Seven Suspended Four",
    sym: "maj7sus4",
    intervals: ["4", "5", "7"],
    capabilities: {
        mod: ["b5"],
        add: ["9", "13"]
    }
},
{
    name: "Major Nine Suspended Four",
    sym: "maj9sus4",
    intervals: ["4", "5", "7", "9"],
    capabilities: {
        mod: ["b5"],
        add: ["13"]
    }
},
{
    name: "Major Eleven Suspended Four",
    sym: "maj11sus4",
    intervals: ["4", "5", "7", "9", "11"],
    capabilities: {
        mod: ["b9", "#9"],
        add: []
    }
},
{
    name: "Major Thirteen Suspended Four",
    sym: "maj13sus4",
    intervals: ["4", "5", "7", "9", "11", "13"],
    capabilities: {
        mod: ["b5", "b9", "#9", "b11", "#11"],
        add: []
    }
}];

const DIMINISHED_BLUEPRINTS = [{
    name: "Diminished",
    sym: "dim",
    intervals: ["b3", "b5"],
    capabilities: {
        mod: [],
        add: ["9", "11"],
    }
},
{
    name: "Diminished Seven",
    sym: "dim7",
    intervals: ["b3", "b5", "bb7"],
    capabilities: {
        mod: [],
        add: ["11", "13"]
    }
},
{
    name: "Diminished Nine",
    sym: "dim9",
    intervals: ["b3", "b5", "bb7", "9"],
    capabilities: {
        mod: [],
        add: ["13"]
    }
},
{
    name: "Diminished Eleven",
    sym: "dim11",
    intervals: ["b3", "b5", "bb7", "9", "11"],
    capabilities: {
        mod: ["b9"],
        add: []
    }
},
{
    name: "Diminished Thirteen",
    sym: "dim13",
    intervals: ["b3", "b5", "bb7", "9", "11", "13"],
    capabilities: {
        mod: ["b9", "b11"],
        add: []
    }
},
{
    name: "Half-Diminished Seven",
    sym: "ø7",
    intervals: ["b3", "b5", "b7"],
    capabilities: {
        mod: [],
        add: ["11", "13"]
    }
},
{
    name: "Half-Diminished Nine",
    sym: "ø9",
    intervals: ["b3", "b5", "b7", "9"],
    capabilities: {
        mod: [],
        add: ["13"]
    }
},
{
    name: "Half-Diminished Eleven",
    sym: "ø11",
    intervals: ["b3", "b5", "b7", "9", "11"],
    capabilities: {
        mod: ["b9"],
        add: []
    }
},
{
    name: "Half-Diminished Thirteen",
    sym: "ø13",
    intervals: ["b3", "b5", "b7", "9", "11", "13"],
    capabilities: {
        mod: ["b9", "b11",],
        add: []
    }
},
{
    name: "Diminished Major Seven",
    sym: "dim-maj7",
    intervals: ["b3", "b5", "7"],
    capabilities: {
        mod: [],
        add: ["11", "13"]
    }
},
{
    name: "Diminished Major Nine",
    sym: "dim-maj9",
    intervals: ["b3", "b5", "7", "9"],
    capabilities: {
        mod: [],
        add: ["13"]
    }
},
{
    name: "Diminished Major Eleven",
    sym: "dim-maj11",
    intervals: ["b3", "b5", "7", "9", "11"],
    capabilities: {
        mod: ["b9"],
        add: []
    }
},
{
    name: "Diminished Major Thirteen",
    sym: "dim-maj13",
    intervals: ["b3", "b5", "7", "9", "11", "13"],
    capabilities: {
        mod: ["b9", "b11"],
        add: []
    }
}];

const AUGMENTED_BLUEPRINTS = [{
    name: "Augmented",
    sym: "aug",
    intervals: ["3", "#5"],
    capabilities: {
        mod: [],
        add: ["9", "11"],
    }
},
{
    name: "Augmented Six",
    sym: "aug6",
    intervals: ["3", "#5", "6"],
    capabilities: {
        mod: [],
        add: ["9", "11"]
    }
},
{
    name: "Augmented Seven",
    sym: "aug7",
    intervals: ["3", "5", "b7"],
    capabilities: {
        mod: [],
        add: ["11", "13"]
    }
},
{
    name: "Augmented Nine",
    sym: "aug9",
    intervals: ["3", "#5", "b7", "9"],
    capabilities: {
        mod: [],
        add: ["13"]
    }
},
{
    name: "Augmented Eleven",
    sym: "aug11",
    intervals: ["3", "#5", "b7", "9", "11"],
    capabilities: {
        mod: ["b9", "#9"],
        add: []
    }
},
{
    name: "Augmented Thirteen",
    sym: "aug13",
    intervals: ["3", "#5", "b7", "9", "11", "13"],
    capabilities: {
        mod: ["b9", "#9", "b11", "#11"],
        add: []
    }
},
{
    name: "Augmented Major Seven",
    sym: "aug-maj7",
    intervals: ["3", "#5", "7"],
    capabilities: {
        mod: [],
        add: ["11", "13"]
    }
},
{
    name: "Augmented Major Nine",
    sym: "aug-maj9",
    intervals: ["3", "#5", "7", "9"],
    capabilities: {
        mod: [],
        add: ["13"]
    }
},
{
    name: "Augmented Major Eleven",
    sym: "aug-maj11",
    intervals: ["3", "#5", "7", "9", "11"],
    capabilities: {
        mod: ["b9", "#9"],
        add: []
    }
},
{
    name: "Augmented Major Thirteen",
    sym: "aug-maj13",
    intervals: ["3", "#5", "7", "9", "11", "13"],
    capabilities: {
        mod: ["b9", "#9", "b11", "#11"],
        add: []
    }
}];

function chordsFromBlueprints(note, blueprints) {
    return blueprints.map(blueprint => {
        return new Chord(note, blueprint);
    });
}

function allChordsFromBlueprints(blueprints) {
    let notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];

    return notes.reduce((list, note) => {
        return list.concat(chordsFromBlueprints(note, blueprints));
    }, []);
}




let chords = allChordsFromBlueprints(MAJOR_BLUEPRINTS
    .concat(MINOR_BLUEPRINTS)
    .concat(SUSPENDED_BLUEPRINTS)
    .concat(DIMINISHED_BLUEPRINTS)
    .concat(AUGMENTED_BLUEPRINTS)
);



/*
var fs = require('fs');

var stream = fs.createWriteStream("my_file.txt");
stream.once('open', function (fd) {
    chords.forEach(chord => stream.write(Chord.toQuickJSON(chord).concat(",\n\n")));
    stream.end();
});*/

console.log("Generated Chord count across 12 chromatic root notes: " + chords.length);

