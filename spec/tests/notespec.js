const note = require('../../index').Note;
/*
    it("",function(){
        
    });
*/
describe("Note suite",function(){
    it("fromValue",function(){
        let n = note.fromValue(5);
        expect(n.name).toBe("D");
        expect(n.value).toBe(5);
    });
    it("fromValue",function(){
        let n = note.fromValue(0);
        expect(n.name).toBe("A");
        expect(n.value).toBe(0);
    });
    it("fromValue",function(){
        let n = note.fromValue(11);
        expect(n.name).toBe("G#");
        expect(n.value).toBe(11);
    });
    it("fromValue",function(){
        let n = note.fromValue(6);
        expect(n.name).not.toBe("G#");
        expect(n.value).not.toBe(7);
    });


    it("fromName",function(){ 
        let n = note.fromName("A#");
        expect(n.name).toBe("A#");
        expect(n.value).toBe(1);

        n = note.fromName("A##");
        expect(n.name).toBe("B");
        expect(n.value).toBe(2);

        n = note.fromName("Abb");
        expect(n.name).toBe("G");
        expect(n.value).toBe(10);
    });
});