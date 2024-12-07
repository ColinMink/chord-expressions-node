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
        Object.entries(Modes).forEach(([scaleGroupID, scaleGroup]) => {
            Object.entries(scaleGroup.scales).forEach(([scaleName, value]) => {

                // build scale based on every root note
                noteNames.forEach(note => {
                    results.push(new Scale(note,scaleGroupID, scaleGroup.name, scaleName));
                });
                
            });
        });
        return results;
    }
    //generateScales();
    module.exports.generateScales = generateScales;