
"use strict";

const intervalParser = require('./resources/parser/interval_parser.js');

const intervalDigitRegExp = "[1,2,3,4,5,6,7,8,9,10,11,12,13]+";
const accidentalRegExp = "[#,b]+";
const names = [
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
const INTERVAL_COUNT = names.length;

function Interval(name, value) {
    this.name = name;
    this.value = value;
}

Object.defineProperty(Interval, "list", {
  value: (function generateReferenceIntervals() {
      return Object.freeze(names.map((str, value) => {
        return Object.freeze(new Interval(str, value));
      }));
  })(),
  writable: false
});

Interval.hasAccidental = function (notation) {
    //let accidental = name.match(accidentalRegExp) ? name.match(accidentalRegExp)[0] : "";

    return Boolean(notation.match(accidentalRegExp));
}

Interval.fromName = function(name) {
    let passedName = name;
    // allow for 9,11,13,etc by normalizing
    let passedDigit = name.match(intervalDigitRegExp)[0];
    let digit = passedDigit;
    digit = parseInt(digit) === 7 ? 7 : (parseInt(digit) % 7);
    let accidental = name.match(accidentalRegExp) ? name.match(accidentalRegExp)[0] : "";

    /* If anything is left it wasn't valid */
    let restOfString = name.replace(passedDigit, "");
    restOfString = restOfString.replace(accidental,"");
    if (restOfString) {throw new Error("Bad Interval Name: |" + restOfString+"|"+passedName)}

    name =  accidental + digit;
    let interval = Interval.list.find(function(item) {
      return item.name === name;
    });
    if(interval === undefined) {throw Error("Invalid name. Recieved: "+passedName+",Calced: "+name)}
    return interval;
}

Interval.fromValue = function(value) {
    let interval = Interval.list.find(function(item) {
      return item.value === value;
    });
    if(interval === undefined) {throw Error("Invalid name. Recieved: " + value)}
    return interval;
};

Interval.removeAccidentals = function(symbol) {
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

Interval.prototype.plus = function(intervalString) {
    const value = Interval.intervalStringToInterval(intervalString);
    const constructor = Object.getPrototypeOf(this).constructor;
    return constructor.fromValue(Interval.normalizeIntervalValue(this.value + value));
};
Interval.prototype.minus = function(intervalString) {
    const value = Interval.intervalStringToInterval(intervalString);
    const constructor = Object.getPrototypeOf(this).constructor;
    try {
        constructor.fromValue(Interval.normalizeIntervalValue(this.value - value))
    }catch {
        throw new Error(constructor.name);
    }
    return constructor.fromValue(Interval.normalizeIntervalValue(this.value - value));
};

// func("bb7") returns "Flat Flat Seven"
Interval.symbolToEnglish = function(str) {
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
  let numberEnglish = Interval.numberStringToEnglish(numberStr);

  return accidentalEnglish.concat(numberEnglish);
}

Interval.numberStringToEnglish = function(str) {
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
    default:
      throw new Error("something bad happened");
  }
};



Interval.getAccidentalValue = function(accidentalString) {
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

Interval.normalizeIntervalValue = function (value) {
  let sum = value % INTERVAL_COUNT;
  return (sum >= 0 ) ? sum : sum + INTERVAL_COUNT;
}

Interval.intervalStringToInterval = function(intervalString) {
  const accidentalString = intervalString.match(accidentalRegExp);
  const accidentalValue = accidentalString ? Interval.getAccidentalValue(accidentalString[0]) : 0;
  const referenceIntervalString = intervalString.match(intervalDigitRegExp)[0];
  if(referenceIntervalString === null) {throw new Error("Must include an Interval");}
  const referenceInterval = Interval.fromName(referenceIntervalString);

  return Interval.normalizeIntervalValue(referenceInterval.value + accidentalValue);
};

Interval.behavior = {
  flat: Interval.prototype.flat,
  sharp: Interval.prototype.sharp,
  minus: Interval.prototype.minus,
  plus: Interval.prototype.plus,
};

module.exports = Interval;