require('dotenv').config()

const Discord = require('discord.js')
const emoji = require('node-emoji')

const bot = new Discord.Client()
bot.login(process.env.TOKEN)

const prefix = process.env.PREFIX
const numTarget = 5

bot.on('ready', () => {
  console.log(`[i] Bot started!`)

  bot.generateInvite([
    'READ_MESSAGE_HISTORY',
    'SEND_MESSAGES',
    'ADD_REACTIONS',
    'MANAGE_MESSAGES',
    'MANAGE_EMOJIS'
  ]).then(inv => console.log(`[i] Invite link: ${inv}`))
})

const handleReaction = (reaction, user) => {
  const msg = reaction.message

  if (!msg.author.equals(bot.user) || !msg.embeds.length || !msg.embeds[0].title.includes('Emoji Request'))
    return

  const embed = msg.embeds[0]
  const guild = msg.channel.guild
  let name = embed.fields.find(e => e.name === 'Emoji Name').value

  if (reaction.emoji.toString() === '⬆️' && reaction.count === numTarget + 1) {

    msg.delete()
      .then(() => {
        guild.emojis.create(embed.thumbnail.url, name)

        const toSend = new Discord.MessageEmbed()
        toSend.setColor('#25dd47')
        toSend.setTitle(`${emoji.random().emoji}  **Emoji Added Succesfully**`)
        toSend.setDescription(`
          Voting passed! **${name}** is now an emoji. You can type :${name}: to use it.
        `)
        toSend.setThumbnail(embed.thumbnail.url)

        msg.channel.send(toSend)
      })
  }
}

bot.on('messageReactionAdd', handleReaction)
// bot.on('messageReactionRemove', handleReaction)

bot.on('message', msg => {
  const author = msg.author
  if (author.bot)
    return

  if (msg.channel.id === process.env.CHANNEL) {
    if (msg.attachments.size === 0) {
      return
    } else if (msg.attachments.size !== 1) {
      msg.delete()
      msg.channel.send('Too many attachments!')
        .then(msg => setTimeout(() => msg.delete(), 3000))
    } else {
      const img = msg.attachments.array()[0]

      if (!img.width && !img.height) {
        msg.delete()
        msg.channel.send('Invalid attachment!')
          .then(msg => setTimeout(() => msg.delete(), 3000))
        return
      } else if (!msg.content) {
        msg.delete()
        msg.channel.send('Include the emoji name when you upload your image as a comment.')
          .then(msg => setTimeout(() => msg.delete(), 3000))
        return
      }

      const embed = new Discord.MessageEmbed()
      embed.setColor('#9c3df4')
      embed.setTitle(`${emoji.random().emoji}  **Emoji Request**`)
      embed.setDescription(`
        Upvote / downvote the emoji based on what you think.
        Emojis that get **${numTarget} upvotes** (${numTarget + 1} on the counter) will be added to the server permanently.
      `)
      embed.setThumbnail(img.url)
      embed.setFooter(author.username, author.avatarURL())

      embed.addField('Emoji Name', msg.content)

      msg.channel.send(embed)
        .then(async newMsg => {
          await newMsg.react('⬇️')
          await newMsg.react('⬆️')

          setTimeout(() => msg.delete(), 500)
        })
    }
  } else {
    if (!msg.content.startsWith(prefix))
      return
  }
})
