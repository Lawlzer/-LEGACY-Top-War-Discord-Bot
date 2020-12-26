// This is the example (again, fully working and running) example of lib/database.js

const Database = require('../models/Database');
const databaseController = require('./database');

// if you comment out all of these commands, it'll remove them from all the help commands and everything. Feel free to comment these out if you don't want them
exports.setCommand = async function (bot, message, argsLowercase, content) {
    var database = await databaseController.getOrCreateDatabase(message.guild.id);
    var currentCommands = database.userCreatedCommands;

    const commandTrigger = argsLowercase[0];
    argsLowercase.shift(); // remove the first element in the array now, since that's the "name" or "trigger"
    const commandDescription = argsLowercase.join(' ');

    var oldCommandReplaced = false; 
    for (let i = 0; i < currentCommands.length; i++) {
        // if this command is already in the DB, we want to change our message
        if (commandTrigger == currentCommands[i].commandTrigger) {
            oldCommandReplaced = true; 

            currentCommands.splice(i, 1); // delete the current element, as it's the one we're "replacing"
            // we could simply replace the command, and I don't really have a reason to do it this way (ordering?)
            // but we're deleting the old command, then simply adding a new one, not "replacing" it.
        }
    }

    const newCommand = {
        commandTrigger: commandTrigger,
        commandDescription: commandDescription,
    }
    currentCommands.push(newCommand);
    database.userCreatedCommands = currentCommands; 
    await database.save();

    if (oldCommandReplaced) {
        await databaseController.sendEmbed(bot, message, 'Old Command Replaced', 'The old command has been replaced. Please use ' + await databaseController.returnPrefix(message.guild.id) + commandTrigger + ' to run the new command.'); 
        // command name IS in use
    } else {
        // command name is NOT in use
        await databaseController.sendEmbed(bot, message, 'New Command Set', 'The new command has been set. Please use ' + await databaseController.returnPrefix(message.guild.id) + commandTrigger + ' to run the new command.'); 
    }
    
}

exports.removeCommand = async function (bot, message, argsLowercase, content) {
    const prefix = await databaseController.returnPrefix(message.guild.id);
    var database = await databaseController.getOrCreateDatabase(message.guild.id);
    var currentCommands = database.userCreatedCommands;

    const commandTrigger = argsLowercase[0]; // the commandTrigger can only be 1 word length

    for (let i = 0; i < currentCommands.length; i++) {
        // For each command, see if it's the right one
        
        if (commandTrigger == currentCommands[i].commandTrigger) { // if this is the right command
            currentCommands.splice(i, 1);
            database.userCreatedCommands = currentCommands; 
            await database.save(); 
            await databaseController.sendErrorEmbed(bot, message, 'Command Deleted', 'The command with the name `' + prefix + commandTrigger + '` has been deleted.');
            return; 
        }
    }

    // no command was found with that name
    await databaseController.sendEmbed(bot, message, 'Command Not Found', 'The command with the name `' + prefix + commandTrigger + '` could not be found. Please use `' + prefix + 'commandHelp` to find the list of user commands.'); 
}

exports.getUserCommands = async function (bot, message, argsLowercase, content) {
    const prefix = await databaseController.returnPrefix(message.guild.id);
    const database = await databaseController.getOrCreateDatabase(message.guild.id);
    var allCommands = database.userCreatedCommands;

    if (allCommands.length == 0) {
        await databaseController.sendEmbed(bot, message, 'All Commands', 'No commands found! Please use `' + prefix + 'addCommand` to create a user command, or use `' +  prefix + 'help` to see all commands.');
        return; 
    }

    var response = 'All Commands:';

    for (let i = 0; i < allCommands.length; i++) {
        // we need every command, so let's add them to the response
        response += ('\n' + prefix + allCommands[i].commandTrigger);
        // parenthesis not needed, but it looks better imo
    }
    await databaseController.sendEmbed(bot, message, 'All Commands', response); 
}