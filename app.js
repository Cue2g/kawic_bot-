require('dotenv').config()
const {Telegraf} =  require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN)
const botlog = new Telegraf('5321920688:AAE64qi6LDimzxr-aaQjWUbr1U0IVLMCBew');
const mongoose = require('mongoose');
const commands = require('./commands.js')

const userbd = 'ciBotApi',
        pwbd = 'qXSJZu40GjFE8GhZ',
      bdname = `cibotdata`;
const uri    = `mongodb+srv://${userbd}:${pwbd}@cluster0.4qxcs.mongodb.net/${bdname}?retryWrites=true&w=majority`;

commands(bot)

mongoose.connect(uri)
  .then(() => console.log('conexion a mongo establecida'))
  .then(() => {
    bot.launch()
    botlog.launch()
    console.log('Bot Ready');
  })
  .catch( e => console.log(
    {
        mensaje: `Error de conexion`,
        data: e
    }
  ));
