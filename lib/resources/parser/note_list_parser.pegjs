Statements
  = head:note tail:(__ note)* {
      var result = [head];
      for (var i = 0; i < tail.length; i++) {
        result.push(tail[i][1]);
      }
      return result;
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

__ =  [ \t\r\n,]*
