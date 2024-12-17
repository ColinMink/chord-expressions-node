"use strict";

const Note = require('./lib/note.js');
const Interval = require('./lib/interval.js');


console.log("ran");




// Review the points below

// TODO: Be strict on octave equivalence in the MSB (Mod Syntax Block). 9 !== 2 and 10 !== 3
//       E(#10) would add #10 instead of modifying the 3. E9#9 would modify the 9.
//       E9#2 and E9#16 would add a #2 tone rather than modifying the 9.

// TODO: Be lax on the ASB (Add SB). #10 vs #3 comes down to voicing considerations. Of course
//       if you write Em11b18 or Em11(add b18) MAYBE we can float some (restOfTheChord + "b18") voicings to the top
//       but chord symbols otherwise just can't communicate voicing.
//       Em11(add b18) as (restOfTheChord + "b18") is not necessarily E(1) G(b3) B(5) D(b7) F#(9) A(11) G#(b18) or anything else.
//       Just (restOfTheChord + "b18"), or maybe even only ("11" + "b18") is what it tells us.



class Blueprint {

  constructor(source) {
    this.name = source.name;
    this.sym = source.sym;
    this.intervals = source.intervals;
    this.capabilities = source.capabilities; // capabilities should always be passed in
    this.category = source.category;
    this.activeAlterations = source.activeAlterations || new Alterations();

    /* blueprint.base is used to preserve the blueprint we started with (before any alterations)
           If it exists already then we just use that
           If it doesn't, then that can only be because we're the source blueprint */

    this.base = source.base || {
        name: this.name,
        sym: this.sym,
        intervals: [...this.intervals]
    };
    // TODO: Freeze blueprint.base and all items within if necessary ?
  }

  copy() {
      // Shallow copy
      const copy = {
          name: this.name,
          sym: this.sym,
          intervals: [...this.intervals],
          capabilities: this.capabilities.copy(),
          category: this.category,
          activeAlterations: this.activeAlterations.copy(),
          base: this.base
      };
      return new Blueprint(copy);
  }

  getCategoryFromUnbrokenChainIntervals() {
    const sortedIntervals = Interval.Notation.List.sortByChordInterval(this.intervals);

    let chaining = false;
    let lastInterval;

    for (let i = 0; i < sortedIntervals.length; i++) { 
        const interval = sortedIntervals[i];
        const thisInterval = Interval.removeAccidentals(interval);
       let thisValueisChained;

        switch(thisInterval) {
            case "7":         //if it's 7 we start the chain. 
                chaining = true;
                lastInterval = thisInterval;
                break;
            case  "9":
                thisValueIsChained = (lastInterval === "7");
                if (!thisValueIsChained) {
                    return false;
                }
                else { 
                    lastInterval = thisInterval;
                } 
                break;
            case "11":
                thisValueIsChained = (lastInterval === "9");
                if (!thisValueIsChained) {
                    return false; 
                }
                else { 
                    lastInterval = thisInterval;
                }
                break;
            case "13":
                thisValueIsChained = (lastInterval === "11");
                if (!thisValueIsChained) {
                    return false; 
                }
                else { 
                    lastInterval = thisInterval;
                } 
                break;
            default:
                if (chaining) {return false;} 
                chaining = false;
        }
   }

   return chaining;

  }

  hasunBrokenExtensionIntervalChain() {
    // this.intervals like ["b3", "b5", "7", "9", "#11"],
    const sortedIntervals = Interval.Notation.List.sortByChordInterval(this.intervals);

    let chaining = false;
    let lastInterval;

    for (let i = 0; i < sortedIntervals.length; i++) { 
         const interval = sortedIntervals[i];
         const thisInterval = Interval.removeAccidentals(interval);
        let thisValueisChained;

         switch(thisInterval) {
             case "7":         //if it's 7 we start the chain. 
                 chaining = true;
                 lastInterval = thisInterval;
                 break;
             case  "9":
                 thisValueIsChained = (lastInterval === "7");
                 if (!thisValueIsChained) {
                     return false;
                 }
                 else { 
                     lastInterval = thisInterval;
                 } 
                 break;
             case "11":
                 thisValueIsChained = (lastInterval === "9");
                 if (!thisValueIsChained) {
                     return false; 
                 }
                 else { 
                     lastInterval = thisInterval;
                 }
                 break;
             case "13":
                 thisValueIsChained = (lastInterval === "11");
                 if (!thisValueIsChained) {
                     return false; 
                 }
                 else { 
                     lastInterval = thisInterval;
                 } 
                 break;
             default:
                 if (chaining) {return false;} 
                 chaining = false;
         }
    }

    return chaining;

  }



  createAddedTone(intSymbol) {
    const copy = this.copy();

    // add this symbol to intervals
    copy.intervals.push(intSymbol);

    // remove this add symbol from capabilities
    const index = copy.capabilities.add.indexOf(intSymbol);
    copy.capabilities.add.splice(index, 1);

    // [Part of Accidental Adds]
    //   If accidental add, it's possible that a capability.mod was made
    //   redundant e.g. E13(add #9) the '#9' item in capability.mod
    //   would now be inconsequential (you'd be subtracting notes rather
    //   than adding since two notes are repeated)

    if (Interval.Notation.hasAccidental(intSymbol)) {
        copy.capabilities.mod = Interval.Notation.List.removeValue(copy.capabilities.mod, intSymbol);
        // copy.capabilities.removeMod(intSymbol);
    }

    // mark as active
    copy.activeAlterations.add.push(intSymbol);

    // Generate blueprint specific symbol and human readable English name
    copy.sym = copy.generateSymbol();
    copy.name = copy.generateName();

    return new Blueprint(copy);
  };

  createModified(intSymbol) {
      const copy = this.copy();


      replaceTheModifiedPureTone();
      copy.capabilities.removeExactMod(intSymbol);
      copy.capabilities.add = copy.capabilities.removeAddedTonesForMod(intSymbol); //TODO: remove addedTones for mod
 
      copy.capabilities.mod = copy.capabilities.removeAssociatedModsForMod(intSymbol);
      copy.addToActiveModList(intSymbol)
      copy.capabilities.add = copy.capabilities.appendPureAddTone(intSymbol);
      copy.sym = copy.generateSymbol();
      copy.name = copy.generateName();
      return new Blueprint(copy);

      function replaceTheModifiedPureTone() {
          // replace the appropriate item in blueprint.intervals (intSymbol is b5 and we are looking for a 5 to replace)
          copy.intervals = Interval.Notation.List.modify(copy.intervals, intSymbol);
      }
      // TODO: removeAssociatedModsFromCapabilities and removeThisModFromCapabilities should probably just be Capabilities.removeAllModCapabilities();
  }




  generateName() {
      // No symbol to customize
      if (!this.isAltered()) { return this.name; }

      // copy blueprint
      const blueprint = this.copy();

      // send that blueprint to function to generate new capabilities object
      // where capabilities.mod now has items that were previously in capabilities.add
      // i.e. added tones with accidentals

      // generates strings that prefer adds with accidentals as part of the mod string
      blueprint.activeAlterations = blueprint.generateStringNormalizedAlterations();

      // generate a string for mods
      const csvMods = blueprint.getActiveModsAsTextCSV();
      let mods = !blueprint.isModified() ? "" : `(${csvMods})`;

      // generate a string for adds
      const csvAdds = blueprint.getActiveAddTonesAsTextCSV();
      const adds = !blueprint.hasAddedTones() ? "" : `(Add ${csvAdds})`;

      // Just adds a space between them i.e. '(Flat Five) (Add 9)'
      mods = (mods && adds) ? `${mods} ` : mods;

      // bring it all together
      return `${blueprint.base.name} ${mods}${adds}`;
      //return blueprint.base.name.concat(" ".concat(mods.concat(adds)));
  }

  generateSymbol() {

      // No symbol to customize
      if (!this.isAltered()) { return this.sym; }

      // copy blueprint
      const blueprint = this.copy();

      // generate strings that prefer adds with accidentals as part of the mod string
      blueprint.activeAlterations = blueprint.generateStringNormalizedAlterations();

      // TODO: ????? generate a string for mods, wrapping in () if empty base quality notation
      // (currently wraps () always)
      const mods = !blueprint.isModified() ? "" : (() => {
          const modStr = blueprint.activeAlterations.mod.join();
          //console.log(blueprint.base); // TODO: BUG HERE. is blueprint.base not an obj?
          return blueprint.baseNotationIsBlank() ? `(${modStr})` : `(${modStr})`;
      })();

      // generate a string for adds
      const activeAdds = blueprint.activeAlterations.add.join(",");
      const adds = blueprint.hasAddedTones() ? `(add ${activeAdds})` : "";
    
      // bring it all together
      return `${blueprint.base.sym}${mods}${adds}`;

      //   For when we support accidental adds. Maybe just do two versions: one with all accidental adds in the mod list (if we can) and
      //   another for all accidental adds in the add list
  }





  // functions that MUTATE the object specifically in place
  addToActiveModList(intSymbol) {
      this.activeAlterations.addModifier(intSymbol);
  }

  // generating funcs that delegate to Alteration instances
  generateStringNormalizedAlterations() {
      return this.activeAlterations.generateStringNormalized(this.base.intervals);
  }


  // bool returns that delegate to Alteration instances
  isAltered() {
      return !this.activeAlterations.isEmpty();
  }

  isModified() {
      return this.activeAlterations.hasModifications();
  }

  hasAddedTones() {
      return this.activeAlterations.hasAddedTones();
  }

  // bool return that concerns with the symbol
  notationIsBlank() {
      return this.sym === "";
  }

  // bool return that concerns with the symbol
  baseNotationIsBlank() {
      return this.base.sym === "";
  }


  // getters that delegate to Alteration instances
  getActiveAddTonesTextList() {
      return this.activeAlterations.add.map( sym => Interval.Notation.toText(sym) );
  }

  getActiveModsTextList() {
      return this.activeAlterations.mod.map( sym => Interval.Notation.toText(sym) );
  }

  getActiveAddTonesNotationList() {
      return this.activeAlterations.add.join();
  }

  getActiveModsNotationList() {
      return this.activeAlterations.mod.join();
  }

  getActiveModsAsNotationCSV() {
    const modList = this.getActiveModsNotationList();
    return modList.join(", ");
  }

  getActiveAddTonesAsNotationCSV() {
    const addList = this.getActiveAddTonesNotationList();
    return addList.join(", ");
  }

  getActiveModsAsTextCSV() {
    const modList = this.getActiveModsTextList();
    return modList.join(", ");
  }

  getActiveAddTonesAsTextCSV() {
    const addList = this.getActiveAddTonesTextList();
    return addList.join(", ");
  }
}






class Capabilities {
  /* An object of {mod: [], add: []} where both lists are interval symbols in string form */
  // Just put the functions for capabilities into Alterations????


  constructor(source) {
      if (source) {
          this.add = source.add;
          this.mod = source.mod;
      } else {
          this.add = [];
          this.mod = [];
      }
  }

  copy() {
    const copy = {mod: [...this.mod], add: [...this.add]};
    return new Capabilities(copy);
  }

  removeAssociatedModsForMod(interval) {
      // 'b5' --> '5'
      const pureSource = Interval.Notation.removeAccidentals(interval);

      // create a new list that filters out any item with  '5' (#5,b5,bb5, etc)
      return this.mod.reduce((list, target) => {
          const pureTarget = Interval.Notation.removeAccidentals(target);
          if (pureTarget !== pureSource) {
              list.push(target);
          }
          return list;
      }, []);
  }

  removeExactMod(intSymbol) {
      // unlike removeAssociatedModsForMods this just removes one exact match mod

      const index = this.mod.indexOf(intSymbol);
      this.mod.splice(index, 1);
  }

  removeAddedTonesForMod(intSymbol) {
      // Since this mod could be a capability for add, remove that too
      return Interval.Notation.List.removeValue(this.add, intSymbol);
  }

  appendPureAddTone(interval) {
     // You pass "b5" and a 5 gets added
     //console.log(this);
      const list = [...this.add];
      const pureInterval = Interval.Notation.removeAccidentals(interval);
      if (!list.find(add => add !== pureInterval)) {
          list.push(pureInterval);
      }
      return list;
  }

}



class Alterations {
    /* An object of {mod: [], add: []} where both lists are interval symbols in string form
                                                            i.e. ["9", "#11"] */

  constructor(source) {
      if (source) {
          this.add = source.add;
          this.mod = source.mod;
      } else {
          this.add = [];
          this.mod = [];
      }
  }

  isEmpty() {
    return (this.add.length === 0 && this.mod.length === 0);
  }

  /* No one uses this, it references capabilities. Why is it here? */
  haveCapabilities() {
      return !this.capabilities.isEmpty();
  }
 /* No one uses this. Why is it here? Is this code that already exists in blueprint anyway? */
  hasAlterations() {
      return this.activeAlterations.isEmpty();
  }

  hasModifications() {
      return this.mod.length > 0;
  }

  hasAddedTones() {
      return this.add.length > 0;
  }

  copy() {
    const copy = {mod: [...this.mod], add: [...this.add]};
    return new Alterations(copy);
  }

  generateStringNormalized(blueprintBaseIntervals) {
      // shallow copy
      const alterations = this.copy();

      // Copy the intervals with accidentals from .add to .mod
      alterations.add.forEach((interval, index) => {
          if (Interval.Notation.hasAccidental(interval) && !Interval.Notation.List.hasPureInterval(blueprintBaseIntervals, interval, {restrictOctave: true}) ) {
              // Only if the interval has an accidental
              // AND a pure version of the note doesnt already exist in blueprint.intervals

              // Note: notice that the order will ALWAYS be mods first before the mods that are accidental adds
              alterations.mod.push(interval);
          }
      });

      // remove the items that we pulled from .add
      alterations.add = alterations.add.reduce((list,interval) => {
          if (!Interval.Notation.hasAccidental(interval) ||
                Interval.Notation.List.hasPureInterval(blueprintBaseIntervals, interval, {restrictOctave: true})
                )
          { list.push(interval) };
          return list;
      }, []);

      return new Alterations(alterations);
  }

  addModifier(intSymbol) {
      this.mod.push(intSymbol);
  }

}




class Chord {

    constructor(note, blueprint) {
      const bp = blueprint.copy();

      //If this.category !== "Edited", next nested chord category needs to be "Edited"

      this.blueprint = bp;
      this.root = Note.fromName(note);
      this.name = `${this.root.name} ${bp.name}`;
      this.sym = `${this.root.name}${bp.sym}`;
      this.category = bp.category;
      //this.notes = Chord.generateNotes(this.root, bp.intervals);
      this.notes = this.generateNotes();

      // Take a cloned activeAlterations object '{add:[],mod:[]}' from the blueprint
      //   where each list item is an interval symbol string
      this.activeAlterations = bp.activeAlterations.copy();

      // Take a cloned capabilities object '{add:[],mod:[]}' from the blueprint
      //   where each list item is an interval symbol string
      this.capabilities = bp.capabilities.copy();

      
       // Use blueprint.capabilities to generate an alteration object '{add:[],mod:[]}'
       //   where each list item is a chord object of one alteration step away from this chord

       this.alteredChords = this.generateAlterations();

     }



     generateNotes() {
         return [this.root].concat(this.blueprint.intervals.map(interval => this.root.plus(interval)));
     }

     generateAlterations() {
         return {
             mod: this.blueprint.capabilities.mod.map(interval => this.createMod(interval)),
             add: this.blueprint.capabilities.add.map(interval => this.createAdd(interval))
         };
     }



     // if mod, always accidental, so always check if modded note
     // needs to be removed from capabilities.mod and capabilities.add

     createMod(intSymbol) {
         const blueprint = this.blueprint.createModified(intSymbol).copy(); //the copy call might be unwarranted
         // TODO: how we handle 7#9->11#9 (pure extended tone add to an altered chord), look at this
         //       11#9 is already being generated and being set in its own pure Eleven chord, createMod chain
         //       so when we createMod and we are category "Eleven", or "Thirteen" AND the mod we are making is of the 9,11,or, 13 then KEEP OUR ORIGINAL CATEGORY
         //       To a similiar purpose, when we createMod("b5") we should retain our old designation

        /* const theseCategories = ["Eleven", "Thirteen"];

         if (theseCategories.includes(blueprint.category) && blueprint.hasunBrokenExtensionIntervalChain()) {
             // KEEP OUR CATEGORY
         } else if (intSymbol ==="b5") {  if we are flat-fiving a chord let it keep its category, its fundamentally the same category
             // this is redeundant for 11 and 13 chords, but needed for you know b5, sus4(b5) 7b5, 9b5, maj7b5, etc. still a triad, still a triad, still a 7, still a 9, still a maj7
             // KEEP OUR CATEGORY
         } else {
             blueprint.category = "Crafted";
         }
             
         */

    


         if (blueprint.category !== "Crafted") { blueprint.category = "Crafted";} //if it's Triad,Seven,Nine etc need to make sure its children are Crafted
         return new Chord(this.root.name, blueprint);
     }

     // NOTE with these two todos, this will make grabbing chords that are crafted "has mods or adds" not work. We arent doing this at all anyway.
            // but if we wanted to do that, this would require adding a secondary category field so that, for instance, E7#9 could have a category of "Nine"
            // and a secondCategory of "Crafted" instead. Everything generated with createMod or createOdd would automatically get this secondCategory "crafted"
            // not sure this would be desired but here is the means.

     createAdd(intSymbol) {
         const blueprint = this.blueprint.createAddedTone(intSymbol).copy(); //the copy call might be unwarranted
         // TODO: if we add a note that creates an unbroken chain, like #9 or b9 being added to something called "Seven", should get the "Nine" category
         //       b11 or #11 to "Nine" should be "Eleven"
         //       this means   7#9->7#9#11 would work flawlessly


         /* //put this where needed

        const theseCategories = ["Seven", "Nine", "Eleven", "Thirteen"];

        if (theseCategories.includes(blueprint.category) && blueprint.hasunBrokenExtensionIntervalChain()) {
            // mpre complicated than keeping our category, what category do we actually hit?
            // make sure intervals are sorted, get the last one, because since it's an unbroken chain that is our new category

            // const sortedIntervals = Interval.Notation.sortByChordInterval(blueprint.intervals);
            // const lastInterval = sortedIntervals[sortedIntervals-1];
            // const lastIntervalPurified = Interval.Notation.RemoveAccidentals(lastInterval);
            // blueprint.category = Interval.Notation.numberToText(lastIntervalPurified);
        } else {
            blueprint.category = "Crafted"; like 9#13 crafted. Eadd11 crafted. E7add11 crafted. E7#11 crafted
        }
         
         
         
         


         */
         
         if (blueprint.category !== "Crafted") { blueprint.category = "Crafted";} //if it's Triad,Seven,Nine etc need to make sure its children are Crafted
         return new Chord(this.root.name, blueprint);
     }


     toQuickJSON() {
         const intermed = {
             name: this.name,
             sym: this.sym,
             activeAlterations: this.activeAlterations,
             capabilities: this.capabilities,
             notes: this.notes
         };
         return JSON.stringify(intermed);
     }

}

// just for right now, let's avoid (add 6s) or (add 13s) but we'll want the extra names later (because 6 chords exist)
//  b6 is fine!

// TODO: There's no support for add b13/b6 chords
// TODO: Haven't even finished adding adds with accidentals. Major/Minor done.
// TODO: give 9s add b9/#9 maybe and 11s add b11/#11 and etc
const MAJOR_BLUEPRINTS = [{
    name: "Major",
    sym: "",
    intervals: ["3", "5"],
    category: "Triad",
    capabilities: {
        mod: ["b5"],
        add: ["9", "11", "b9", "#9", "#11", "b13"]
    }
},
{
    name: "Six",
    sym: "6",
    intervals: ["3", "5", "6"],
    category: "Six",
    capabilities: {
        mod: ["b5"],
        add: ["9", "11", "b9", "#9", "#11", "b13"]
    }
},
{
    name: "Seven",
    sym: "7",
    intervals: ["3", "5", "b7"],
    category: "Seven",
    capabilities: {
        mod: ["b5"],
        add: ["11", "13", "b9", "#9", "#11", "b13"],
    }
},
{
    name: "Nine",
    sym: "9",
    intervals: ["3", "5", "b7", "9"],
    category: "Nine",
    capabilities: {
        mod: ["b5"],
        add: ["13", "#11", "b13"]
    }
},
{
    name: "Eleven",
    sym: "11",
    intervals: ["3", "5", "b7", "9", "11"],
    category: "Eleven",
    capabilities: {
        mod: ["b5", "b9", "#9"],
        add: ["b13"]
    }
},
{
    name: "Thirteen",
    sym: "13",
    intervals: ["3", "5", "b7", "9", "11", "13"],
    category: "Thirteen",
    capabilities: {
        mod: ["b5", "b9", "#9", "#11"],
        add: []
    }
},
{
    name: "Major Seven",
    sym: "maj7",
    intervals: ["3", "5", "7"],
    category: "Seven",
    capabilities: {
        mod: ["b5"],
        add: ["11", "13", "b9", "#9", "#11", "b13"]
    }
},
{
    name: "Major Nine",
    sym: "maj9",
    intervals: ["3", "5", "7", "9"],
    category: "Nine",
    capabilities: {
        mod: ["b5"],
        add: ["13", "#11", "b13"]
    }
},
{
    name: "Major Eleven",
    sym: "maj11",
    intervals: ["3", "5", "7", "9", "11"],
    category: "Eleven",
    capabilities: {
        mod: ["b5", "b9", "#9"],
        add: ["b13"]
    }
},
{
    name: "Major Thirteen",
    sym: "maj13",
    intervals: ["3", "5", "7", "9", "11", "13"],
    category: "Thirteen",
    capabilities: {
        mod: ["b5", "b9", "#9", "#11"],
        add: [],
    }
}];
 
const MINOR_BLUEPRINTS = [{
    name: "Minor",
    sym: "m",
    intervals: ["b3", "5"],
    category: "Triad",
    capabilities: {
        mod: [],
        add: ["9", "11", "b9", "#11", "b13"],
    }
},
{
    name: "Minor Six",
    sym: "m6",
    intervals: ["b3", "5", "6"],
    category: "Six",
    capabilities: {
        mod: [],
        add: ["9", "11", "b9", "#11", "b13"]
    }
},
{
    name: "Minor Seven",
    sym: "m7",
    intervals: ["b3", "5", "b7"],
    category: "Seven",
    capabilities: {
        mod: [],
        add: ["11", "13", "b9", "#11", "b13"]
    }
},
{
    name: "Minor Nine",
    sym: "m9",
    intervals: ["b3", "5", "b7", "9"],
    category: "Nine",
    capabilities: {
        mod: [],
        add: ["13", "#11", "b13"]
    }
},
{
    name: "Minor Eleven",
    sym: "m11",
    intervals: ["b3", "5", "b7", "9", "11"],
    category: "Eleven",
    capabilities: {
        mod: ["b9"],
        add: ["b13"]
    }
},
{
    name: "Minor Thirteen",
    sym: "m13",
    intervals: ["b3", "5", "b7", "9", "11", "13"],
    category: "Thirteen",
    capabilities: {
        mod: ["b9", "b11", "#11"],
        add: []
    }
},
{
    name: "Minor Major Seven",
    sym: "m-maj7",
    intervals: ["b3", "5", "7"],
    category: "Seven",
    capabilities: {
        mod: [],
        add: ["11", "13", "b9", "#11", "b13"]
    }
},
{
    name: "Minor Major Nine",
    sym: "m-maj9",
    intervals: ["b3", "5", "7", "9"],
    category: "Nine",
    capabilities: {
        mod: [],
        add: ["13", "#11", "b13"]
    }
},
{
    name: "Minor Major Eleven",
    sym: "m-maj11",
    intervals: ["b3", "5", "7", "9", "11"],
    category: "Eleven",
    capabilities: {
        mod: ["b9"],
        add: ["b13"]
    }
},
{
    name: "Minor Major Thirteen",
    sym: "m-maj13",
    intervals: ["b3", "5", "7", "9", "11", "13"],
    category: "Thirteen",
    capabilities: {
        mod: ["b9", "b11", "#11"],
        add: []
    }
    }];
 
const SUSPENDED_BLUEPRINTS = [{
    name: "Suspended Two",
    sym: "sus2",
    intervals: ["2", "5"],
    category: "Triad",
    capabilities: {
        mod: ["b5"],
        add: ["11"],
    }
},
{
    name: "Six Suspended Two",
    sym: "6sus2",
    intervals: ["2", "5", "6"],
    category: "Six",
    capabilities: {
        mod: ["b5"],
        add: ["11"]
    }
},
{
    name: "Seven Suspended Two",
    sym: "7sus2",
    intervals: ["2", "5", "b7"],
    category: "Seven",
    capabilities: {
        mod: ["b5"],
        add: ["11", "13"]
    }
},
{
    name: "Nine Suspended Two",
    sym: "9sus2",
    intervals: ["2", "5", "b7", "9"],
    category: "Nine",
    capabilities: {
        mod: ["b5"],
        add: ["13"]
    }
},
{
    name: "Eleven Suspended Two",
    sym: "11sus2",
    intervals: ["2", "5", "b7", "9", "11"],
    category: "Eleven",
    capabilities: {
        mod: ["b5", "b9", "#9"],
        add: []
    }
},
{
    name: "Thirteen Suspended Two",
    sym: "13sus2",
    intervals: ["2", "5", "b7", "9", "11", "13"],
    category: "Thirteen",
    capabilities: {
        mod: ["b5", "b9", "#9", "b11", "#11"],
        add: []
    }
},
{
    name: "Major Seven Suspended Two",
    sym: "maj7sus2",
    intervals: ["2", "5", "7"],
    category: "Seven",
    capabilities: {
        mod: ["b5"],
        add: ["11", "13"]
    }
},
{
    name: "Major Nine Suspended Two",
    sym: "maj9sus2",
    intervals: ["2", "5", "7", "9"],
    category: "Nine",
    capabilities: {
        mod: ["b5"],
        add: ["13"]
    }
},
{
    name: "Major Eleven Suspended Two",
    sym: "maj11sus2",
    intervals: ["2", "5", "7", "9", "11"],
    category: "Eleven",
    capabilities: {
        mod: ["b5", "b9", "#9"],
        add: []
    }
},
{
    name: "Major Thirteen Suspended Two",
    sym: "maj13sus2",
    intervals: ["2", "5", "7", "9", "11", "13"],
    category: "Thirteen",
    capabilities: {
        mod: ["b9", "#9", "b11", "#11"],
        add: []
    }
},
{
    name: "Suspended Four",
    sym: "sus4",
    intervals: ["4", "5"],
    category: "Triad",
    capabilities: {
        mod: ["b5"],
        add: ["9"],
    }
},
{
    name: "Six Suspended Four",
    sym: "6sus4",
    intervals: ["4", "5", "6"],
    category: "Six",
    capabilities: {
        mod: ["b5"],
        add: ["9"]
    }
},
{
    name: "Minor Seven Suspended Four",
    sym: "7sus4",
    intervals: ["4", "5", "b7"],
    category: "Seven",
    capabilities: {
        mod: ["b5"],
        add: ["9", "13"]
    }
},
{
    name: "Nine Suspended Four",
    sym: "9sus4",
    intervals: ["4", "5", "b7", "9"],
    category: "Nine",
    capabilities: {
        mod: ["b5"],
        add: ["13"]
    }
},
{
    name: "Eleven Suspended Four",
    sym: "11sus4",
    intervals: ["4", "5", "b7", "9", "11"],
    category: "Eleven",
    capabilities: {
        mod: ["b5", "b9", "#9"],
        add: []
    }
},
{
    name: "Thirteen Suspended Four",
    sym: "13sus4",
    intervals: ["4", "5", "b7", "9", "11", "13"],
    category: "Thirteen",
    capabilities: {
        mod: ["b5", "b9", "#9", "b11", "#11"],
        add: []
    }
},
{
    name: "Major Seven Suspended Four",
    sym: "maj7sus4",
    intervals: ["4", "5", "7"],
    category: "Seven",
    capabilities: {
        mod: ["b5"],
        add: ["9", "13"]
    }
},
{
    name: "Major Nine Suspended Four",
    sym: "maj9sus4",
    intervals: ["4", "5", "7", "9"],
    category: "Nine",
    capabilities: {
        mod: ["b5"],
        add: ["13"]
    }
},
{
    name: "Major Eleven Suspended Four",
    sym: "maj11sus4",
    intervals: ["4", "5", "7", "9", "11"],
    category: "Eleven",
    capabilities: {
        mod: ["b9", "#9"],
        add: []
    }
},
{
    name: "Major Thirteen Suspended Four",
    sym: "maj13sus4",
    intervals: ["4", "5", "7", "9", "11", "13"],
    category: "Thirteen",
    capabilities: {
        mod: ["b5", "b9", "#9", "b11", "#11"],
        add: []
    }
}];
 
const DIMINISHED_BLUEPRINTS = [{
    name: "Diminished",
    sym: "dim",
    intervals: ["b3", "b5"],
    category: "Triad",
    capabilities: {
        mod: [],
        add: ["9", "11"],
    }
},
{
    name: "Diminished Seven",
    sym: "dim7",
    intervals: ["b3", "b5", "bb7"],
    category: "Seven",
    capabilities: {
        mod: [],
        add: ["11", "13"]
    }
},
{
    name: "Diminished Nine",
    sym: "dim9",
    intervals: ["b3", "b5", "bb7", "9"],
    category: "Nine",
    capabilities: {
        mod: [],
        add: ["13"]
    }
},
{
    name: "Diminished Eleven",
    sym: "dim11",
    intervals: ["b3", "b5", "bb7", "9", "11"],
    category: "Eleven",
    capabilities: {
        mod: ["b9"],
        add: []
    }
},
{
    name: "Diminished Thirteen",
    sym: "dim13",
    intervals: ["b3", "b5", "bb7", "9", "11", "13"],
    category: "Thirteen",
    capabilities: {
        mod: ["b9", "b11"],
        add: []
    }
},
{
    name: "Half-Diminished Seven",
    sym: "ø7",
    intervals: ["b3", "b5", "b7"],
    category: "Seven",
    capabilities: {
        mod: [],
        add: ["11", "13"]
    }
},
{
    name: "Half-Diminished Nine",
    sym: "ø9",
    intervals: ["b3", "b5", "b7", "9"],
    category: "Nine",
    capabilities: {
        mod: [],
        add: ["13"]
    }
},
{
    name: "Half-Diminished Eleven",
    sym: "ø11",
    intervals: ["b3", "b5", "b7", "9", "11"],
    category: "Eleven",
    capabilities: {
        mod: ["b9"],
        add: []
    }
},
{
    name: "Half-Diminished Thirteen",
    sym: "ø13",
    intervals: ["b3", "b5", "b7", "9", "11", "13"],
    category: "Thirteen",
    capabilities: {
        mod: ["b9", "b11",],
        add: []
    }
},
{
    name: "Diminished Major Seven",
    sym: "dim-maj7",
    intervals: ["b3", "b5", "7"],
    category: "Seven",
    capabilities: {
        mod: [],
        add: ["11", "13"]
    }
},
{
    name: "Diminished Major Nine",
    sym: "dim-maj9",
    intervals: ["b3", "b5", "7", "9"],
    category: "Nine",
    capabilities: {
        mod: [],
        add: ["13"]
    }
},
{
    name: "Diminished Major Eleven",
    sym: "dim-maj11",
    intervals: ["b3", "b5", "7", "9", "11"],
    category: "Eleven",
    capabilities: {
        mod: ["b9"],
        add: []
    }
},
{
    name: "Diminished Major Thirteen",
    sym: "dim-maj13",
    intervals: ["b3", "b5", "7", "9", "11", "13"],
    category: "Thirteen",
    capabilities: {
        mod: ["b9", "b11"],
        add: []
    }
}];
 
// TODO: maybe Blueprints() takes array and returns blueprint objects;
const AUGMENTED_BLUEPRINTS = [{
    name: "Augmented",
    sym: "aug",
    intervals: ["3", "#5"],
    category: "Triad",
    capabilities: {
        mod: [],
        add: ["9", "11"],
    }
},
{
    name: "Augmented Six",
    sym: "aug6",
    intervals: ["3", "#5", "6"],
    category: "Six",
    capabilities: {
        mod: [],
        add: ["9", "11"]
    }
},
{
    name: "Augmented Seven",
    sym: "aug7",
    intervals: ["3", "#5", "b7"],
    category: "Seven",
    capabilities: {
        mod: [],
        add: ["11", "13"]
    }
},
{
    name: "Augmented Nine",
    sym: "aug9",
    intervals: ["3", "#5", "b7", "9"],
    category: "Nine",
    capabilities: {
        mod: [],
        add: ["13"]
    }
},
{
    name: "Augmented Eleven",
    sym: "aug11",
    intervals: ["3", "#5", "b7", "9", "11"],
    category: "Eleven",
    capabilities: {
        mod: ["b9", "#9"],
        add: []
    }
},
{
    name: "Augmented Thirteen",
    sym: "aug13",
    intervals: ["3", "#5", "b7", "9", "11", "13"],
    category: "Thirteen",
    capabilities: {
        mod: ["b9", "#9", "b11", "#11"],
        add: []
    }
},
{
    name: "Augmented Major Seven",
    sym: "aug-maj7",
    intervals: ["3", "#5", "7"],
    category: "Seven",
    capabilities: {
        mod: [],
        add: ["11", "13"]
    }
},
{
    name: "Augmented Major Nine",
    sym: "aug-maj9",
    intervals: ["3", "#5", "7", "9"],
    category: "Nine",
    capabilities: {
        mod: [],
        add: ["13"]
    }
},
{
    name: "Augmented Major Eleven",
    sym: "aug-maj11",
    intervals: ["3", "#5", "7", "9", "11"],
    category: "Eleven",
    capabilities: {
        mod: ["b9", "#9"],
        add: []
    }
},
{
    name: "Augmented Major Thirteen",
    sym: "aug-maj13",
    intervals: ["3", "#5", "7", "9", "11", "13"],
    category: "Thirteen",
    capabilities: {
        mod: ["b9", "#9", "b11", "#11"],
        add: []
    }
}];

function chordsFromBlueprints(note, blueprints) {
    const bps = blueprints.map(bp => {
      bp.capabilities = new Capabilities(bp.capabilities);
      let b = new Blueprint(bp);
      return b;
    });
    return bps.map(blueprint => {
        return new Chord(note, blueprint);
    });
}

function allChordsFromBlueprints(blueprints) {
    const notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
    // TODO: let notes = Note.list.map(note => note.name);
    return notes.reduce((list, note) => {
        return list.concat(chordsFromBlueprints(note, blueprints));
    }, []);
}



function generateChords (){
    return allChordsFromBlueprints(MAJOR_BLUEPRINTS
        .concat(MINOR_BLUEPRINTS)
        .concat(SUSPENDED_BLUEPRINTS)
        .concat(DIMINISHED_BLUEPRINTS)
        .concat(AUGMENTED_BLUEPRINTS)
    );
}

module.exports.generateChords = generateChords;



/*
var fs = require('fs');

var stream = fs.createWriteStream("my_file.txt");
stream.once('open', function (fd) {
    chords.forEach(chord => stream.write(Chord.toQuickJSON(chord).concat(",\n\n")));
    stream.end();
});*/

////console.log("Generated Chord count across 12 chromatic root notes: " + chords.length);
// JavaScript source code
