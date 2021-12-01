require('dotenv').config()
const {Telegraf} =  require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN)
const commands = require('./commands.js')

commands(bot)

bot.launch()
console.log('start server');
