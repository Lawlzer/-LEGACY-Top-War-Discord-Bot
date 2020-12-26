// This file has all of the code that the commands themselves run. This is where you can put your commands
// The function name should be whatever you set it to in commands/database.js
// A copy of this file (with the name changed) is example.js, and that's where I'd personally recommend you to put your commands.

const defaultEmbedColour = '00EB66'; // the default colour for any normal embeds
const defaultErrorEmbedColour = '#9E1A1A' // the default colour for any error embeds

const nerdDumpEmojiId = '792236777816719390' // Discord.js bots have access to any custom-emojis, as long as
// they're in atleast one server with that emoji. https://anidiots.guide/coding-guides/using-emojis
// Set this to "null" and Nerd Dumping will be disabled :)
// When you click the emoji, it'll run "nerd dump" and log the (detailed) response times. May add more stuff in the future.
const nerdDumpTimeOut = 300; // in seconds. After this time, reacting to a message will no longer do anything.


const Discord = require('discord.js');
const Database = require('../models/Database');
const requirements = require('../commands/requirements');

const databaseCommands = require('../commands/allCommands');

function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

exports.replaceAll = async function (str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

exports.returnNerdDumpEmojiId = async function() {
  return nerdDumpEmojiId; 
}

// this function has the basic settings for embeds
// You'll probably want to edit a lot of these.. like the URL,  and Footer, and probably colour (colour is passed in from exports.sendErrorEmbed)
function returnBasicEmbed(message, title, description, colour) {
  // !todo - this number is sometimes negative... and 3k+ ms, instead of the normal 150... possibly fixed by new solution, but that doesn't make any sense.
  // Possible problem between local computer time and Discord time?
  // completely deleted problem by new solution, but should double-check

  const embed = new Discord.RichEmbed()
    .setTitle(title)
    .setDescription(description)
    .setColor(colour)
    .setFooter('Author: Lawlzer#4013 on Discord.')
    .setURL('https://discord.js.org/')
    .setThumbnail('https://cdn.discordapp.com/attachments/635217459875676161/638450991322365969/SlapD.png'); //change this to the picture of the bot
    
    return embed; 
}

var temporaryEmbedInformation = [];
exports.returnNerdDumpInfo = async function() {
  return temporaryEmbedInformation; 
}

async function delayedDeleteNerdDumpId(messageId) {
  await sleep(nerdDumpTimeOut); // wait a long time (300 seconds == 5 minutes)
  for (let i = 0; i < temporaryEmbedInformation.length; i++) {
    if (temporaryEmbedInformation[i].id == messageId) { // this is the correct element, we found it, now we just have to remove it
      temporaryEmbedInformation.splice(i, 1); // so remove it! 
      return; 
    }
  }
  console.log('Possible huge error: Couldn\'t find the temporaryEmbedInformation for message ID ' + messageId + '\nThat may be a memory leak or something really bad, if you don\'t fix this.. albeit, very, very slowly')
}

exports.sendEmbed = async function (bot, message, title, description) {
  // only show the basic total response time (Discord --> Bot --> Discord) by default, if they react to it though, then ENABLE NERD DUMP
  var basicEmbed = returnBasicEmbed(message, title, description, defaultEmbedColour); 
  var botTime = Date.now(); 
  message.channel.send(basicEmbed).then(msg => {
    var basicFooterText = basicEmbed.footer.text; 
    // we want to ADD the response time from our Bot, back to Discord, so we must save this, THEN after the message is sent, edit it.
      let embed = returnBasicEmbed(message, title, description, defaultEmbedColour) 
          .setFooter(basicFooterText + '\nTotal response time: ' + (msg.createdTimestamp - message.createdTimestamp) + ' ms.')
      msg.edit(embed); 
      msg.react(nerdDumpEmojiId);     
      var currentEmbedTemporaryInformation = {
        id: msg.id,
        initialMessageTime: message.createdTimestamp,
        botTime: botTime,
        secondMessageTime: msg.createdTimestamp,
        channel: message.channel,
        basicEmbed: basicEmbed,
      }
      temporaryEmbedInformation.push(currentEmbedTemporaryInformation);
      delayedDeleteNerdDumpId(msg.id); 
    return; 
    });
}


exports.sendErrorEmbed = async function (bot, message, title, description) {
  // only show the basic total response time (Discord --> Bot --> Discord) by default, if they react to it though, then ENABLE NERD DUMP
  var basicEmbed = returnBasicEmbed(message, title, description, defaultErrorEmbedColour); 
  var botTime = Date.now(); 
  message.channel.send(basicEmbed).then(msg => {
    var basicFooterText = basicEmbed.footer.text; 
    // we want to ADD the response time from our Bot, back to Discord, so we must save this, THEN after the message is sent, edit it.
      let embed = returnBasicEmbed(message, title, description, defaultErrorEmbedColour) 
          .setFooter(basicFooterText + '\nTotal response time: ' + (msg.createdTimestamp - message.createdTimestamp) + ' ms.')
      msg.edit(embed); 
      msg.react(nerdDumpEmojiId);     
      var currentEmbedTemporaryInformation = {
        id: msg.id,
        initialMessageTime: message.createdTimestamp,
        botTime: botTime,
        secondMessageTime: msg.createdTimestamp,
        channel: message.channel,
        basicEmbed: basicEmbed,
      }
      temporaryEmbedInformation.push(currentEmbedTemporaryInformation);
      delayedDeleteNerdDumpId(msg.id); 
    return; 
    });
}



exports.sendChatMessage = async function (bot, message, messageToSend) {
  const database = await getOrCreateDatabase(message.guild.id);
  var chatLogId = database.chatLogId;
  if (!chatLogId) {
    message.channel.send(await exports.sendEmbed(bot, message, 'Extra-Fancy', 'If you want to make the bot even cooler (for admins), use !help setChatLog'));
    return;
  }
  if (!messageToSend) {
    return;
  }
  bot.channels.get(chatLogId).send(messageToSend);
}

exports.help = async function (bot, message, argsLowercase, content) {
  const database = await getOrCreateDatabase(message.guild.id);
  var isAdmin;
  if (!database.adminRoleId) {
    console.log('No admin role set. Will assume the user is an admin.');
    message.channel.send(await exports.sendEmbed(bot, message, 'No Admin Role Set', 'Will assume you are an admin. Please do !help SetAdminRole'));
    isAdmin = true;
  }

  if (!isAdmin && message.member.roles.some(role => role.id == database.adminRoleId)) {
    isAdmin = true;
  }

  // Specific command help
  if (argsLowercase.length != 0) {
    message.channel.send(await exports.sendEmbed(bot, message, argsLowercase[0], await returnSpecificHelpResponse(bot, message, argsLowercase)));
    return;
  }

  // AdminHelp
  if (argsLowercase.length == 0 && isAdmin) {
    message.channel.send(await exports.sendEmbed(bot, message, 'Admin Help', await returnAdminHelpResponse(bot, message)));
    return;
  }

  // Basic Help 
  if (argsLowercase.length == 0 && !isAdmin) {
    message.channel.send(await exports.sendEmbed(bot, message, 'Help <Me>', await returnNotAdminHelpResponse(bot, message)));
    return;
  }
}

exports.ping = async function (bot, message, argsLowercase, content) {
  await exports.sendEmbed(bot, message, 'Ping', 'pong!');
}

exports.pong = async function (bot, message, argsLowercase, content) {
  await exports.sendEmbed(bot, message, 'Pong', 'ping!');
}

// If you want the same database for every Discord server, you can change serverId to something pre-set.
// e.g `serverId: 'allServers'`
// then whenever it searches for the database, it'll always find the same one, based on that ID.
let getOrCreateDatabase = async function (discordId) {
  let database = await Database.findOne().where('serverId').equals(discordId);
  if (!database) {
    database = new Database({
      serverId: discordId,
      adminRole: '',
      commandPrefix: '!', // if you want a different commandPrefix by default, feel free to change this.
      // commandPrefixes support literally anything I could test. xss attacks, spaces in names, multiple words, everything
      // but I wouldn't recommend having a ` in your commandPrefix, based on my laziness in the help command, and Discord formatting
      // but it looks kind of cool, so if you want, set the commandPrefix to `whatever 
      // then run `whatever help
      // and you'll see something great
    });
    await database.save();
    console.log('new Discord server object created.');
  }
  return database;
};
exports.getOrCreateDatabase = getOrCreateDatabase;

exports.setAdminRole = async function (bot, message, argsLowercase, content) {
  var database = await getOrCreateDatabase(message.guild.id);
  if (!!database.adminRoleId) {
    await exports.sendErrorEmbed(bot, message, 'ERROR', 'There is already an admin role set. Message `Lawlzer#4013` if you need this fixed.');
    return;
  }
  if (argsLowercase[0].replace('<@&', '') !== argsLowercase[0]) {
    var adminRoleToAdd = argsLowercase[0].replace('<@&', '').replace('>', '');
    database.adminRoleId = adminRoleToAdd;
    await database.save();
    await exports.sendEmbed(bot, message, 'Admin Role Set', 'The admin role has been set to ' + argsLowercase[0]);
    exports.sendChatMessage(bot, message, 'The admin role has been set to ' + argsLowercase);
    return;
  }
  await exports.sendErrorEmbed(bot, message, 'ERROR', 'Please ensure that you are pinging (@\'ing a role) to set the admin role to.');
}

exports.amIAdmin = async function (bot, message, argsLowercase, content) {
  const database = await exports.getOrCreateDatabase(message.guild.id);
  if (!database.adminRoleId) {
    await exports.sendErrorEmbed(bot, message, 'ERROR', 'The admin role ID has not yet been set. Please use `!setAdminRole` to fix this.');
    return;
  }

  if (message.member.roles.some(role => role.id == database.adminRoleId)) {
    await exports.sendEmbed(bot, message, 'Admin', 'You are an admin!');
    // message.channel.send(embed);
    return;
  }
  const embed = await exports.sendErrorEmbed(bot, message, 'Not Admin', 'You are not an admin.');
  message.channel.send(embed);
}

exports.setChatLog = async function (bot, message, argsLowercase, content) {
  var database = await getOrCreateDatabase(message.guild.id);
  if (!!database.chatLogId) {
    await exports.sendErrorEmbed(bot, message, 'Set Chat Log', 'There is already a chat log channel specified. Message `Lawlzer#4013` if you need this fixed.');
    return;
  }
  if (argsLowercase[0].replace('<#', '') !== argsLowercase[0]) {
    var chatLogToAdd = argsLowercase[0].replace('<#', '').replace('>', '');
    database.chatLogId = chatLogToAdd;
    await database.save();
    await exports.sendEmbed(bot, message, 'SetChatLog', 'The chat log ID has been set to ' + argsLowercase[0]);
    return;
  }
  await exports.sendErrorEmbed(bot, message, 'Set Chat Log', 'Failed to set the chat log. Please make sure you are pinging (`#`) a specific chat. Use :!help setChatLog for more help."');
}

exports.setPrefix = async function (bot, message, argsLowercase, content) {
  var database = await getOrCreateDatabase(message.guild.id);
  if (!database.chatLogId) {
    message.channel.send(await exports.sendErrorEmbed(bot, message, 'Set Prefix', 'There is no chat log created. Use !help setChatLog to fix this. Command will continue'));
  }
  var entireMessage = message.content;
  entireMessage = entireMessage.toLowerCase(); // we want it to be in lowercase
  newPrefix = entireMessage.replace('setprefix', ''); // replace the command itself with nothing
  newPrefix = newPrefix.replace(database.commandPrefix, ''); // also replace the old prefix 

  while (newPrefix.startsWith(' ')) {
    newPrefix = newPrefix.substring(1, newPrefix.length);
  }
  // if we have any spaces at the start, just delete them

  //newPrefix = newPrefix.split(' ').join(''); // remove any spaces, screw those things in prefixes

  database.commandPrefix = newPrefix;
  await database.save();
  await exports.sendEmbed(bot, message, 'Set Prefix', 'The prefix has been set to: ' + newPrefix);
}





async function returnSpecificHelpResponse(bot, message, argsLowercase) {
  const database = getOrCreateDatabase(message.guild.id);
  // this code looks for SPECIFIC commands - e.g !help ping
  var keys = Object.keys(databaseCommands); //keys are the NAMES of all the objects (in array form)... e.g "help", "adminhelp", "ping", etc.
  for (let i = 0; i < keys.length; i++) {
    if (argsLowercase[0] == keys[i]) {
      var description = 'Description: ' + databaseCommands[keys[i]].blurb + '\n Example: ' + databaseCommands[keys[i]].example;

      description += databaseCommands[keys[i]].arguments == '' || databaseCommands[keys[i]].arguments == undefined //newline here to make it look way better
        ? '' : '\nArguments: ' + databaseCommands[keys[i]].arguments;

      var response = exports.replaceAll(description, '<commandPrefix>', database.commandPrefix);
      return response;
    }
  }

  message.channel.send(await exports.sendErrorEmbed(bot, message, '3RR0R', 'No command "!' + argsLowercase[0] + '" found.'));
}

async function returnAdminHelpResponse(bot, message) {
  const database = await getOrCreateDatabase(message.guild.id);
  var response = '';
  const keys = Object.keys(databaseCommands);
  var lastBlurb = null;
  for (let i = 0; i < keys.length; i++) {
    if (lastBlurb != databaseCommands[keys[i]].blurb) {
      lastBlurb = databaseCommands[keys[i]].blurb;
      response += '\n' + database.commandPrefix + keys[i] + ': ' + databaseCommands[keys[i]].blurb;
    }
  }
  return response = exports.replaceAll(response, '<commandPrefix>', database.commandPrefix);
}

async function returnNotAdminHelpResponse(bot, message) {
  const database = await getOrCreateDatabase(message.guild.id);
  var response = '';
  var keys = Object.keys(databaseCommands); //keys are the NAMES of all the objects (in array form)... e.g "help", "adminhelp", "ping", etc.
  var requireAdmin = false;
  for (let i = 0; i < keys.length; i++) { //for every NAMED object in commands/database.js

    for (let j = 0; j < databaseCommands[keys[i]].requirements.length; j++) { //For every requirement in the current object
      if (requirements.admin == databaseCommands[keys[i]].requirements[j]) { //if the requirement is 'requirements.admin' set it to requiring admin.
        requireAdmin = true;
      }
    }
    if (!requireAdmin) { //if this command never requires admin, add it
      response += '\n' + database.commandPrefix + keys[i] + ': ' + databaseCommands[keys[i]].blurb;
    }
    requireAdmin = false; //then reset it and check the next command!
  }
  response = exports.replaceAll(response, '<commandPrefix>', database.commandPrefix);
  return response;
}

exports.returnPrefix = async function (guildId) {
  const database = await getOrCreateDatabase(guildId);
  return database.commandPrefix;
}