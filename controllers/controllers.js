const {
  Telegraf
} = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN)
const func = require('./function.js')
const Groups = require('../models/grupos')





exports.split = async (ctx, option, nameUser, data, gruposRegistred, groups) => {
  let datosUser = data
  let responseText = ctx.update.message.text
  let valorFind = groups.find(res => res.name === option);
  let valorTarea = valorFind.valor
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

  let cantidad = splitR[1] * valorTarea;
  let response = await Groups.find({id:nameGArray.idChat});
  let valorGrupo = response[0].valor
  let valorTotal = valorGrupo * cantidad

  let body = {
    usuario: splitR[0].slice(1),
    tarea: option,
    grupo: nameGrupo,
    autor: nameUser,
    cantidad: valorTotal.toFixed(2),
    fecha: ctx.update.message.date.toString(),
    cct_status: "publish"
  }

  ctx.reply(body)
  // let respuesta = await func.dataSend(body);
  //
  // if (respuesta.success === true) {
  //   bot.telegram.sendMessage(datosUser.idChat, `${nameUser} creo una tarea de: ${option} y fue asignada a @${splitR[0].slice(1)} `)
  //   ctx.reply(`Registro Guardado con Exito!`)
  //   return true
  // } else {
  //   ctx.reply(`Hubo un error al guardar el registro`)
  //   console.log(respuesta);
  //   return false
  // }

}

exports.agregarGrupo = async (ctx) => {
  let text = ctx.update.message.text
  let responseGroup = await Groups.find({id:ctx.chat.id});

  if(responseGroup.length != 0){
     return ctx.reply(`El grupo ya esta registrado`)
  }

  let splitFun = text.split(`/agregarGrupo `)

  if (splitFun.length < 2) {
    return ctx.reply(`El valor se encuentra vacio`)
  }

  let valor = splitFun[1].split(" ")
  if (valor.length > 1) {
    return ctx.reply(`El formato del valor es incorrecto`)
  }


  let typeValor = isNaN(valor[0]);
  if (typeValor) {
    return ctx.reply(`El formato del valor es incorrecto`)
  }

  let valorGroup = valor[0]

  let data = {
    valor: valorGroup,
    id: ctx.chat.id,
    tittle: ctx.chat.title
  }

  try {
    const groupDB = new Groups(data)
    await groupDB.save()
    return ctx.reply(`Se a guardado el grupo con exito`)
  } catch (e) {
    return ctx.reply(`Error al guardar el grupo`)
  }
}

exports.tarea = async (ctx) => {
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

  console.log(splitR[2]);

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

}
