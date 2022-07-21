const UserActives = require('./models/userActives')
const jobs = {}


jobs.userActivesCheck = async (bot) => {

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

}

module.exports = jobs
