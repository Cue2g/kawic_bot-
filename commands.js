module.exports = function(bot) {
  const tipoDeContenidoJson = require('./dataActividades/tipoDeContenido.json');
  const tiposDeServicioJson = require('./dataActividades/tiposDeServicios.json');
  const allOptions = require('./dataActividades/AllOptions.json')
  const tipoDeContenido = orderListMessage(tipoDeContenidoJson,2);
  const tiposDeServicios = orderListMessage(tiposDeServicioJson, 2)

  const si = require('./controllers/controllers.js')
  var conditionToStopEaringMessages = true;
  var usersActives = [];
  var gruposRegistred = [];
  var optionsRegistred = [];


  bot.start((ctx => {
    let idChat = ctx.update.message.chat.id
    let titleChat = ctx.update.message.chat.title

    if (ctx.startPayload === '') {

      if (ctx.update.message.from.id === ctx.update.message.chat.id) {
        return ctx.reply('Este mensaje solo funciona desde un grupo')
      }

      let some = gruposRegistred.some(res => res.idChat === idChat);
      let data;
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


  }))


  bot.action('stopBot', ctx => {
    conditionToStopEaringMessages = true;
    ctx.reply('Lectura de actividades detenida');
  })

  bot.action(allOptions, async ctx => {
    const option = ctx.match[0];
    const callbackQueryData = ctx.update.callback_query;
    const nameUser = callbackQueryData.from.username
    const idUser = callbackQueryData.from.id
    const group = callbackQueryData.message.chat.title
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
        let response = await si.split(ctx, optionInfo.option, optionInfo.nameUser, data, gruposRegistred);

        if (response == true) {
          usersActives = usersActives.filter(res => res.idUser !== ctx.message.from.id);
          optionsRegistred = optionsRegistred.filter(res => res.idUser !== ctx.message.from.id);
        }

        console.log(usersActives);
      }

    });
  })
}

function orderListMessage(array, colum) {
  let response = array.map(val => {
    return {
      text: val,
      callback_data: val,
      test: `Testing ${val}`
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
