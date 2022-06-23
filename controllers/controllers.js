const {
  Telegraf
} = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN)
const func = require('./function.js')
const Groups = require('../models/grupos')
const botlog = new Telegraf('5321920688:AAE64qi6LDimzxr-aaQjWUbr1U0IVLMCBew');

exports.split = async (ctx, option, nameUser, data, gruposRegistred, groups) => {
 try {
   let datosUser = data
   let responseText = ctx.update.message.text
   let valorFind = groups.find(res => res.name === option);
   let valorTarea = valorFind.valor
   let nameGArray = gruposRegistred.find(res => res.idChat === datosUser.idChat)
   console.log(nameGArray)
   if(nameGArray === []){
     return ctx.reply('Error en el registro. Ingrese /start en el grupo correspondiente e inicie el proceso nuevamente')
   }

   let nameGrupo = nameGArray.titleChat ? nameGArray.titleChat : undefined;

   if(nameGrupo === undefined){
     return ctx.reply('hubo un error a la hora de obtener el nombre del grupo, inicie el proceso nuevamente.')
   }
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

   let valorTotal = 0;
   if(option === 'Sesion de Fotos'){
     let cantidad = splitR[1]
     valorTotal = 10 * cantidad
   }else{
     let cantidad = splitR[1] * valorTarea;
     let response = await Groups.find({id:nameGArray.idChat});

     if(response === []){
       return ctx.reply('error al capturar el valor del grupo, por favor inicie el proceso nuevamente.')
     }
     let valorGrupo = response[0].valor
     valorTotal = valorGrupo * cantidad
   }

   let body = {
     usuario: splitR[0].slice(1),
     tarea: option,
     grupo: nameGrupo,
     autor: nameUser,
     cantidad: splitR[1],
     monto: valorTotal.toFixed(2),
     fecha: ctx.update.message.date.toString(),
     cct_status: "publish",
     tipo_de_pago:"tarea"
   }

   let respuesta = await func.dataSend(body);
   if (respuesta.success === true) {

     bot.telegram.sendMessage(datosUser.idChat, `@${nameUser} creo una tarea de:
${option}
Fue asignada a @${splitR[0].slice(1)}
cantidad:${body.cantidad} `)

     ctx.reply(`Registro Guardado con Exito!`)
     return true
   } else {
     ctx.reply(`Hubo un error al guardar el registro`)
     console.log(respuesta);
     return false
   }

  //  only debugger

  //  bot.telegram.sendMessage(datosUser.idChat, body)
  //  console.log(body)
  // ctx.reply(`Registro Guardado con Exito!`)


 } catch (e) {
   const date = new Date();
   botlog.telegram.sendMessage(100799949,{
     error:e.message,
     parte:'split',
     fecha: date
   })
   return ctx.reply('error al capturar el valor del grupo, por favor inicie el proceso nuevamente.')
 }
}

exports.agregarGrupo = async (ctx) => {
  try {
    const messageText = ctx.update.message.text
    const chatId = ctx.chat.id
    const chatTitle = ctx.chat.title

    const responseGroup = await Groups.find({id:chatId});

    if(responseGroup.length != 0){
       return ctx.reply(`El grupo ya esta registrado`)
    }

    const splitFun = messageText.split(`/agregarGrupo `)
   
    if (splitFun.length < 2) {
      return ctx.reply(`El valor se encuentra vacio`)
    }

    const valor = splitFun[1].split(" ")
    if (valor.length > 1) {
      return ctx.reply(`El formato del valor es incorrecto`)
    }


    const typeValor = isNaN(valor[0]);
    if (typeValor) {
      return ctx.reply(`El formato del valor es incorrecto`)
    }

    const valorGroup = valor[0]

    const data = {
      valor: valorGroup,
      id: chatId,
      chatTitle
    }

    const groupDB = new Groups(data)

    await groupDB.save()

    return ctx.reply(`Se a guardado el grupo con exito`)
    
  } catch (e) {
    const date = new Date();
    botlog.telegram.sendMessage(100799949,{
      error:e.message,
      parte:'split',
      fecha: date
    })
    return ctx.reply(`Error al guardar el grupo`)
  }
}

exports.tarea = async (ctx) => {
  try {
    responseText = ctx.update.message.text
    let splitR = func.splitT(responseText, "/tarea")

    if (splitR === undefined) {
      return ctx.reply('sin datos')
    }

    let userMenition = splitR[0].charAt(0)

    if (userMenition != '@') {
      return ctx.reply('ingrese un usuario valido')
    }

    if (splitR[1] === undefined) {
      return ctx.reply('Tarea no ingresada')
    }

    if (splitR[2] === undefined) {
      return ctx.reply('Cantidad no ingresada')
    }

    const validarGrupo = (grupo) => {
      if (grupo === undefined) {
        return {
          usuario: splitR[0].slice(1),
          tarea: splitR[1],
          grupo: ctx.update.message.chat.title,
          autor: ctx.update.message.from.username,
          cantidad: splitR[2],
          fecha: ctx.update.message.date.toString(),
          cct_status: "publish"
        }
      }
      return {
        usuario: splitR[0].slice(1),
        tarea: splitR[1],
        grupo: grupo,
        autor: ctx.update.message.from.username,
        cantidad: splitR[2],
        fecha: ctx.update.message.date.toString(),
        cct_status: "publish"
      }
    }

    let body = validarGrupo(splitR[3]);

    let respuesta = await func.dataSend(body);

    if (respuesta.success === true) {
      return ctx.reply(`Registro Guardado con Exito!`)
    } else {
      return ctx.reply(`Hubo un error al guardar el registro`)
    }
  } catch (e) {
    const date = new Date();
    botlog.telegram.sendMessage(100799949,{
      error:e.message,
      parte:'split',
      fecha: date
    })
    return ctx.reply(`Hubo un error al guardar el registro`)
  }
}
