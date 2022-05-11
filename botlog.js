const {Telegraf} =  require('telegraf');
const botlog = new Telegraf('5321920688:AAE64qi6LDimzxr-aaQjWUbr1U0IVLMCBew');
botlog.start((ctx) => console.log(ctx.chat.id))
botlog.launch()
