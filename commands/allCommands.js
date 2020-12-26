// If you try to remove this file, then you will have recursive problems with requiring files that require more files that require
// that file, which is absolute chaos and a mess. This file will take all anything in commands. Then, those files, can require the exports.
// and it'll all work fine. This file is frequently named internal.js, but the name was changed for simplicity/understanding.

const databaseCommands = require('./database');
const requirements = require('./requirements')

const exampleCommands = require('./example');

exports = Object.assign(exports, databaseCommands, exampleCommands);

// legacy comment
//honestly I don't understand this, it just works