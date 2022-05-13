const Groups = require('./models/grupos');
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
    try {
      let idChat = ctx.update.message.chat.id
      let titleChat = ctx.update.message.chat.title
      if(ctx.update.message.chat.type === 'group'){
        let searchResult = await validateGroup(idChat)
        if(searchResult) {
          return bot.telegram.sendMessage(ctx.chat.id, 'El grupo no esta registrado. Para agregarlo envie el comando /agregarGrupo seguido del valor de la unidad')
        }
      }

      if (ctx.startPayload === '') {
        if (ctx.update.message.from.id === ctx.update.message.chat.id) {
          return ctx.reply('Este mensaje solo funciona desde un grupo')
        }

        let searchResult = await validateGroup(idChat)

        if(searchResult) {
          return bot.telegram.sendMessage(ctx.chat.id, 'El grupo no esta registrado. Para agregarlo envie el comando /agregarGrupo seguido del valor de la unidad')
        }

        let some = gruposRegistred.some(res => res.idChat === idChat);
        if (some === false) {
          data = gruposRegistred.push({
            idChat: idChat,
            titleChat: titleChat
          });
        }


        return bot.telegram.sendMessage(ctx.chat.id, 'enviar tarea', {
          reply_markup: {
            inline_keyboard: [
              [{
                text: "Enviar tarea",
                url: `https://t.me/Ciwokcobot?start=${idChat}`
              }]
            ]
          }
        })
      }

      let idUser = ctx.message.from.id
      let groupId = ctx.startPayload
      let checkUser = usersActives.some(res => res.idUser === idUser)
      if (checkUser === false) {
        usersActives.push({
          idUser: idUser,
          idChat: Number(groupId)
        })
      }

      bot.telegram.sendMessage(ctx.chat.id, 'Listado de tareas por Tipos de servicio', {
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


async function validateGroup(data) {
  let response = await Groups.find({id:data});
  if(response.length === 0){
     return true
  }
  return false
}
