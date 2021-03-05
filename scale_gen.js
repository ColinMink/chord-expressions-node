const {Scale, Modes} = require('./lib/scale.js');

const noteNames = [
    "A",
    "A#",
    "B",
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#"
];

    function generateScales() {
        let results = [];
        Object.entries(Modes).forEach(([mode, value]) => {
            Object.entries(value.scales).forEach(([key, value]) => {
                noteNames.forEach(note => {
                    results.push(new Scale(note,mode,key));
                });
            });
        });
        return results;
    }
    module.exports.generateScales = generateScales;