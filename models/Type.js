const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const typeSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    required: 'Please Enter Type Name'
  },
  description: {
    type: String,
    required: 'Please Enter Type Description'
  },
  sow: [String],
  harvest: [String],
});


module.exports = mongoose.model('Type', typeSchema);