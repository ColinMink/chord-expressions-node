const peg = require('pegjs');
const fs = require('fs');
var grammar;
// goal 11;

try {  
  grammar = fs.readFileSync('./grammar.txt', 'utf8'); 
} catch(e) {
    console.log('Error:', e.stack);
}
const Parser = peg.generate(grammar);
module.exports = Parser;