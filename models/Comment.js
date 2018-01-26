const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const commentSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: 'You must supply a store'
  },
  text: {
    type: String,
    required: 'Your comment must have text'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
});

// populate author details to author.id in commentSchema
function autoPopulate (next) {
  this.populate('author');
  next();
}
commentSchema.pre('find', autoPopulate);
commentSchema.pre('findOne', autoPopulate);




module.exports = mongoose.model('Comment', commentSchema);