// This is the example Database, with everything pre-set up for you, and should run without flaw, if you set up everything in .env correctly.
// If you don't know how to set your .env file correctly (and don't see it), read README.md 
// also, all databases for this bot are based on the serverId. If you have it running in different Discord servers, you will
// have DIFFERENT databases. If you want to change this, look at getOrCreateDatabase() in /lib/database.js
const mongoose = require('mongoose');

const databaseSchema = new mongoose.Schema({
  serverId: { type: String, required: true, unique: true },
  adminRoleId: { type: String },
  chatLogId: { type: String },
  commandPrefix: { type: 'String', required: true },

  userCreatedCommands: [{ type: 'Object'}],
//   newCommand = {
//     commandTrigger: commandTrigger,
//     commandDesciption: commandDescription,
//  }

}, { timestamps: true });

const Database = mongoose.model('Database', databaseSchema);

module.exports = Database;  