const chord = require('../../index.js').Chord;
console.log(chord);
/*
it("",function(){

});
*/
describe("Chord suite",function(){

    it("Recognizes basic triads",function(){

        let ch = chord.chordFromNotation("D");
        expect(ch.quality.triad.value).toBe("major");

        ch = chord.chordFromNotation("Em");
        expect(ch.quality.triad.value).toBe("minor");

        ch = chord.chordFromNotation("D#+");
        expect(ch.quality.triad.value).toBe("aug");

        ch = chord.chordFromNotation("Abdim");
        expect(ch.quality.triad.value).toBe("dim");

        ch = chord.chordFromNotation("Dlyd");
        expect(ch.quality.triad.value).toBe("lyd");

        ch = chord.chordFromNotation("Dphryg");
        expect(ch.quality.triad.value).toBe("phryg");

        ch = chord.chordFromNotation("Dsus2");
        expect(ch.quality.triad.value).toBe("sus2");

        ch = chord.chordFromNotation("Dsus4");
        expect(ch.quality.triad.value).toBe("sus4");

        ch = chord.chordFromNotation("D#m");
        expect(ch.quality.triad.value).toBe("minor");
    });

    
    it("Recognizes the root note", function(){

        let ch = chord.chordFromNotation("D");
        expect(ch.rootNote.name).toBe("D");

        ch = chord.chordFromNotation("Em");
        expect(ch.rootNote.name).toBe("E");

        ch = chord.chordFromNotation("F#maj7");
        expect(ch.rootNote.name).toBe("F#");
    });

    it("Note Supports zero or more accidentals",function(){

        let ch = chord.chordFromNotation("D###m");
        expect(ch.rootNote.name).toBe("F");

        ch = chord.chordFromNotation("Dbbbm");
        expect(ch.rootNote.name).toBe("B");
    });

    it("Recognizes triad extensions",function(){

        let ch = chord.chordFromNotation("D6");
        expect(ch.quality.triad.value).toBe("major");
        expect(ch.quality.extension.value).toBe("6");

        ch = chord.chordFromNotation("Dmaj13");
        expect(ch.quality.triad.value).toBe("major");
        expect(ch.quality.extension.value).toBe("maj13");

        // M(n) is valid replacement for maj(n)
        ch = chord.chordFromNotation("DM13");
        expect(ch.quality.triad.value).toBe("major");
        expect(ch.quality.extension.value).toBe("maj13");

        // dash in -M(n) is optional compared to required -maj(n)
        ch = chord.chordFromNotation("DdimM13");
        expect(ch.quality.triad.value).toBe("dim");
        expect(ch.quality.extension.value).toBe("maj13");

        // dash in -M(n) is optional compared to required -maj(n)
        ch = chord.chordFromNotation("Ddim-M13");
        expect(ch.quality.triad.value).toBe("dim");
        expect(ch.quality.extension.value).toBe("maj13");

        // dash in -M(n) is optional compared to required -maj(n)
        ch = chord.chordFromNotation("Dm-M13");
        expect(ch.quality.triad.value).toBe("minor");
        expect(ch.quality.extension.value).toBe("maj13");

        // dash in -M(n) is optional compared to required -maj(n)
        ch = chord.chordFromNotation("DmM9");
        expect(ch.quality.triad.value).toBe("minor");
        expect(ch.quality.extension.value).toBe("maj9");

        // dash in -M(n) is optional compared to required -maj(n)
        ch = chord.chordFromNotation("DaugM11");
        expect(ch.quality.triad.value).toBe("aug");
        expect(ch.quality.extension.value).toBe("maj11");

        // dash in -M(n) is optional compared to required -maj(n)
        ch = chord.chordFromNotation("Daug-M11");
        expect(ch.quality.triad.value).toBe("aug");
        expect(ch.quality.extension.value).toBe("maj11");

        ch = chord.chordFromNotation("Dm-maj7");
        expect(ch.quality.extension.value).toBe("maj7");
        expect(ch.quality.triad.value).toBe("minor");

        ch = chord.chordFromNotation("Dm6");
        expect(ch.quality.extension.value).toBe("6");
        expect(ch.quality.triad.value).toBe("minor");

        ch = chord.chordFromNotation("D#dim-maj11");
        expect(ch.quality.extension.value).toBe("maj11");
        expect(ch.quality.triad.value).toBe("dim");

        ch = chord.chordFromNotation("D+7");
        expect(ch.quality.extension.value).toBe("7");
        expect(ch.quality.triad.value).toBe("aug");

        // also accepts aug
        ch = chord.chordFromNotation("Daug7");
        expect(ch.quality.extension.value).toBe("7");
        expect(ch.quality.triad.value).toBe("aug");

        // dash is required between aug and maj(n)
        ch = chord.chordFromNotation("Daug-maj7");
        expect(ch.quality.extension.value).toBe("maj7");
        expect(ch.quality.triad.value).toBe("aug");

        ch = chord.chordFromNotation("D+6");
        expect(ch.quality.extension.value).toBe("6");
        expect(ch.quality.triad.value).toBe("aug");

        ch = chord.chordFromNotation("Dmaj7");
        expect(ch.quality.extension.value).toBe("maj7");
        expect(ch.quality.triad.value).toBe("major");

        ch = chord.chordFromNotation("Ddim9");
        expect(ch.quality.extension.value).toBe("dim9");
        expect(ch.quality.triad.value).toBe("dim");

        ch = chord.chordFromNotation("Dmaj11sus2");
        expect(ch.quality.extension.value).toBe("maj11");
        expect(ch.quality.triad.value).toBe("sus2");

        // dim Seven 1,b3,b5,bb7
        ch = chord.chordFromNotation("Ddim7");
        expect(ch.quality.extension.value).toBe("dim7");
        expect(ch.quality.triad.value).toBe("dim");

        // dim Seven 1,b3,b5,bb7
        ch = chord.chordFromNotation("Ddim7");
        expect(ch.quality.extension.value).toBe("dim7"); // dim7 tells us the EXTENDED 7 is diminished
        expect(ch.quality.triad.value).toBe("dim");

        // dim Seven 1,b3,b5,bb7 + extension
        ch = chord.chordFromNotation("Ddim9");
        expect(ch.quality.extension.value).toBe("dim9"); // dim9 tells us the 7 in the EXTENDED 9 is diminished
        expect(ch.quality.triad.value).toBe("dim");

        // Half diminished Seven 1,b3,b5,b7
        ch = chord.chordFromNotation("Dø7");
        expect(ch.quality.extension.value).toBe("7");  // 7 tells us this 7 is dominant (b7)
        expect(ch.quality.triad.value).toBe("dim");

        // Half diminished Seven 1,b3,b5,b7 + extension
        ch = chord.chordFromNotation("Dø9");
        expect(ch.quality.extension.value).toBe("9");  // 9 tells us this 7 is dominant (b7)
        expect(ch.quality.triad.value).toBe("dim");

        // Half diminished Seven 1,b3,b5,b7 + extension
        ch = chord.chordFromNotation("Dø11");
        expect(ch.quality.extension.value).toBe("11");  // 11 tells us this 7 is dominant (b7)
        expect(ch.quality.triad.value).toBe("dim");

        // Half diminished Seven 1,b3,b5,b7 + extension
        ch = chord.chordFromNotation("Dø13");
        expect(ch.quality.extension.value).toBe("13");  // 13 tells us this 7 is dominant (b7)
        expect(ch.quality.triad.value).toBe("dim");

        // Half diminished char ø cannot be paired with maj(n)
        expect(function(){chord.chordFromNotation("Dømaj9");}).toThrow();

    });

    it("Supports",function() {

    });

    it("Supports slash chords",function(){

        ch = chord.chordFromNotation("Dmaj11sus2/B");
        expect(ch.quality.extension.value).toBe("maj11");
        expect(ch.quality.triad.value).toBe("sus2");
        // Root note is always the first note in the chord symbol as it's fundamental
        expect(ch.rootNote.name).toBe("D");
        // The note after the slash is the Bass note (lowest tone in the chord)
        expect(ch.baseNote.name).toBe("B");

        ch = chord.chordFromNotation("F#maj7/C#");
        expect(ch.quality.extension.value).toBe("maj7");
        expect(ch.quality.triad.value).toBe("major");
        // Root note is always the first note in the chord symbol as it's fundamental
        expect(ch.rootNote.name).toBe("F#");
        // The note after the slash is the Bass note (lowest tone in the chord)
        expect(ch.baseNote.name).toBe("C#");

        ch = chord.chordFromNotation("Esus2/F#");
        expect(ch.quality.triad.value).toBe("sus2");
        // Root note is always the first note in the chord symbol as it's fundamental
        expect(ch.rootNote.name).toBe("E");
        // The note after the slash is the Bass note (lowest tone in the chord)
        expect(ch.baseNote.name).toBe("F#");

    });

    it("Supports adding new chord tones",function(){

        // Looks for '5' and 'b's it
        let ch = chord.chordFromNotation("D(add 9)");
        expect(ch.quality.triad.value).toBe("major");
        expect(ch.hasNote("E")).toBe(true);

        // Supports sharps/flats
        ch = chord.chordFromNotation("Dm(add #11)");
        expect(ch.quality.triad.value).toBe("minor");
        expect(ch.hasNote("G#")).toBe(true);

        // Can add one or more in a list
        ch = chord.chordFromNotation("D(add #11, b6)");
        expect(ch.quality.triad.value).toBe("major");
        expect(ch.hasNote("G#")).toBe(true);
        expect(ch.hasNote("A#")).toBe(true);

        // Can omit 'add' and if the note does not already exist
        //    AND the added note has an accidental, behavior is the same
        ch = chord.chordFromNotation("Dm(b6)");
        expect(ch.quality.triad.value).toBe("minor");
        expect(ch.hasNote("A#")).toBe(true);

        ch = chord.chordFromNotation("Emaj7(b9)");
        expect(ch.quality.triad.value).toBe("major");
        expect(ch.quality.extension.value).toBe("maj7");
        expect(ch.hasNote("F")).toBe(true);

        // However, putting an add in the mod list with a pure interval is unacceptable
        expect( function(){
            chord.chordFromNotation("E6(9)");
        } ).toThrow();

        expect( function(){
            chord.chordFromNotation("E7(9,11)");
        } ).toThrow();




    });


    it("Supports chord modifiers",function(){
        // Looks for '5' and 'b's it
        let ch = chord.chordFromNotation("D6(b5)");
        expect(ch.quality.triad.value).toBe("major");
        expect(ch.quality.extension.value).toBe("6");
        // the b5
        expect(ch.hasNote("G#")).toBe(true);
        // it should not have the 5
        expect(ch.hasNote("A")).toBe(false);

        // Looks for '5' and 'b's it
        ch = chord.chordFromNotation("F#m-maj11#9");
        expect(ch.quality.triad.value).toBe("minor");
        expect(ch.quality.extension.value).toBe("maj11");
        // the #9
        expect(ch.hasNote("A")).toBe(true);
        // it should not have the 9
        expect(ch.hasNote("G#")).toBe(false);



    });
});
