const Parser = require('./resources/parser/note_list_parser.js');
const Note = require('./note');

function NoteListParse(str) {
    let noteArr = Parser.parse(str);
    let results = [];
    noteArr.forEach(element => {
        results.push(new Note.fromName(element));
    });
    return results;
}


module.exports = { NoteListParse }