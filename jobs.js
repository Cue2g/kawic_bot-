const UserActives = require('./models/userActives')
const jobs = {}
const {Telegraf} =  require('telegraf');
const botlog = new Telegraf(process.env.BOT_TOKEN_LOG);

jobs.userActivesCheck = async (bot) => {

    try {
        const response = await UserActives.find({}).select({userID: 1, dateActive: 1});
        response.forEach(async (user) => {
        const endDate = new Date()
        const startDate = user.dateActive
        var diff = endDate.getTime() - startDate.getTime();
        const mins = Math.round(diff / 60000);

        if(mins >= 2){
            await UserActives.deleteOne({userID:user.userID})
            bot.telegram.sendMessage(user.userID,'Sesion finalizada por inactividad, vuela a iniciar el proceso');
        }
    })
    } catch (error) {
        botlog.telegram.sendMessage(100799949,`Error at Jobs - userActivesCheck: ${e.message}`);
    }

}

module.exports = jobs
