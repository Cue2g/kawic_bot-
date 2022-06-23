const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserActivesSchema = new Schema({
  messageChatId: String,
  messageChatTittle: String,
  dateRegister: Date
});

UserActivesSchema.index({messageChatId:1});
const UserActives = mongoose.model('UserActives', UserActivesSchema, 'UserActives');

module.exports = UserActives;