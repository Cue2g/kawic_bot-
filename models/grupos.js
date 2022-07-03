const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  id: Number,
  name: String,
  valor:Number,
  dateRegistered: Date,
  nameRegistered: String,
  idRegistered: Number,
  status:{
    type: Boolean,
    default: true
  }
});

///crear el modelo
GroupSchema.index({id:1});
const Group = mongoose.model('groupsRegisterd', GroupSchema, 'groupsRegisterd');

module.exports = Group;
