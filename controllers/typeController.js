const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
const Type = mongoose.model('Type');
const multer = require('multer'); // file upload
const jimp = require('jimp'); // resize image
const uuid = require('uuid'); // unique ids

exports.addType = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id });
  res.render('addType', { title: `Add Type to ${store.name}`, store });
}

exports.createType = async (req, res) => {
  const type = new Type(req.body);
  await type.save();
  console.log(req.body);
  res.redirect('/');
}