const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');
const striptags = require('striptags');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter vegetable type!'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tip: {
    type: String,
    trim: true
  },
  family: String,
  sow: [String],
  harvest: [String],
  created: {
    type: Date,
    default: Date.now
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'Please supply author'
  }
});

//mongoose indexs
storeSchema.index({
  name: 'text',
  description: 'text'
});

// mongoose pre save - Sanitize form
storeSchema.pre('save', async function(next) {
  this.name = striptags(this.name);
  this.description = striptags(this.description);
  this.tip = striptags(this.tip);
  next();
});

// mongoose pre save - pass in slug to storeSchema
storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next();
    return;
  }
  this.slug = slug(this.name);
  //Make sure two slugs are not the same
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if(storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  next();
});


//Schema statics aggregate
storeSchema.statics.getSowList = function() {
  return this.aggregate([
    { $unwind: '$sow' },
    { $group: { _id: '$sow', count: { $sum: 1 } } }
  ]);
}

storeSchema.statics.getHarvestList = function() {
  return this.aggregate([
    { $unwind: '$harvest' },
    { $group: { _id: '$harvest', count: { $sum: 1 } } }
  ]);
}

module.exports = mongoose.model('Store', storeSchema);