let Discord = require('discord.js')
let Config = require('./config.json')
let FS = require('fs')
let Client = new Discord.Client({intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_VOICE_STATES']})

Client.login(Config.Token)

let Net = require('net')
let client = new Net.Socket()

let lastMessage

Client.on("messageCreate", msg => {
  if (msg.author.bot) return;
  if (msg.channelId=="991953821158883418") {
    if (/^[A-Za-z0-9]+$/.test(msg.content)) {
      lastMessage = msg
      client.connect(25560, "localhost", () => {
        client.write(msg.content)
        client.end()
      })
      client.on('error', err => {
        msg.channel.send(`<@${msg.author.id}> The server is down!`)
      })
    } else {
      msg.channel.send(`<@${msg.author.id}> The username "${msg.content}" is invalid!`)
    }
  }
})

client.on("data", data => {
  Client.channels.fetch("991953821158883418").then(channel => {
    if (data.toString().includes("already")) {
      channel.send(`<@${lastMessage.author.id}> ${data.toString()}`)
    } else {
      channel.send(`<@${lastMessage.author.id}> ${data.toString()}`)
      let role = lastMessage.guild.roles.cache.find(role => role.name === "Whitelisted");
      lastMessage.member.roles.add(role)
    }
  })
})

Client.on("ready", () => {
  // IP
  Client.channels.fetch("991953665927675954").then(channel => {
    FS.readFile(Config.ngrok, 'utf8', (err, data) => {
      if (err) throw err;
      channel.send(data)
    })
  })
})


// Weird VC thingy
let vcs = []

Client.on("voiceStateUpdate", (oldMember, newMember) => {
  if (newMember.channelId != null) {
    if (!vcs.includes(newMember.channelId)) vcs.push(newMember.channel)
    newMember.channel.clone().then(channel => {
      vcs.push(channel)
    })
  }
  if (oldMember.channel != null && oldMember.channel.members.size == 0) {
    vcs.splice(vcs.indexOf(oldMember.channel), 1)
    oldMember.channel.delete()
  }
  vcs.forEach(vc => {
    if (vc.id != null && vc.members.size == 0) {
      vc.delete()
    }
    vcs.splice(vcs.indexOf(vc), 1)
  })
})