const {Telegraf} =  require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN)
const func = require('./function.js')

exports.split = async (ctx) => {
  responseText = ctx.update.message.text
  let splitR = func.splitF(responseText,"/comisiones")
  console.log(splitR);

  if(splitR === undefined){
    return ctx.reply('sin datos')
  }

  let userMenition = splitR[0].charAt(0)

  if(userMenition != '@'){
    return ctx.reply('ingrese un usuario valido')
  }

  if(splitR[1]===undefined){
    return ctx.reply('Tarea no ingresada')
  }

  if(splitR[2]===undefined){
    return ctx.reply('Cantidad no ingresada')
  }


  let body = {
    usuario: splitR[0].slice(1) ,
    tarea: splitR[1],
    grupo: ctx.update.message.chat.title,
    project:ctx.update.message.from.username,
    cantidad: splitR[2],
    fecha: ctx.update.message.date.toString()
  }

  let respuesta = await func.dataSend(body);

  if(respuesta.success === true){
    return ctx.reply(`Registro Guardado con Exito!`)
  }else{
    return ctx.reply(`Hubo un error al guardar el registro`)
  }

}
