const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  id: String,
  chatTitle: String,
  valor:Number
});

///crear el modelo
GroupSchema.index({id:1});
const Group = mongoose.model('groupsTest', GroupSchema);

module.exports = Group;
