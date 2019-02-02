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
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'Please supply an author'
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: 'Please supply a Vegetable'
  },
  photo: String
});


module.exports = mongoose.model('Type', typeSchema);