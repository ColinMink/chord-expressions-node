"use strict";

exports = module.exports;
console.log('exporting chord');
exports.Chord = require('./chord');
console.log('exporting interval');
exports.Interval = require('./interval');
console.log("exporting note");
exports.Note = require('./note');