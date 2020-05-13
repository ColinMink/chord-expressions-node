const interval = require('../../index').Interval;

describe("Interval suite",function(){
    it("fromName",function(){
        let int = interval.fromName('b2');
        expect(int.name).toBe("b2");
        expect(int.value).toBe(1);
        expect(function(){interval.fromName('h2')}).toThrow();
    });
    it("fromValue",function(){
        let int = interval.fromValue(1);
        expect(int.name).toBe("b2");
        expect(int.value).toBe(1);
        expect(function(){interval.fromValue(14)}).toThrow();
    });

    it("getSum",function(){
        let int = interval.fromName('b2');
        let sum = int.getSum(4);
        expect(sum).toBe(5);
    });

    it("flat",function(){
        let int = interval.fromName('b2');
        int = int.flat();
        expect(int.name).toBe("1");
        expect(int.value).toBe(0);
    });

    it("sharp",function(){
        let int = interval.fromName('b2');
        int = int.sharp();
        expect(int.name).toBe("2");
        expect(int.value).toBe(2);
    });

    it("plus",function(){
        let int = interval.fromName('b2');
        int = int.plus('b3');
        expect(int.name).toBe("3");
        expect(int.value).toBe(4);
    });

    it("minus",function(){
        let int = interval.fromName('b2');
        int = int.minus('b3');
        expect(int.name).toBe("b7");
        expect(int.value).toBe(10);
    });

    it("getAccidentalValue",function(){
        let val = interval.getAccidentalValue('bbbb');
        expect(val).toBe(-4);
        expect(function(){interval.getAccidentalValue('bbb1b')}).toThrow(new TypeError("accidentalString must only have # and b characters"));
    });

    it("intervalStringToInterval",function(){
        expect(interval.intervalStringToInterval('b2')).toBe(1);
        expect(interval.intervalStringToInterval('##1')).toBe(2);
        expect(function(){interval.intervalStringToInterval('##');}).toThrow();
    });

    it("normalizeIntervalValue",function(){
        expect(interval.normalizeIntervalValue(15)).toBe(3);
        expect(interval.normalizeIntervalValue(25)).toBe(1);
        expect(interval.normalizeIntervalValue(-1)).toBe(11);
    });
});