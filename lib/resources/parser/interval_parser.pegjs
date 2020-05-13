start = acc:accidentals digit:digit {
return {
"accidentals":acc,
"digit": digit
}
}


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

digit = "2" / "3" / "4" / "5" / "6" / "7" / "8" / "9" / "10" / "11" / "12" / "13"

