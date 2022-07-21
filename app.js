require('dotenv').config();
const {Telegraf} =  require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);
const botlog = new Telegraf(process.env.BOT_TOKEN_LOG);
const mongoose = require('mongoose');
const commands = require('./commands.js');
const cron = require('node-cron');
const jobs = require('./jobs');

const userbd = process.env.USERBD,
        pwbd = process.env.PW,
      bdname = process.env.BDNAME;

const uri    = `mongodb+srv://${userbd}:${pwbd}@cluster0.4qxcs.mongodb.net/${bdname}?retryWrites=true&w=majority`;

commands(bot)

mongoose.connect(uri)
  .then(() => console.log('conexion a mongo establecida'))
  .then(() => {
    bot.launch()
    botlog.launch()
    cron.schedule('*/1 * * * *', () => {
      jobs.userActivesCheck(bot)
    });
    console.log('Bot Ready');
  })
  .catch( e => console.log(
    {
        mensaje: `Error de conexion`,
        data: e
    }
  ));

  
