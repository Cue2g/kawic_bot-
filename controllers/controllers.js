const {
  Telegraf
} = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);
const func = require('./function.js');
const Groups = require('../models/grupos');
const botlog = new Telegraf(process.env.BOT_TOKEN_LOG);
const UserActives = require('../models/userActives');
const tiposDeServicioJson = require('../dataActividades/tiposDeServicios.json');

exports.sendData = async(userIdText, text, ctx) => {
  
  try {
    const dataUser = await dataActiveUser(userIdText);
    if (!dataUser) {
      ctx.reply('Error al obtener el usuario Activo');
      return false
    }
    const user = dataUser[0];
    const option = user.option

    const dataGrupoUser = await dataGrupo(user.groupID);

    if (!dataGrupoUser) {
      ctx.reply('Error al obtener los datos del grupo');
      return false
    }
    const group = dataGrupoUser[0];
    const splitR = func.splitF(text)
    const userMenition = splitR[0].charAt(0)
    const valorFind = tiposDeServicioJson.find(servicio => servicio.name === option);
    const valorTarea = valorFind.valor

    if (userMenition != '@') {
      ctx.reply('ingrese un usuario valido');
      return false
    }
    

    if (splitR[1] === undefined) {
      ctx.reply('Cantidad no ingresada')
      return false
    }
 
    if (isNaN(splitR[1])) {
      ctx.reply('El formato de la cantidad no es un numero')
      return false
    }

    const valorEnviadoUser = splitR[1]
    const userTarea = splitR[0].slice(1)

    let valorTotal;

  
    if(option === 'Sesion de Fotos'){
      const cantidad = valorEnviadoUser
      valorTotal = 10 * cantidad
    }else{
      const cantidad = valorEnviadoUser * valorTarea;
      const valorGrupo = group.valor
      valorTotal = valorGrupo * cantidad
    }

    let body = {
      usuario: userTarea,
      tarea: option,
      grupo: group.name,
      autor: user.userUsername,
      cantidad: valorEnviadoUser,
      monto: valorTotal.toFixed(2),
      fecha: ctx.update.message.date.toString(),
      cct_status: "publish",
      tipo_de_pago:"tarea"
    };
    ctx.reply('Enviando informacion...');
    const respuesta = await func.dataSend(body);

    if (respuesta.success === true) {

      bot.telegram.sendMessage(group.id, `@${user.userUsername} creo una tarea de:
 ${option}
 Fue asignada a @${userTarea}
 cantidad:${valorEnviadoUser} `)
      ctx.reply(`Registro Guardado con Exito!`)
      return true
    } else {
      ctx.reply(`Hubo un error al guardar el registro`)
      return false
    }
  } catch (e) {
    botlog.telegram.sendMessage(100799949,`Error at controllers - sendData: ${e.message}`);
  }
}

exports.agregarGrupo = async (ctx) => {
  try {
    const messageText = ctx.update.message.text
    const chatId = ctx.chat.id
    const chatTitle = ctx.chat.title
    const messageFromId = ctx.update.message.from.id;
    const messageFromUsername = ctx.update.message.from.username
    const date = new Date()

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
      id:chatId,
      name: chatTitle,
      valor: valorGroup,
      dateRegistered: date,
      nameRegistered: messageFromUsername,
      idRegistered: messageFromId
    }


  
    const groupDB = new Groups(data)

    await groupDB.save()

    return ctx.reply(`Se a guardado el grupo con exito`)
    
  } catch (e) {
    botlog.telegram.sendMessage(100799949,`Error at command - agregarGrupo: ${e.message}`);
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
    botlog.telegram.sendMessage(100799949,`Error at command - tarea: ${e.message}`);
    return ctx.reply(`Hubo un error al guardar el registro`)
  }
}

async function dataActiveUser(messageChatId) {
  try {
    const response = await UserActives.find({messageChatId:messageChatId});
    return response
  } catch (error) {
    return false
  }
}

async function dataGrupo(idGrupo){
  try {
    const response = await Groups.find({id:idGrupo});
    return response
  } catch (error) {
    return false
  }
}
