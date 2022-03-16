const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  id: Number,
  tittle: String,
  valor:Number
});

///crear el modelo
GroupSchema.index({id:1});
const Group = mongoose.model(`groups`, GroupSchema);

module.exports = Group;
