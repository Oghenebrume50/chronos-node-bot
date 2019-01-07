require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');
const bot =  new Discord.Client();

//gets the unit of the time 
function unit(command) {
    const timeValue = command.match(/\d+/g)[0].length;
    const oldValue = command.slice(command.search(/\d+/) + timeValue);
    const timeUnit = command
    .slice(command.search(/\d+/) + timeValue, command.search(/\d+/) + timeValue + oldValue.search(/\s+/));

    return timeUnit;
}

//gets the value of the time
function time(command) {
    const timeValue = command.match(/\d+/g)[0];
    
    return Number(timeValue);
}

//gets the message to be sent
function details (command) {
    const notify = command.slice(command.indexOf('(')+1, command.indexOf(')'));

    return notify;
}

//gets the details of the receiver or receiving channel
function getReceiver (sender, sendingChannel, command) {
    let receiver = command.split(/\s+/)[1].replace(/-/g,' ');
    
    if (receiver === 'ME')
    {
        return sender;
    } 
    else if (receiver === 'US')
    {
        return sendingChannel;
    }
    else
    {
        let server = receiver.slice(1);
        
        
        let inputtedChannel = command.split(/\s+/)[2].slice(1);
        
        if (command.split(/\s+/)[2].startsWith('@'))
        {
            let receivingServer = bot.guilds.filter(guild => guild.name.toUpperCase() === server);
            let receivingServerId = receivingServer.map(h => h.id)[0];
            let receivingChannelId = receivingServer.map(server => server.channels)[0]
            .filter(channel => channel.name.toUpperCase() === inputtedChannel && channel.type === 'text')
            .map(channelId => channelId.id)[0];

            return bot.guilds.get(receivingServerId).channels.get(receivingChannelId);
        }
        else
        {
            let inputtedMember = command.split(' ')[1].slice(1);
            receiver = bot.users.filter(user => user.username.toUpperCase() === inputtedMember)
            .map(userId => userId.id)[0];

            return bot.users.get(receiver);
        }
        
    }
}

function computeReturn (sender, sendingChannel, command) {
    if (unit(command) === 'SEC' || unit(command) === 'SECS')
    {
        let waitingSecs = time(command);
        setTimeout(function() {
            getReceiver(sender, sendingChannel, command).send('**Reminder:** '+details(command).toLowerCase());
        }, waitingSecs * 1000);
    }
    else if (unit(command) === 'MIN' || unit(command) === 'MINS')
    {
        let waitingMins = time(command);
        setTimeout(function() {
            getReceiver(sender, sendingChannel, command).send('**Reminder:** '+details(command).toLowerCase());
        }, waitingMins * 60 * 1000);
    }
    else if (unit(command) === 'HR' || unit(command) === 'HRS')
    {
        let waitingHrs = time(command);
        setTimeout(function() {
            getReceiver(sender, sendingChannel, command).send('**Reminder:** '+details(command).toLowerCase());
        }, waitingHrs * 60 * 60 * 1000);
    }
}

//When bot is ready to fire
bot.on('ready', () => {
    console.log('Chronos controls the time');
});



bot.on('message', message => {
    const prefix = process.env.PREFIX;
    const sender = message.author;
    const sendingChannel = message.channel;
    const msg = message.content.toUpperCase();
    

    if (message.author.bot) return;

    if (msg === prefix+'HELP CHRONOS')
    {    
        let commandList = fs.readFileSync('./storage/commands.txt', 'utf8');

        message.channel.send({embed: {
            title: "How to use chronos",
            description: commandList
        }});
    }
    else if (msg.startsWith(prefix+'REMIND'))
    {
        computeReturn(sender, sendingChannel, msg);
    }
});

bot.login()