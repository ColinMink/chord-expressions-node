﻿// Chord Grammar
// ==========================
//
// [Note] + [Quality] + [adds with accidentals] + [(mod list)] + [('add' list)] + ['/' [slash note]]

start = start:(i:chord " "* "|" " "* {return i;})* last:chord {return start.concat(last)}
 
chord = note:note quality:quality accAdd: accAdd modList:modList addList:addList slashNote:slashNote
{
  return {
    
  "note": note,
  "quality":quality,
  "modList": accAdd.concat(modList),
  "addList": addList,
  "slashNote": slashNote
  }
}
 
 
 
 
note = root:rootNote acc:accidentals{return root + acc}
rootNote = [A-G]
accidentals = acc:(('b'+) / ('#'+) / !('b'/'#'))
{
  if(acc === undefined)
  {
    return ""
  }
  else {
    return acc.join("");
  }
}
 
 
quality =
extension:extension triad:("sus2"/"sus4"){
return {
"triad":{
    "symbol":triad,
    "value":triad,
},
"extension": extension
}
} /
triad:("dim" {
  return {
    "symbol":"dim",
    "value":"dim",
  }
}/ "aug" {
  return {
    "symbol":"aug",
    "value":"aug",
  }
}/

 "m" {
  return {
    "symbol":"m",
    "value":"minor",
  }
}
)
symbol:("-maj7" / "-maj9" / "-maj11" / "-maj13") {
return {
   "triad": triad,
    "extension": {
      "symbol":symbol,
      "value":symbol.substr(1),
      } 
}
}
/
triad:triad
extension:extension{
return {
"triad":triad ? triad : {
    "symbol":"",
    "value":"major",
  },
"extension":extension
}
}
 
triad =
 
(&"ø") {
  return {
    "symbol":"ø",
    "value":"dim",
  }
} /
(&"dom") {
  return {
    "symbol":"dom",
    "value":"major",
  }
}/ (&"dim") {
  return {
    "symbol":"dim",
    "value":"dim",
  }
}/
(&"maj") {
  return {
    "symbol":"maj",
    "value":"major",
  }
}/
("m"{
  return {
    "symbol":"m",
    "value":"minor",
  }
}/
symbol:("aug" / "+") {
  return {
    "symbol":symbol,
    "value":"aug",
  }
} /
"sus2" {
  return {
    "symbol":"sus2",
    "value":"sus2",
  }
} /
"sus4" {
  return {
    "symbol":"sus4",
    "value":"sus4",
  }
} /
"lyd" {
  return {
    "symbol":"lyd",
    "value":"lyd",
  }
} /
"phryg" {
  return {
    "symbol":"phryg",
    "value":"phryg",
  }
}) ?
 
extension =
("6" {
  return {
    "symbol":"6",
    "value":"6",
  }
} /  
"ø" digit:extensionDigits{
  return {
    "symbol":digit,
    "value":digit,
  }
}
/
"ø" !extensionDigits {
  return {
    "symbol":"",
    "value":"7",
  }
} /
"dom" digit:extensionDigits{
  return {
    "symbol":digit,
    "value":digit,
  }
}  /
"dom" !extensionDigits {
  return {
    "symbol":"",
    "value":"7",
  }
}/ "dim" digit:extensionDigits{
  return {
    "symbol":digit,
    "value": "dim" + digit,
  }
}  /
"dim" extensionSymbol:extensionSymbol extensionDigits:extensionDigits{
  return {
    "symbol":(extensionSymbol? extensionSymbol : "" ) + extensionDigits,
    "value":(extensionSymbol? extensionSymbol : ""  )  + extensionDigits,
  }
}
/
"dim" !extensionDigits {
  return {
    "symbol":"",
    "value":"",
  }
}/
"Δ" digit:extensionDigits{
  return {
    "symbol":"Δ" + digit,
    "value":"maj" + digit,
  }
}/
"Δ" !extensionDigits {
  return {
    "symbol":"Δ",
    "value":"maj7",
  }
} /
extensionSymbol:extensionSymbol ? extensionDigits:extensionDigits {
  return {
    "symbol":(extensionSymbol? extensionSymbol : "" ) + extensionDigits,
    "value":(extensionSymbol? extensionSymbol : ""  )  + extensionDigits,
  }
})
/ ws
 
 
extensionDigits = ("7" / "9" / "11" / "13")
extensionSymbol = ("-maj" / "maj"  / "M" / "-M") {return "maj"}

requiredAccidentals = acc:(('b'+) / ('#'+))
{
    return acc.join("");
}

optionalAccidentals = acc:(('b'+) / ('#'+) / "")
{
  if(acc === "")
  {
    return ""
  }
  else {
    return acc.join("");
  }
}

interval = ("2" / "3" / "4" / "5" / "6" / "7" / "8" / "9" / "10" / "11" / "12" / "13")

modInterval = head:requiredAccidentals tail:interval{
return head + tail;
}
addInterval = head:optionalAccidentals tail:interval{
return head + tail;
}

accAdd = addInterval* / ws

modList = "(" " "* start:(i:modInterval " "* "," " "* {return i;})* last:modInterval ")"{return start.concat(last)} / ws

addList = "(" " "* "add" " "* start:(i:addInterval " "* "," " "* {return i;})* last:addInterval ")"{return start.concat(last)} / ws
ws  = [\t\n\r]*

slashNote = "/" note:note{return note;} / ws