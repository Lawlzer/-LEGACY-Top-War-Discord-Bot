// This file holds all of the "requirements" that are referenced from anything in /commands
// They will return "true" if the requirement is met, or "false" if the requirement is not passed, then the command will not run.

const databaseController = require('../lib/database');

exports.admin = async function (bot, message, argsLowercase, content) {
  const database = await databaseController.getOrCreateDatabase(message.guild.id);
  if (!database.adminRoleId) {
    await databaseController.sendErrorEmbed(bot, message, 'ERROR', 'There is no admin role ID set. Please set the role ID of the admin role. Example: !setAdminRole @BotAdmins.');
    return;
  }

  if (message.member.roles.some(role => role.id == database.adminRoleId)) {
    return true;
  }
  await databaseController.sendErrorEmbed(bot, message, 'ERROR', 'You must be an admin to run this command.');
  return false;
}

exports.oneArgument = async function (bot, message, argsLowercase, content) {
  if (argsLowercase.length < 1) {
    databaseController.sendErrorEmbed(message, bot, 'ERROR', 'You must provide at least one argument to use this command. Example: ' + command.example);
    return false;
  }
  return true;
}

exports.twoArguments = async function (bot, message, argsLowercase, content) {
  if (argsLowercase.length < 2) {
    await databaseController.sendErrorEmbed(message, bot, 'ERROR', 'You must provide at least two arguments to use this command. Example: ' + command.example);
    return false;
  }
  return true;
}