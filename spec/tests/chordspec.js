const path = require('path');
const chord = require(path.resolve(__dirname,'../../lib/resources/chord.js'));
/*
it("",function(){

});
*/
describe("Chord suite",function(){
    it("Recognizes basic triads",function(){
        let ch = chord.chordFromNotation("D");
        expect(ch.quality.triad).toBe("major");
        
        ch = chord.chordFromNotation("Dm");
        expect(ch.quality.triad).toBe("m");
        
        ch = chord.chordFromNotation("D+");
        expect(ch.quality.triad).toBe("+");
        
        ch = chord.chordFromNotation("Ddim");
        expect(ch.quality.triad).toBe("dim");
        
        ch = chord.chordFromNotation("Dlyd");
        expect(ch.quality.triad).toBe("lyd");
        
        ch = chord.chordFromNotation("Dphryg");
        expect(ch.quality.triad).toBe("phryg");
        
        ch = chord.chordFromNotation("Dsus2");
        expect(ch.quality.triad).toBe("sus2");
        
        ch = chord.chordFromNotation("Dsus4");
        console.log(ch);
        expect(ch.quality.triad).toBe("sus4");
        
        ch = chord.chordFromNotation("D#m");
        expect(ch.quality.triad).toBe("m");
    });
    
    it("Note Supports zero or more accidentals",function(){
        let ch = chord.chordFromNotation("D###m");
        expect(ch.rootNote.name).toBe("F");
        
        ch = chord.chordFromNotation("Dbbbm");
        expect(ch.rootNote.name).toBe("B");
    });
    
    it("Recognizes triad extensions",function(){
        let ch = chord.chordFromNotation("D6");
        expect(ch.quality.triad).toBe("major");
        expect(ch.quality.extension).toBe("6");
        
        ch = chord.chordFromNotation("Dmaj13");
        expect(ch.quality.triad).toBe("major");
        expect(ch.quality.extension).toBe("maj13");
        
        ch = chord.chordFromNotation("Dm6");
        expect(ch.quality.extension).toBe("6");
        expect(ch.quality.triad).toBe("m");
        
        ch = chord.chordFromNotation("Dm-maj7");
        expect(ch.quality.extension).toBe("maj7");
        expect(ch.quality.triad).toBe("m");
        
        ch = chord.chordFromNotation("D#dim-maj11");
        expect(ch.quality.extension).toBe("maj11");
        expect(ch.quality.triad).toBe("dim");
        
        ch = chord.chordFromNotation("D+7");
        expect(ch.quality.extension).toBe("7");
        expect(ch.quality.triad).toBe("+");
        
        ch = chord.chordFromNotation("D+6");
        expect(ch.quality.extension).toBe("6");
        expect(ch.quality.triad).toBe("+");
        
        ch = chord.chordFromNotation("Dmaj7");
        expect(ch.quality.extension).toBe("maj7");
        expect(ch.quality.triad).toBe("+");
        
        ch = chord.chordFromNotation("Ddim9");
        expect(ch.quality.extension).toBe("9");
        expect(ch.quality.triad).toBe("dim");
        
        ch = chord.chordFromNotation("Dmaj11sus2");
        expect(ch.quality.extension).toBe("maj11");
        expect(ch.quality.triad).toBe("sus2");
        
        
    });
    
});