module.exports = function(bot) {
  const tipoDeContenidoJson = require('./dataActividades/tipoDeContenido.json');
  const tiposDeServicioJson = require('./dataActividades/tiposDeServicios.json');
  const tipoDeContenido = orderListMessage(tipoDeContenidoJson);
  const tiposDeServicios = orderListMessage(tiposDeServicioJson)
  const si= require('./controllers/controllers.js')
  var conditionToStopEaringMessages = true;
  var usersActives = [];
  var gruposRegistred = []


  bot.start((ctx => {
    let idChat = ctx.update.message.chat.id
    let titleChat = ctx.update.message.chat.title

    if(ctx.startPayload === ''){

      if(ctx.update.message.from.id === ctx.update.message.chat.id){
        return ctx.reply('Este mensaje solo funciona desde un grupo')
      }

      let some = gruposRegistred.some(res => res.idChat === idChat);
      let data;
      if (some === false) {
        data = gruposRegistred.push({idChat:idChat, titleChat:titleChat});
      }
      return bot.telegram.sendMessage(ctx.chat.id, 'enviar tarea', {
        reply_markup:{
          inline_keyboard:[
            [
              {text:"Enviar tarea", url:`https://t.me/PiripichoPues_bot?start=${idChat}`}
            ]
          ]
        }
      })
    }
    let idUser = ctx.message.from.id
    let groupId = ctx.startPayload
    let checkUser = usersActives.some( res => res.idUser === idUser)
    if(checkUser === false){
      usersActives.push({idUser: idUser, idChat: Number(groupId)})
    }

    bot.telegram.sendMessage(ctx.chat.id, 'Listado de tareas por Tipos de contenido RRSS', {
      reply_markup:{
        inline_keyboard:tiposDeServicios
      }
    })
  }))


  bot.action('stopBot', ctx => {
    conditionToStopEaringMessages = true;
    ctx.reply('Lectura de actividades detenida');
  })

  bot.action(tiposDeServicioJson, async ctx => {
    let option = ctx.match[0]
    let nameUser = ctx.update.callback_query.from.username
    let idUser = ctx.update.callback_query.from.id
    let group = ctx.update.callback_query.message.chat.title
    let checkUser = usersActives.some(res => idUser === res.idUser)
    conditionToStopEaringMessages = false;
    await ctx.deleteMessage()
    ctx.reply(`Ha seleccionado: ${option}`);
    ctx.reply(`ingrese la persona y la cantidad`);
    bot.on('text', async (ctx) => {
      let idUserOnText = ctx.update.callback_query.from.id
      let some = usersActives.some(res => res.idUser === ctx.message.from.id);
      let data;
      if (some) {
        data = usersActives.find(res => res.idUser === ctx.message.from.id);
      }

      if(some === false){
        return
      }

      if(ctx.update.message.from.id != ctx.update.message.chat.id){
        return
      }

      if (conditionToStopEaringMessages === false && checkUser === true)
      {
        let response = await si.split(ctx,option,nameUser,data,gruposRegistred)
        if(response == true){
          usersActives = usersActives.filter(res => idUserOnText !== ctx.message.from.id);
        }
        console.log(usersActives);
      }

    });
  })
}

function orderListMessage(array) {
  let response = array.map( val => [{text:val, callback_data:val}])
  return response
}
