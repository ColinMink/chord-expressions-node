start = chord

chord = baseNote:baseNote quality:Quality mods:((List List) / List / ws) {
var obj = {};
obj.baseNote = baseNote;
obj.quality = quality;
var tempMods = {
  add: [],
  mod: []
};
if(!Array.isArray(mods)) {
  mods = [mods];
}
for( var i =0; i < mods.length; i++){
  console.log(mods[i].indexOf("add"));
if(mods[i].indexOf("add") >= 0) {
  tempMods.add = mods[i].substring(3).trim().split(',');
} else {
  tempMods.mod = mods[i].split(',');
}
}
obj.mods = tempMods;
return obj;
}

baseNote = $(note (accidental * / ws)) / ws{
 return "C";
}

note = [A-G]

accidental = char:("b" / "#")

Quality = arr:(Extension ("sus2" / "sus4")) {return {"triad": arr[1],"extension": arr[0]};} /
 arr:(Extension (!("sus2" / "sus4"))) {return {"triad": "major","extension": arr[0]};} /
arr:(triad Extension) {return {"triad": arr[0],"extension": arr[1]};} / 
arr:(weirdTriad weirdExtension){return {"triad": arr[0],"extension": arr[1].replace('-','')};} / 
arr:(!weirdTriad(triad Extension)) {return {"triad": arr[0],"extension": arr[1]};} /  
tri:triad {return {"triad":tri}}

Extension = "maj7" / "maj9" / "maj11" / "maj13" / "6" / "7" / "9" / "11" / "13"
weirdExtension = "-maj7" / "-maj9" / "-maj11" / "-maj13" / "6" / "7" / "9" / "11" / "13"
triadWrapper = ("M") {return "major";}/("min"/"m"/"-"){return "m";} / ("+"/ "aug"){return "+";} / ("dim" / "o" / "°"){return "dim";} / ("ø" / "Ø") {return "ø";}/ "sus2" / "sus4" / "lyd" / "phryg" 
triad = (! triadWrapper {return "major"} / triadWrapper )

weirdTriad = 'm'/ "dim"

List = "(" expr:( Add / Mod )")" {return expr;}

Add = $("add" " "* ( ( ("b" / "#" )* ([1-9] [0-3] / [1-9]) ) "," / ( ("b" / "#" )* ([1-9] [0-3] / [1-9]) ))+)
Mod = $((IntervalMod "," / IntervalMod)+)

IntervalMod = ( ("b" / "#") ([1-9] [0-3] / [1-9]) )

Integer "integer"
  = ws [0-9]+ { return parseInt(text(), 10); }

ws "whitespace"
  = [\t\n\r]*