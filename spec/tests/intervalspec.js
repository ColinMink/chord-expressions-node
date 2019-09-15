const Interval = require('../../index').Interval;

describe("Interval suite",function(){
    it("fromName",function(){
        let int = Interval.fromName('b2');
        expect(int.name).toBe("b2");
        expect(int.value).toBe(1);
        expect(function(){Interval.fromName('h2')}).toThrow();
    });
    it("fromValue",function(){
        let int = Interval.fromValue(1);
        expect(int.name).toBe("b2");
        expect(int.value).toBe(1);
        expect(function(){Interval.fromValue(14)}).toThrow();
    });

    it("getSum",function(){
        let int = Interval.fromName('b2');
        let sum = int.getSum(4);
        expect(sum).toBe(5);
    });

    it("flat",function(){
        let int = Interval.fromName('b2');
        int = int.flat();
        expect(int.name).toBe("1");
        expect(int.value).toBe(0);
    });

    it("sharp",function(){
        let int = Interval.fromName('b2');
        int = int.sharp();
        expect(int.name).toBe("2");
        expect(int.value).toBe(2);
    });

    it("plus",function(){
        let int = Interval.fromName('b2');
        int = int.plus('b3');
        expect(int.name).toBe("3");
        expect(int.value).toBe(4);
    });

    it("minus",function(){
        let int = Interval.fromName('b2');
        int = int.minus('b3');
        expect(int.name).toBe("b7");
        expect(int.value).toBe(10);
    });

    it("accidentalValue",function(){
        let val = Interval.accidentalValue('bbbb');
        expect(val).toBe(-4);
        expect(function(){Interval.getAccidentalValue('bbb1b')}).toThrow(new TypeError("accidentalString must only have # and b characters"));
    });

    it("IntervalStringToInterval",function(){
        expect(Interval.symbolToValue('b2')).toBe(1);
        expect(Interval.symbolToValue('##1')).toBe(2);
        expect(function(){Interval.symbolToValue('##');}).toThrow();
    });

    it("normalizeIntervalValue",function(){
        expect(Interval.normalizeIntervalValue(15)).toBe(3);
        expect(Interval.normalizeIntervalValue(25)).toBe(1);
        expect(Interval.normalizeIntervalValue(-1)).toBe(11);
    });
});
