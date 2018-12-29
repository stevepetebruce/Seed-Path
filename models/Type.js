const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const typeSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: 'You must supply a store'
  },
  name: {
    type: String,
    required: 'Please Enter Type Name'
  },
  description: {
    type: String,
    required: 'Please Enter Type Description'
  },
  sowIndoors: [String],
  sow: [String],
  harvest: [String],
  photo: String,
});


module.exports = mongoose.model('Type', typeSchema);