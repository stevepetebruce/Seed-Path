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
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
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

storeSchema.statics.getVegetables = function () {
  return this.aggregate([
    { $group: { _id: '$family', count: { $sum: 1 } } }
  ]);
}
// traditional function because 'this' is used
storeSchema.statics.getTopRating = function() {
  return this.aggregate([
    // look u stores and populate their comments
    { $lookup: {
      from: 'comments',
      localField: '_id',
      foreignField: 'store',
      as: 'comments'}
    },
    // filter minimum 2 ratings
    { $match: { 'comments.1': { $exists: true }}}, // second comment in comments is true
    // Average rating
    { $addFields:
      { averageRating: { $avg: '$comments.rating' }} // adds 'averageRating' to schema
    },
    // Sort ratings highest first
    { $sort: { averageRating: -1 }},
    // list of 10
    { $limit: 10 }
  ])
}
// add comments to stores
function autoPopulate(next) {
  this.populate('comments');
  next();
}

storeSchema.pre('find', autoPopulate);
storeSchema.pre('findOne', autoPopulate);

// relation: comments store === stores id
storeSchema.virtual('comments', {
  ref: 'Comment', // what mongoose.model to link to
  localField: '_id', // which field in the store schema?
  foreignField: 'store', // which field in the comment schema?
})

module.exports = mongoose.model('Store', storeSchema);