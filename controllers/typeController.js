
const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const Type = mongoose.model('Type');
const multer = require('multer'); // file upload
const jimp = require('jimp'); // resize image
const uuid = require('uuid'); // unique ids

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: function(req, file, next){
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true);
    } else {
      next({ message: 'File type not allowed' }, false);
    }
  }
};


exports.addType = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.storeId });
  res.render('addType', { title: `Add Type to ${store.name}`, store });
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if new file to resize
  if (!req.file){
    next();
    return;
  }
  // get extension (jpeg, gif etc.)
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // resize image
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(400, jimp.AUTO);
  // save to disk
  await photo.write(`./public/uploads/types/${req.body.photo}`);
  next();
}

exports.createType = async (req, res) => {
  req.body.author = req.user._id;
  req.body.store = req.params.storeId;
  const newType = new Type(req.body);
  await newType.save();
  req.flash('success', 'Vegetable Type Saved');
  res.redirect('back');
}

// check user id = store author
const checkUser = (type, user) => {
  if (!type.author.equals(user._id)) {
    throw Error ('Please login to edit');
  }
}

exports.editType = async (req, res) => {
  const type = await Type.findOne({ _id: req.params.id });
  checkUser(type, req.user);
  res.render('addType', { title: `Edit ${type.name}`, type });
}

exports.updateType = async (req, res) => {
  const typeUpdate = await Type.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return updated data
    runValidators: true // run validators in storeSchema
  }).exec(); //execute the query
  req.flash('success', 'Vegetable Type Updated');
  res.redirect(`/store/${typeUpdate.store}/add-type/${typeUpdate._id}`);
}



