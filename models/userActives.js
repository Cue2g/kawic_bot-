const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserActivesSchema = new Schema({
  userID: Number,
  userUsername: String,
  groupID: Number,
  option: {
    type: String,
    default: 'none'
  },
  dateActive: Date
});

UserActivesSchema.index({messageChatId:1});
const UserActives = mongoose.model('UserActives', UserActivesSchema, 'UserActives');

module.exports = UserActives;