module.exports = function(bot) {

  const si= require('./controllers/controllers.js')

  bot.start((ctx => {
    ctx.reply('Bienvenidos, para enviar la información se ejecuta con la siguiente estrucutra: \n \n /tarea @alias, tarea, Cantidad')
  }))

  bot.command('/tarea',(ctx) => {
    si.split(ctx)
  })

  bot.command('/ayuda',(ctx) => {
    ctx.reply('Para enviar la información se ejecuta con la siguiente estrucutra: \n \n /tarea @alias, tarea, Cantidad')
  })
}
