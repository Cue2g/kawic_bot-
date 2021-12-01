module.exports = function(bot) {

  const si= require('./controllers/controllers.js')

  bot.start((ctx => {
    ctx.reply('Bienvenidos, para enviar la informacion')
  }))

  bot.command('/comisiones',(ctx) => {
    si.split(ctx)
  })
}
