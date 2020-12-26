// All of the "internal" or "dev" commands are put here. These commands come with every version of my bot, and are frequently useful.
// Look at exports.AdminHelp (in this file) to see a commented version of how every command interacts and works and all that

const requirements = require('./requirements');
const databaseController = require('../lib/database');

exports.Help = { 
  // The *name* of the command will show up when you run the help  command- so you will want it to be capitalized.

  blurb: '<commandPrefix>help.', 
  // Blurb is what shows up in the basic help command.

  help: '!help !help !help !help wait... that isn\'t how this works? ', 
  // If you do !help <specificCommand>, then this "help" will appear.
  // the "blurb" may be removed in the future version, and simply replaced with this "help"

  example: '<commandPrefix>help || <commandPrefix>help ping', 
  // <commandPrefix> will be replaced with the user-set command prefix (by default, !)
  // When you run !help <specificCommand>, this example will show up, and may help the user if they have any questions about this command
  
  requirements: [],
  // This is an array of any requirements this command may have. For example, `requirements.admin` will check if the user has admin.
  // If the user does not have access to that command, it'll return an error embed (/lib/database.js), and will stop the command.

  execute: databaseController.help,
  // This runs the actual code for the command, in lib/database.js for this command. 
}

exports.AdminHelp = {
  blurb: 'Get help for the admin-only commands.',
  help: 'Get help for the commands that are only available to admin users.',
  example: '<commandPrefix>adminHelp',
  requirements: [requirements.admin],
  execute: databaseController.adminHelp,
}

exports.Ping = {
  blurb: 'Make sure the server is running',
  help: 'Make sure the server is running',
  example: '<commandPrefix>ping',
  requirements: [],
  execute: databaseController.ping,
}

exports.Pong = {
  blurb: 'Make sure the server is running',
  help: 'Make sure the server is running',
  example: '<commandPrefix>pong',
  requirements: [requirements.admin],
  execute: databaseController.pong,
}

exports.AmIAdmin = {
  blurb: 'Check if you are an admin.',
  help: 'This will reply \'true\' if you have the admin role.',
  example: '<commandPrefix>amIAdmin',
  requirements: [],
  execute: databaseController.amIAdmin,
}

exports.SetAdminRole = {
  blurb: 'Set the admin role.',
  help: 'Set the active admin role - Must not be set yet. (If already set, ask Lawlzer to change it. Please @ the role in the message.)',
  example: '<commandPrefix>setAdminRole @botAdmin',
  requirements: [requirements.oneArgument],
  execute: databaseController.setAdminRole,
}

exports.SetChatLog = {
  blurb: 'Set the channel for where things should be logged.',
  help: 'Set the active channel for where things should be set - Must be pinged & should be **only** for the bot.',
  example: '<commandPrefix>setChatLog #botLogChannel',
  requirements: [requirements.oneArgument, requirements.admin],
  execute: databaseController.setChatLog,
}



exports.SetPrefix = {
  blurb: 'Set the command prefix',
  help: 'Change the character before every command - by default, !',
  example: '<commandPrefix>setPrefix $',
  requirements: [requirements.oneArgument, requirements.admin],
  execute: databaseController.setPrefix,
}
