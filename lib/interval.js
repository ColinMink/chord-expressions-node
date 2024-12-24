
"use strict";



//TODO: I shouldn't have to address internally as Interval.List, it should just be List, Notification, etc,
//      Interval.Notification et al is for the outside interface. It all relates to Interval in here.


const intervalParser = require('./resources/parser/interval_parser.js');

const intervalDigitRegExp = "[1,2,3,4,5,6,7,8,9,10,11,12,13]+";
const accidentalRegExp = "[#,b]+";
const intervalNames = [
    "1",
    "b2",
    "2",
    "b3",
    "3",
    "4",
    "#4",
    "5",
    "b6",
    "6",
    "b7",
    "7"
];

const chordIntervalList = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "7",
  "9",
  "11",
  "13"
];
const INTERVAL_COUNT = intervalNames.length;

function Interval(name, value) {
    this.name = name;
    this.value = value;

}

// TODO: Intervalproto

Interval.List = {}; // Manipulations of Interval lists, maybe TODO
Interval.Notation = {}; // Specific to notation
Interval.Notation.Accidental = {}; //Accidentals
Interval.Notation.List = {}; // Manipulations of notation lists
Interval.Value = {};

//TODO: merge List and list someday
Object.defineProperty(Interval, "list", {
  value: (function generateReferenceIntervals() {
      return Object.freeze(intervalNames.map((str, value) => {
        return Object.freeze(new Interval(str, value));
      }));
  })(),
  writable: false
});

Interval.Notation.hasAccidental = function (notation) {
    return Boolean(notation.match(accidentalRegExp));
}

Interval.fromNotation = function(notation) {
    let passedNotation = notation;
    // allow for 9,11,13,etc by normalizing
    let passedDigit = notation.match(intervalDigitRegExp)[0];
    let digit = parseInt(passedDigit) === 7 ? 7 : (parseInt(passedDigit) % 7);
    let accidental = notation.match(accidentalRegExp) ? notation.match(accidentalRegExp)[0] : "";

    /* If anything is left it wasn't valid */
    let remaining = notation.replace(passedDigit, "").replace(accidental,"");
    if (remaining) {throw new Error("Bad Interval Name: |" + remaining + "|" + passedNotation)}

    notation =  accidental + digit;
    let interval = Interval.list.find(function(item) {
      return item.name === notation;
    });
    if(interval === undefined) {throw Error("Invalid name. Recieved: "+passedNotation+",Calced: "+notation)}
    return interval;
}

Interval.fromValue = function(value) {
    let interval = Interval.list.find(function(item) {
      return item.value === value;
    });
    if(interval === undefined) {throw Error("Invalid name. Recieved: " + value)}
    return interval;
};

Interval.Notation.removeAccidentals = function(symbol) {
  let passedDigit = symbol.match(intervalDigitRegExp)[0];
  return passedDigit;
};

Interval.prototype.flat = function() {
    return this.minus("b2");
};

Interval.prototype.sharp = function() {
    return this.plus("b2");
};

Interval.prototype.getSum = function(value) {
  let sum = (value + this.value) % INTERVAL_COUNT;
  return (sum >= 0) ? sum : sum + INTERVAL_COUNT;
};

Interval.prototype.plus = function(notation) {
    const value = Interval.Notation.getValue(notation);
    const constructor = Object.getPrototypeOf(this).constructor;
    return constructor.fromValue(Interval.Value.normalize(this.value + value));
};
Interval.prototype.minus = function(notation) {
    const value = Interval.Notation.getValue(notation);
    const constructor = Object.getPrototypeOf(this).constructor;
    try {
        constructor.fromValue(Interval.Value.normalize(this.value - value))
    }catch {
      // wth is this! just dont break!
        throw new Error(constructor.name);
    }
    return constructor.fromValue(Interval.Value.normalize(this.value - value));
};

// func("bb7") returns "Flat Flat Seven"
Interval.Notation.toText = function(str) {
  let accidental = str.match(accidentalRegExp) ? str.match(accidentalRegExp)[0] : "";
  let accidentalEnglish = (() =>{
      let string = "";
    for(let i = 0; i < accidental.length; i++){
      let char = accidental[i];

      switch(char) {
        case "#":
          string = string.concat("Sharp ");
          break;
        case "b":
          string = string.concat("Flat ");
          break;
        default:
          throw new Error("No something bad happened");
      }
    }
    return string;
  })();

  let numberStr = str.match(intervalDigitRegExp)[0];
  let numberEnglish = Interval.Notation.numberToText(numberStr);

  return accidentalEnglish.concat(numberEnglish);
}

Interval.Notation.numberToText = function(str) {
  //TODO: add support for integers rather than only text
  switch(str) {
    case "1":
      return "One";
    case "2":
      return "Two";
    case "3":
      return "Three";
    case "4":
      return "Four";
    case "5":
      return "Five";
    case "6":
      return "Six";
    case "7":
      return "Seven";
    case "8":
      return "Eight";
    case "9":
      return "Nine";
    case "10":
      return "Ten";
    case "11":
      return "Eleven";
    case "12":
      return "Twelve";
    case "13":
      return "Thirteen";
    case "15":
      return "Thirteen";
    default:
      throw new Error("something bad happened");
  }
};

Interval.Notation.Accidental.getValue = function(accidentalString) {
    //TODO: Make sure is empty string or accidental
    let count = 0;
    for (let char of accidentalString) {
        if (char === "#") {
            count++;
            continue;
        } else if (char === "b") {
            count--;
            continue;
        }
        throw new TypeError("accidentalString must only have # and b characters");
    }
    return count;
};

Interval.Value.normalize = function (value) {
  let sum = value % INTERVAL_COUNT;
  return (sum >= 0) ? sum : sum + INTERVAL_COUNT;
}

Interval.Notation.getValue = function(notation) {
  const accidentalStr = notation.match(accidentalRegExp);
  const accidentalVal = accidentalStr ? Interval.Notation.Accidental.getValue(accidentalStr[0]) : 0;
  const referenceNotation = notation.match(intervalDigitRegExp)[0];
  if(referenceNotation === null) {throw new Error("Must include an Interval");}
  const referenceInterval = Interval.fromNotation(referenceNotation);

  return Interval.Value.normalize(referenceInterval.value + accidentalVal);
};

Interval.Notation.List.removeValue = function(list, notation) {
    //TODO: also allow integer to be passed in rather than just string?
    //TODO: also allow Interval objects to be passed?
    let passedValue = Interval.Notation.getValue(notation);

    return list.reduce((collection, sym) => {
        let checkValue = Interval.Notation.getValue(sym);
        if (checkValue !== passedValue) { collection.push(sym);}
        return collection;
    }, []);

};

// intervalList: Array of intervals in symbol form (String)
// interval: MUST be interval with mod, NOT pure, is a sysmbol (String) TODO: enforce
// Returns: Boolean
Interval.Notation.List.hasPureInterval = function(intervalList, notation, opts = {restrictOctave: false}) {
  if (!opts.restrictOctave) {
      let passedValue = Interval.Notation.getValue(Interval.Notation.removeAccidentals(notation));

      return Boolean(intervalList.find(sym => {
          let checkValue = Interval.Notation.getValue(Interval.Notation.removeAccidentals(sym));
          return checkValue === passedValue;
      }));

  } else if (opts.restrictOctave) {
    let passedValue = Interval.Notation.removeAccidentals(notation);
      return Boolean(intervalList.find(sym => {
          let checkValue = Interval.Notation.removeAccidentals(sym);
          return checkValue === passedValue;
      }));
  }
    throw new Error("Something went wrong");
};

// ["b7", "b9"] returns false
// ["b7", "9"] returns true
Interval.Notation.List.hasAnyPureInterval = function(list) {
      return Boolean(list.find(notation => {
          let remaining = Interval.Notation.removeAccidentals(notation);
          // empty string means this was pure, non-empty means it wasn't
          return !Boolean(remaining);
      }));
};

// intervals: list of string symbols
// interval: a string symbol with an accidental (one hopes)
// todo: this function is octave specific. b2 wouldn't knock a pure 9 out of the way or vice versa etc
// is that GOOD behavior?. That might be what we want!!!!
Interval.Notation.List.modify = function (intervals, interval) {
    let pureInterval = Interval.Notation.removeAccidentals(interval);
    return intervals.map(reference => {
        return (reference === pureInterval) ? interval  : reference;
    });
}

Interval.Notation.List.sortByChordInterval = function(list) {
  return list.sort((a, b) => {
    //console.log(`[${[a, b]}]`);
    let aValue = Interval.Notation.toChordIntervalValue(a);
    let bValue = Interval.Notation.toChordIntervalValue(b);
    return aValue - bValue;
  });
};

Interval.Notation.toChordIntervalValue = function(intervalString){
    const interval = Interval.Notation.removeAccidentals(intervalString);
    return chordIntervalList[interval];
};


// Answers: does this.intervals (like ["b3", "b5", "7", "9", "#11"]) contain an unbroken sequence of 7->9->11->13, partial or complete, when sorted
// Note, possible TODO: this will FAIL if there are multiples, like Em9(add #9) would not be recognized as a 9 chord. I think that's what we want. That should be a crafted chord.
// yeah, it's working how we want. We do NOT want Em9#9 to get pulled in a Nine chord query! Em9, sure. Em7#9, absolutely.
Interval.Notation.hasUnbrokenExtensionIntervalChain = function hasUnbrokenExtensionIntervalChain(intervalStrList) {
  const sortedIntervals = Interval.Notation.List.sortByChordInterval(intervalStrList);

  // TODO maybe, if we want something like Emaj7sus4(Add Nine, Add Thirteen), and equivalent for sus2, 
  // check if we have "2"->"5" or "4"->"5" intervals to count sus4 7->9->13 and sus2 7-11->13 as unbroken chain
  // that whole sus2/sus4 extension situation is open question I will have to work through. I don't know the answer to question
  // "What is best for user experience?" without thinking heavily about all the possibilities here

  let chaining = false;
  let lastInterval;

  for (let i = 0; i < sortedIntervals.length; i++) { 
       const interval = sortedIntervals[i];
       const thisInterval = Interval.Notation.removeAccidentals(interval);
      let thisValueIsChained;

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

Interval.Notation.List.getTriadName = function getTriadName(intervalStrList){
  if (intervalStrList.length < 2) {return undefined;} // triad needs 3 notes, meaning 2 intervals ("1" doesnt apply because redundant)

  // I think this is pretty slick
  const triadDict = {
    "3,5": "Major",
    "b3,5": "Minor",
    "3,#5": "Augmented",
    "b3,b5": "Diminished",
    "2,5": "Suspended Two",
    "4,5": "Suspended Four",
    "3,b5": "Flat Five",
    "2,b5": "Suspended Two Flat Five",
    "4,b5": "Suspended Four Flat Five",
  };

  const sortedIntervals = Interval.Notation.List.sortByChordInterval(intervalStrList);

  // just first two notes can tell us
  const triadName = triadDict[`${sortedIntervals[0]},${sortedIntervals[1]}`];

  return triadName;
}














Interval.behavior = {
  flat: Interval.prototype.flat,
  sharp: Interval.prototype.sharp,
  minus: Interval.prototype.minus,                                           
  plus: Interval.prototype.plus,
};

module.exports = Interval;






///////////////// 10/20/20
