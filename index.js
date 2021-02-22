"use strict";

console.log("exporting modules");

const chord = require('./lib/chord_expressions').Chord;
module.exports.default = require('./lib/chord_expressions');
module.exports.generateChords = require('./chord_gen.js').generateChords;
module.exports.generateScales = require('./scale_gen.js').generateScales;