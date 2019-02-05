const NUMBER_REG_EXP = "[1,2,3,4,5,6,7,8,9,10,11,12,13]+";
const ACCIDENTAL_REG_EXP = "[#,b]+";

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
    return Interval.list.find(item => item.name === name);
};

Interval.fromValue = function(value) {
    return Interval.list.find(item => item.value === value);
};

Interval.prototype.flat = function() {
    return this.minus("b2");
};

Interval.prototype.sharp = function() {
    return this.plus("b2");
};

Interval.prototype.getSum = function(value) {
  var sum = (value + this.value) % INTERVAL_COUNT;  
  return (sum >= 0) ? sum : (sum + INTERVAL_COUNT);
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
  var sum = value % INTERVAL_COUNT;
  return (sum >= 0) ? sum : (sum + INTERVAL_COUNT);
}

Interval.intervalStringToInterval = function(intervalString) {
  const accidentalString = intervalString.match(ACCIDENTAL_REG_EXP);
  const accidentalValue = accidentalString ? Interval.getAccidentalValue(accidentalString[0]) : 0;
  const referenceIntervalString = intervalString.match(NUMBER_REG_EXP)[0];
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

module.exports = Interval;