const {
  Telegraf
} = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN)
const func = require('./function.js')
const tipoDeContenidoJson = require('../dataActividades/tipoDeContenido.json');
const tiposDeServicioJson = require('../dataActividades/tiposDeServicios.json');
const tipoDeContenido = orderListMessage(tipoDeContenidoJson);
const tiposDeServicios = orderListMessage(tiposDeServicioJson)

function orderListMessage(array) {
  let response = array.map(val => [{
    text: val,
    callback_data: val
  }])
  return response
}

bot.action(tiposDeServicioJson, ctx => {
  let option = ctx.match[0]
  let nameUser = ctx.update.callback_query.from.username
  let iduser = ctx.update.callback_query.from.id
  let group = ctx.update.callback_query.message.chat.title
  usersActives.push(iduser)
  conditionToStopEaringMessages = false;
  // ctx.reply(`el usuario ${nameUser} con el id:${iduser}, ha selecionado la actividad: ${option}` );

  bot.on('text', async (ctx) => {
    let exist = false;
    exist = usersActives.some(res => res === ctx.message.from.id)

    if (conditionToStopEaringMessages === false && exist === true) {
      let response = await si.split(ctx, option, nameUser, group)
      if (response == true) {

      }
    }
    exist = false;
  });
})

exports.start = async (ctx) => {
  let id = ctx.update.message.chat.id
  let mensaje = 'Bot start';
  if (ctx.startPayload === '') {
    return bot.telegram.sendMessage(ctx.chat.id, 'enviar tarea', {
      reply_markup: {
        inline_keyboard: [
          [{
            text: "Enviar tarea",
            url: `https://t.me/Ciwokcobot?start=${id}`
          }]
        ]
      }
    })
  }

  console.log(tiposDeServicios);
  bot.telegram.sendMessage(ctx.chat.id, 'Listado de tareas por Tipos de contenido RRSS', {
    reply_markup: {
      inline_keyboard: tiposDeServicios
    }
  })
}

exports.split = async (ctx, option, nameUser, data, gruposRegistred) => {
  let datosUser = data
  let responseText = ctx.update.message.text
  let nameGArray = gruposRegistred.find(res => res.idChat === datosUser.idChat)
  let nameGrupo = nameGArray.titleChat
  let splitR = func.splitF(responseText)
  let userMenition = splitR[0].charAt(0)

  if (userMenition != '@') {
    return ctx.reply('ingrese un usuario valido')
  }

  if (splitR[1] === undefined) {
    return ctx.reply('Cantidad no ingresada')
  }

  if (isNaN(splitR[1])) {
    return ctx.reply('El formato de la cantidad no es un numero')
  }

  let body = {
    usuario: splitR[0].slice(1),
    tarea: option,
    grupo: nameGrupo,
    autor: nameUser,
    cantidad: splitR[1],
    fecha: ctx.update.message.date.toString(),
    cct_status: "publish"
  }

  let respuesta = await func.dataSend(body);

  if(respuesta.success === true){
    bot.telegram.sendMessage(datosUser.idChat, `${nameUser} creo una tarea de: ${option} y fue asignada a @${splitR[0].slice(1)} `)
    ctx.reply(`Registro Guardado con Exito!`)
    return true
  }else{
    ctx.reply(`Hubo un error al guardar el registro`)
    console.log(respuesta);
    return false
  }

}
