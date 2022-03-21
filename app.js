require('dotenv').config()
const {Telegraf} =  require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN)
const mongoose = require('mongoose');
const commands = require('./commands.js')

// const userbd = process.env.USER,
//         pwbd = process.env.PW,
//       bdname = `cibotdata`;
const uri = `mongodb+srv://ciBotApi:IYq8J50Tagk5D2Pz@cluster0.4qxcs.mongodb.net/cibotdata?retryWrites=true&w=majority`;

commands(bot)

mongoose.connect(uri)
  .then(() => console.log('conexion a mongo establecida'))
  .then(() => {
    bot.launch()
    console.log('Bot Ready')
  })
  .catch( e => console.log(
    {
        mensaje: `Error de conexion`,
        data: e
    }
  ));
