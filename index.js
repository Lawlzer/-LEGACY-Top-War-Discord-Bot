// This is where the magic starts.
// If you haven't yet, please read README.md
// It'll explain how to create and setup a .env file, and everything else recommended for you to add.

// Comments will be everywhere (hopefully throughout every file) explaining how everything works and what it all does
// along with things you may want to remove :)
// If you have any questions, feel free to contact me on Discord. Lawlzer#4013

// Invite Link for the bot: https://discordapp.com/oauth2/authorize?client_id=206980947298615297&scope=bot

console.log('The bot is in index.js');

const production = true; // set to true if it's the "production" version of your bot
const devTestingGuildId = '547192605927145481'; // set to the id of your TESTING server. This IS important.
const devUserId = '206980947298615297'; 
// should be the GUILD id, not the CHANNEL id.

const commands = require('./commands/allCommands');
const databaseController = require('./lib/database');
const exampleController = require('./lib/example');
const mongoose = require('mongoose');
const Discord = require('discord.js');

const dotenv = require('dotenv');
dotenv.load({ path: '.env' });

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});

const bot = new Discord.Client();
var messageDeveloper; 

bot.on('ready', () => { // When our bot is ready:
  bot.user.setActivity("TopWar Battle Game");
  // https://discord.js.org/#/docs/main/stable/class/ClientUser?scrollTo=setActivity
  // bot.user.setActivity('YouTube', { type: 'WATCHING' })
  // .then(presence => console.log(`Activity set to ${presence.game ? presence.game.name : 'none'}`))
  // .catch(console.error);
  console.log('Bot running.');
  
  // If you're not me (hi!), you'll probably want to either delete this, or leave it, if you want messages when something goes wrong.
  bot.fetchUser(devUserId, false).then((user) => { 
    if (!user) {
      console.log('The user could not be found. Are you sure you\'re in the same server as the bot?'); // possibly not needed text, depending on how mass scale your bot is.
      return; 
    }
    messageDeveloper = user; 
  });  
});

bot.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) { return; }
  // we need to make sure the reaction isn't from the bot 
  const nerdDumpEmojiId = await databaseController.returnNerdDumpEmojiId();
  if (reaction.emoji.id != nerdDumpEmojiId) {
    // we need the correct reaction
    return;
  }
  var allObjects = await databaseController.returnNerdDumpInfo();

  var correctObject = null; 
  for (let i = 0; i < allObjects.length; i++) {
    if (allObjects[i].id == reaction.message.id) { // this is the correct element, we found it, now we have to do stuff with this
      correctObject = allObjects[i];
    }
  }
  if (!correctObject) { return; } // somebody probably reacted to a non-bot message with your custom emoji // or they reacted after the thing was deleted from our saved array
  
  var embed = correctObject.basicEmbed; 
  embed.setFooter(
    'NERD DUMP ACTIVATED!' +
    '\nDiscord --> Bot response time: ' + (correctObject.botTime - correctObject.initialMessageTime) +'ms.' + 
    '\nBot --> Discord response time: ' + (correctObject.secondMessageTime - correctObject.botTime) + 'ms.' +
    '\nTotal response time: ' + (correctObject.secondMessageTime - correctObject.initialMessageTime) + 'ms.'  
    );
  reaction.message.edit(embed)
})

bot.on('message', async message => {
  if (message.author.bot) {
    return; //if the author of the message is the bot, do nothing.
  }

  if (!message.guild) { //If the message is sent via DMs.
    message.reply('Please do not message this bot in DMs. Please do !help in a public channel, or add Lawlzer on Discord for help. Lawlzer#4013')
    return;
  } // lots of commands don't work if you message the bot in DMs, so it's just disabled overall
    // all of the databases, by default, are created based on the server ID (aka guild ID) - so there aren't any databases in DMs

  if (message.guild.id == devTestingGuildId && production) {
    console.log('In dev testing server, but production is enabled. Message ignored.'); 
    return; 
  }

  if (message.guild.id != devTestingGuildId && !production) {
    console.log('In dev testing server, but this is the production bot. Message ignored.')
    return; 
  }

  // this handles the command itself, and handles all of the stuff for running the command itself
  await (async function executeCommand() {
    const database = await databaseController.getOrCreateDatabase(message.guild.id);
    var commandPrefix = database.commandPrefix;
    var commandName = message.content.toLowerCase();
    // sets the name of the command

    if (!commandName.startsWith(commandPrefix)) {
      return;
    }
    // makes sure the command starts with the correct prefix

    commandName = commandName.replace(commandPrefix, ''); // get rid of the prefix
    commandName = commandName.split(' ');

    if (commandName[0] == '') { commandName.shift(); } // if we have a command with a space inbetween the prefix and the command
    // e.g "! ping" - this will remove the space
    // the commandName is only the first word, so we split it up by spaces, then take the first word. (needed if we have args/whatever)

    commandName = commandName[0];
    var argsLowercase = message.content.toLowerCase();
    argsLowercase = argsLowercase.replace(commandPrefix, '');
    argsLowercase = argsLowercase.replace(commandName, '');
    argsLowercase = argsLowercase.split(' ');
    // sets up the argsLowercase (removes prefix, makes everything lowercase, removes the commandName, so everything we have left are the arguments)



    if (await exampleController.findUserCommand(bot, message, database, commandName) == true) {
      // this command will return "true" if it finds a user created command and will then send the message to the channel
      // look at /commands/example.js to see the command setup, and /lib/example.js for the command itself
      return; 
    }

// this is kind of jank, I'll be honest.
// The names of everything in /commands/database.js are all capitalized (uppercase and stuff), but the problem is, we want commands to
// be case insensitive.. But we still want the names capitalized (or camelCase, or whatever) when the user runs !help
// And *I couldn't figure out a way* to make the names of everything in /commands/database.js capitalized there, but lowercase here...

// so, we get just the NAMES of every object there
    var commandNames = Object.keys(convertKeysToLowerCase(commands)); // get all the names in lowercase, so we can search them

    // and we make sure this is a command that's included there (this is lowercase!) 
    if (!commandNames.includes(commandName)) {
      return;
    }
    // and then we save the INDEX of the command where the correct name is 
    // now that I think about it, I'm pretty sure I could've merged the 3 lines above and the lower one, but this looks a lot better
    var indexOfCommand = commandNames.indexOf(commandName); // get the INDEX of the correct command, then use that for everything else, since capitalization is probably wrong

    // then we make an array of every single command...
    var commandsArray = [];
    for (var i in commands) { // make a commandsArray so we can go to the index of the command
      commandsArray.push(commands[i]);
    }
    // and then we find that command, where it's capitalized! It works. Don't question the jank.
    const command = commandsArray[indexOfCommand];

    if (!!command.requirements) { // this deals with command requirements, and makes sure all of the command requirements are true
      for (let i = 0; i <= command.requirements.length - 1; i++) {
        if (!await command.requirements[i](bot, message, argsLowercase, content)) {
          console.log('The requirement: "' + commandName + '" has failed');
          return;
        }
      }
    }
    // Everything under here runs the command itself 
    try {
      var content = message.content;
      content = content.replace(commandPrefix, '');
      content = content.replace(commandName, '');

      if (argsLowercase[0] == '') { argsLowercase.shift(); } // if the 0th array in the array is empty, this removes it.
      // it happens a lot (or atleast used to), and this was my quick-fix. Probably should check this again in the future.

      var result = await command.execute(bot, message, argsLowercase, content); 

      if (!!result && result.hasOwnProperty('then') && typeof result.then === 'function') {
        result = await result;
      }
    } catch (e) {
      // if there's an error, this will return a message to the user, and if it's production (production = true), it'll even message you in DMs! (if you're in the server)
      await databaseController.sendErrorEmbed(bot, message, 'ERROR', 'You should never see this... Uhhh.. Sorry. To sate your curiousity, here\'s the error.\n' + e.message);
      if (production) {
        console.log('Error found in production code... That\'s not good.\n' + e.message);
        if (messageDeveloper) { // if you have a popular bot, you might not be in the same server as the bot, then this would throw a massive error, because it can't find your user, based on your ID.
          await databaseController.sendErrorEmbed(bot, message, 'ERROR', 'Error found in production code... That\'s not good.\n' + e.message); 
        }
      }
      // if we have any 
    }

  })();
});

const token = process.env.DISCORD_BOT_SECRET;
bot.login(token);



function convertKeysToLowerCase(obj) {
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames
  var output = {};
  for (i in obj) {
    if (Object.prototype.toString.apply(obj[i]) === '[object Object]') {
      output[i.toLowerCase()] = convertKeysToLowerCase(obj[i]);
    } else if (Object.prototype.toString.apply(obj[i]) === '[object Array]') {
      output[i.toLowerCase()] = [];
      output[i.toLowerCase()].push(convertKeysToLowerCase(obj[i][0]));
    } else {
      output[i.toLowerCase()] = obj[i];
    }
  }
  return output;
};