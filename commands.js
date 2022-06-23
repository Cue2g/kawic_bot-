const Groups = require('./models/grupos');
const UserActives = require('./models/userActives')

const {Telegraf} =  require('telegraf');

const botlog = new Telegraf('5321920688:AAE64qi6LDimzxr-aaQjWUbr1U0IVLMCBew');

module.exports = function(bot) {

  const tiposDeServicioJson = require('./dataActividades/tiposDeServicios.json');
  const allOptions = tiposDeServicioJson.map( res => res.name)
  const tiposDeServicios = orderListMessage(tiposDeServicioJson, 2)
  const si = require('./controllers/controllers.js')
  var conditionToStopEaringMessages = true;
  var usersActives = [];
  var gruposRegistred = [];
  var optionsRegistred = [];




  bot.start((async ctx => {
    const date = new Date().toISOString();
    const messageChatId     = ctx.update.message.chat.id;
    const messageChatTittle = ctx.update.message.chat.title;
    const messageChatType   = ctx.update.message.chat.type;
    const messageFromId     = ctx.update.message.from.id;
    const chatId = ctx.chat.id
    const startPayload = ctx.startPayload === '' ? true : false;

    console.log({
      messageChatId,
      messageChatTittle,
      messageChatType,
      startPayload,
    })

    try {

      if(messageChatType === 'group'){
        const searchResult = await validateGroup(messageChatId);
        console.log(searchResult)
        if(!searchResult) {
          return bot.telegram.sendMessage(chatId, 'El grupo no esta registrado. Para agregarlo envie el comando /agregarGrupo seguido del valor de la unidad')
        }
      }

      if (startPayload) {

        if (messageFromId === messageChatId) {
          return ctx.reply('Este mensaje solo funciona desde un grupo');
        }

        const searchResult = await validateGroup(messageChatId);

        if(!searchResult) {
          return bot.telegram.sendMessage(chatId, 'El grupo no esta registrado. Para agregarlo envie el comando /agregarGrupo seguido del valor de la unidad')
        }

        const searchActives = await validateActives(messageChatId);

        if (!searchActives) {

          const data = {
            messageChatId,
            messageChatTittle,
            dateRegister: date
          }

          const userActivesDB = new UserActives(data)
          await userActivesDB.save()
        }


        return bot.telegram.sendMessage(chatId, 'enviar tarea', {
          reply_markup: {
            inline_keyboard: [
              [{
                text: "Enviar tarea",
                url: `https://t.me/azabache_bot?start=${messageChatId}`
              }]
            ]
          }
        })
      }

      // const idUser = ctx.message.from.id
      // let groupId = ctx.startPayload
      // let checkUser = usersActives.some(res => res.idUser === idUser)
      // if (checkUser === false) {
      //   usersActives.push({
      //     idUser: idUser,
      //     messageChatId: Number(groupId)
      //   })
      // }

      bot.telegram.sendMessage(chatId, 'Listado de tareas por Tipos de servicio', {
        reply_markup: {
          inline_keyboard: tiposDeServicios
        }
      })
    } catch (e) {
      const date = new Date();
      botlog.telegram.sendMessage(100799949,{
        error:e.message,
        parte:'split',
        fecha: date
      })
      console.log(e)
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

  bot.action('stopBot', ctx => {
    conditionToStopEaringMessages = true;
    ctx.reply('Lectura de actividades detenida');
  })

  bot.action(allOptions, async ctx => {
    try {

      const option = ctx.match[0];
      const callbackQueryData = ctx.update.callback_query;
      const nameUser = callbackQueryData.from.username
      const idUser = callbackQueryData.from.id

      let someOption = optionsRegistred.some(res => res.idUser === idUser);

      conditionToStopEaringMessages = false;

      if (someOption) {
        optionsRegistred.forEach((res) => {
          if (res.idUser === idUser) {
            res.option = option
          }
        });
      } else {
        optionsRegistred.push({
          idUser: idUser,
          option: option,
          nameUser: nameUser
        })
      }


      await ctx.deleteMessage()

      ctx.reply(`>>>Ha seleccionado: ${option}<<<

      Ingrese la persona y la cantidad
        `);

      bot.on('text', async (ctx) => {
        let idUserOnText = ctx.message.from.id
        let some = usersActives.some(res => res.idUser === idUserOnText);
        let data;

        if (some === false) {
          return
        }

        data = usersActives.find(res => res.idUser === idUserOnText);

        if (ctx.update.message.from.id != ctx.update.message.chat.id) {
          return
        }

        let checkUser = usersActives.some(res => ctx.update.message.from.id === res.idUser)
        if (conditionToStopEaringMessages === false && checkUser === true) {
          let optionInfo = optionsRegistred.find(res => res.idUser === ctx.message.from.id);
          let response = await si.split(ctx, optionInfo.option, optionInfo.nameUser, data, gruposRegistred, tiposDeServicioJson);

          if (response == true) {
            usersActives = usersActives.filter(res => res.idUser !== ctx.message.from.id);
            optionsRegistred = optionsRegistred.filter(res => res.idUser !== ctx.message.from.id);
          }
          console.log(usersActives);
          console.log(gruposRegistred)
        }

      });
    } catch (e) {
      const date = new Date();
      botlog.telegram.sendMessage(100799949,{
        error:e.message,
        parte:'split',
        fecha: date
      })
      console.log(e)
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
  const response = await UserActives.find({messageChatId:messageChatId});
  const validate = response.length > 0 ? true : false;
  return validate
}
