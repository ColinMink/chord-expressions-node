const  Parser = require('../../index.js').Parser;
const Note = require('../../lib/note');

describe("Parser suite",function(){
    it("Parse simple note list", function(){
        const notes = [Note.fromName("E"),Note.fromName("A"),Note.fromName("D"),Note.fromName("G"),Note.fromName("B"),Note.fromName("E")];
        expect(Parser.NoteListParse("EADGBE")).toEqual(notes);
    });
});