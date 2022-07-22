const Groups = require('./models/grupos');
const UserActives = require('./models/userActives')
const {Telegraf} =  require('telegraf');
const botlog = new Telegraf(process.env.BOT_TOKEN_LOG);

module.exports = function(bot) {

  const tiposDeServicioJson = require('./dataActividades/tiposDeServicios.json');
  const allOptions = tiposDeServicioJson.map( res => res.name)
  const tiposDeServicios = orderListMessage(tiposDeServicioJson, 2)
  const si = require('./controllers/controllers.js')

  bot.start((async ctx => {
    
    const messageChatId     = ctx.update.message.chat.id;
    const messageChatUsername = ctx.update.message.chat.username;
    const messageChatType   = ctx.update.message.chat.type;
    const messageFromId     = ctx.update.message.from.id;
    const chatId = ctx.chat.id
    const startPayloadStatus = ctx.startPayload === '' ? true : false;
    const startPayload = ctx.startPayload

    try {

      if(messageChatType === 'group'){
        const searchResult = await validateGroup(messageChatId);
        if(!searchResult) {
          return bot.telegram.sendMessage(chatId, 'El grupo no esta registrado. Para agregarlo envie el comando /agregarGrupo seguido del valor de la unidad')
        }
      }

      if (startPayloadStatus) {

        if (messageFromId === messageChatId) {
          return ctx.reply('Este mensaje solo funciona desde un grupo');
        }

        const searchResult = await validateGroup(messageChatId);

        if(!searchResult) {
          return bot.telegram.sendMessage(chatId, 'El grupo no esta registrado. Para agregarlo envie el comando /agregarGrupo seguido del valor de la unidad')
        }

        return bot.telegram.sendMessage(chatId, 'enviar tarea', {
          reply_markup: {
            inline_keyboard: [
              [{
                text: "Enviar tarea",
                url: `https://t.me/${process.env.BOTNAME}?start=${messageChatId}`
              }]
            ]
          }
        })
      }

      const searchActives = await validateActives(messageChatId);

        if (!searchActives) {

          const data = {
            userID: messageFromId,
            userUsername: messageChatUsername,
            groupID: Number(startPayload),
            dateActive: new Date
          }

          const userActivesDB = new UserActives(data)
          await userActivesDB.save()
          
        }else{

          await UserActives.updateOne({userID: messageFromId},
             { groupID: Number(startPayload),dateActive: new Date,option:"none"});
        }

      bot.telegram.sendMessage(chatId, 'Listado de tareas por Tipos de servicio', {
        reply_markup: {
          inline_keyboard: tiposDeServicios
        }
      })

    } catch (e) {
      botlog.telegram.sendMessage(100799949,`Error at command - start: ${e.message}`);
    }
  }))

  bot.command('/tarea', (ctx) => {
    si.tarea(ctx);
  }) 

  bot.command('/agregarGrupo',(ctx) => {
    si.agregarGrupo(ctx);
  })

  bot.command('/ayuda', (ctx) => {
    ctx.reply('Opcion 1: Para enviar la información se ejecuta con la siguiente estrucutra:\n /tarea @alias, Tarea, Cantidad, Grupo(opcional) \n\n Opcion 2: Envia /start y luego seleciona enviar tarea. Será dirigido a un chat con el bot donde tiene que presionar start, luego seleccionar la actividad y por ultimo enviar el nombre y la cantidad.')
  })



  bot.action(allOptions, async ctx => {

    try {
      const option = ctx.match[0];
      const callbackQueryData = ctx.update.callback_query;
      const callbackFromid = callbackQueryData.from.id; /// idUser
      const searchActives = await validateActives(callbackFromid);
      
      if(!searchActives){
        await ctx.deleteMessage().then((response) => response, ({ response }) => response.ok)
        return  
      }

      await UserActives.findOneAndUpdate({userID:callbackFromid }, {option: option});
      conditionToStopEaringMessages = false;
      
      await ctx.deleteMessage().then((response) => response, ({ response }) => response.ok)

      ctx.reply(`>>>Ha seleccionado: ${option}<<<

      Ingrese la persona y la cantidad
        `);

      bot.on('text', async (ctx) => {
        const messageFromIdText = ctx.update.message.from.id
        const messageChatIdText = ctx.update.message.chat.id
        const messageTextText = ctx.update.message.text
        const idUserOnText = ctx.message.from.id
        const searchActives = await validateActives(callbackFromid);
        
        if (!searchActives) {
          return 
        }

        if (messageFromIdText != messageChatIdText) {

          return
        }

        const response = await si.sendData(idUserOnText, messageTextText, ctx);
        if(response){
          await UserActives.deleteOne({userID:idUserOnText})
        }
        return 
      });
    } catch (e) {
      botlog.telegram.sendMessage(100799949,`Error at command - action: ${e.message}`);
    }
  })
}

function orderListMessage(array, colum) {
  let response = array.map(val => {
    return {
      text: val.name,
      callback_data:val.name,
    }
  })

  let arrayR = []
  response.forEach(res => {
    if (arrayR.length === 0) {
      arrayR.push([res])
    } else {
      if (arrayR[arrayR.length - 1].length < colum) {
        arrayR[arrayR.length - 1].push(res)
      } else {
        arrayR.push([res])
      }
    }
  });

  return arrayR
}


async function validateGroup(id) {
  const response = await Groups.find({id:id});
  const validate = response.length > 0 ? true : false;
  return validate
}

async function validateActives(messageChatId) {
  const response = await UserActives.find({userID:messageChatId});
  const validate = response.length > 0 ? true : false;
  return validate
}


