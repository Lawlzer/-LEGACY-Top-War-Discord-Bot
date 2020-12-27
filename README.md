## Template-Discord-Bot

Template-Discord-Bot is a discord bot created to mainly help myself in the future, but also yourself, if you wish to use it.

## Initial Setup

- Download all of the files
- Create a .env in the main folder: `/Template-Discord-Bot/.env`
- In that env, insert your `MONGODB_URI` and `DISCORD_BOT_SECRET` - example: 
(Your MONGODB_URI can partially be found in cloud.mongodb.com --> collections --> Command Line Tools --> Connect Instructions --> Connect Your Application --> Copy) 
(Your Discord Bot Secret can be found at `https://discord.com/developers/applications` --> Create a new application, select it --> Bot --> Token (Copy) )
    - (example .env file)
    MONGODB_URI=mongodb+srv://yourUsername:yourPassword@yourMongoClusterName-ljhef.mongodb.net/yourMongoCollectionName?retryWrites=true
    DISCORD_BOT_SECRET=yourBotSecret
	
	
- !TODO : Add everything with Heroku, and how to add it to Github

## Usage

- Do everything in ##Installation 

- In `index.js`, change the bot invite link (or delete it if you want) (To get your client ID, go to `https://discord.com/developers/applications` --> select your application --> General Information --> Client Id (Copy))
- In `index.js`, in `bot.on`, look at `bot.user.setActivity`. There's a piece of commented code you can uncomment, and a basic example.

- Run the bot using Node.js (navigate in your CLI to the folder, then run `node index.js`)

- Everything with this bot should work fine, without errors. If anything has an error or whatever, message me on Discord, please.
- In `/lib/example`, there are a few commands that you can comment/delete if you want. (They're example commands to show you how you might add, and deal with, the database)

## Author
Lawlzer is the main author of this code. If you want to contact him (me) at any point, for any reason, message Lawlzer#4013 on Discord.

## Support 
Lawlzer is willing to help you with any questions you have, or anything at all, if you message him on Discord. Read ##Author

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[![License: WTFPL](https://img.shields.io/badge/License-WTFPL-brightgreen.svg)](http://www.wtfpl.net/about/)