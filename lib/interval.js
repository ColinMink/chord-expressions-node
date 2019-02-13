'use strict';

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
const intervalCount = names.length;

function Interval(name) {
    this.name = name;
    Interval.list.push(this);
    this.value = Interval.list.indexOf(this);
}

Object.defineProperty(Interval, "list", {
  value: [],
  writable: false
});

Interval.fromName = function(name) {
    let passedName = name;
    // allow for 9,11,13,etc by normalizing
    let passedDigit = name.match(intervalDigitRegExp)[0];
    let digit = passedDigit;
    console.log("digit",digit);
    digit = parseInt(digit) === 7 ? 7 : (digit % 7);
    console.log("ndigit",digit);
    console.log("Passed:",name);
    // reconstruct name
    let accidental = name.match(accidentalRegExp) ? name.match(accidentalRegExp)[0] : "";
    
    /* If anything is left it wasn't valid */
    let restOfString = name.replace(passedDigit, "");
    restOfString = restOfString.replace(accidental,"");
    if (restOfString) {throw new Error("Bad Interval Name: |" + restOfString+"|"+passedName)}

    name =  accidental + digit;
    console.log("Calculated:",name);
    let interval = Interval.list.find(function(item) {
      return item.name === name;
    });
    if(interval === undefined) {throw Error("Invalid name. Recieved: "+passedName+",Calced: "+name)}
    console.log("done");
    return interval;
    }

Interval.fromValue = function(value) {
    let interval = Interval.list.find(function(item) {
      return item.value === value;
    });
    if(interval === undefined) {throw Error("Invalid name. Recieved: " + value)}
    return interval;
};

Interval.prototype.flat = function() {
    return this.minus("b2");
};

Interval.prototype.sharp = function() {
    return this.plus("b2");
};

Interval.prototype.getSum = function(value) {
  var sum = (value + this.value) % intervalCount;
  if (sum >= 0) {
    return sum;
  } else {
    return sum + intervalCount;
  }
};

Interval.prototype.plus = function(intervalString) {
    const value = Interval.intervalStringToInterval(intervalString);
    const constructor = Object.getPrototypeOf(this).constructor;
    return constructor.fromValue(Interval.normalizeIntervalValue(this.value + value));
};

Interval.prototype.minus = function(intervalString) {
    const value = Interval.intervalStringToInterval(intervalString);
    const constructor = Object.getPrototypeOf(this).constructor;
    return constructor.fromValue(Interval.normalizeIntervalValue(this.value - value));
};

Interval.getAccidentalValue = function(accidentalString) {
    var count = 0;
    for (i in accidentalString) {
        var char = accidentalString[i];

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
  var sum = value % intervalCount;
  if(sum >= 0 ) {return sum;}
  else {return sum + intervalCount; }
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

(function buildIntervals() {
    names.forEach(function(str) {
        Interval[str] = new Interval(str);
    });
    Object.freeze(Interval.list);
})();

exports.interval = Interval;