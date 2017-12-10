const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer'); // file upload
const jimp = require('jimp'); // resize image
const uuid = require('uuid'); // unique file names

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: function(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto){
      next(null, true); // It's good
    } else {
      next({ message: 'Incorrect file type' }, false);
    }
  }
}

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if image
  if(!req.file){
    next(); // skip to next
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  console.log(req.body.photo);
  const photo = await jimp.read(req.file.buffer); // resize image
  await photo.resize(800, jimp.AUTO); // 800px x auto
  await photo.write(`./public/uploads/${req.body.photo}`); // write photo to folder
  next();
};

exports.createStore = async (req, res) => {
  req.body.author = req.user._id; //  add user ID to store author
  // save stores
  const store = await (new Store(req.body)).save();
  req.flash('success', `Entry Complete for ${store.name}!`);
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // retrieve stores
  const stores = await Store.find();
  res.render('stores', { stores: stores, title: 'Vegetables' });
};

// check user id = store author
const checkUser = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw Error ('Please login to edit');
  }
};

exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id });
  checkUser(store, req.user);
  res.render('editStore', {store: store, title: `Edit ${store.name}`});
};

exports.updateStore = async (req, res) => {
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return updated data
    runValidators: true // run validators in storeSchema
  }).exec(); //execute the query
  req.flash('success', `Successfully updated ${store.name} <a href="/stores/${store.slug}">View</a>`)
  res.redirect(`/stores/${store._id}/edit`);
};

exports.viewStore = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate('author');
  if (!store){
    next();
   return;
  }
  res.render('store', { store: store, title: `${store.name}` });
};

exports.getStoresBySow = async (req, res) => {
  const tab = req.params.sow; // select month from parameter
  const tabQuery = tab || { $exists: true }; // get month or all stores with month in
  const calendar = [
    {"_id":"Jan"}, {"_id":"Feb"}, {"_id":"Mar"}, {"_id":"Apr"}, {"_id":"May"}, {"_id":"Jun"},
    {"_id":"Jul"}, {"_id":"Aug"}, {"_id":"Sep"}, {"_id":"Oct"}, {"_id":"Nov"}, {"_id":"Dec"}
  ]
  const sowingPromise = Store.getSowList();     //
  const storesPromise = Store.find({sow: tabQuery}); //duel promise
  const [sowing, stores] = await Promise.all([sowingPromise, storesPromise]);

  const countMap = {};
  sowing.forEach((a) => {
    countMap[a._id] = a.count
  });
  // map over months to add sowing.count or 0
  const final = calendar.map((month) => ({_id: month._id, count: countMap[month._id] || 0}))
  //res.json(stores);

  res.render('sowList', { final: final, stores: stores, title: 'When to Sow', tab });
}

exports.getStoresByHarvest = async (req, res) => {
  const tab = req.params.harvest; // select month from parameter
  const tabQuery = tab || { $exists: true }; // get month or all stores with month in
  const calendar = [
    {"_id":"Jan"}, {"_id":"Feb"}, {"_id":"Mar"}, {"_id":"Apr"}, {"_id":"May"}, {"_id":"Jun"},
    {"_id":"Jul"}, {"_id":"Aug"}, {"_id":"Sep"}, {"_id":"Oct"}, {"_id":"Nov"}, {"_id":"Dec"}
  ]
  const harvestPromise = Store.getHarvestList();     //
  const storesPromise = Store.find({harvest: tabQuery}); //duel promise
  const [harvesting, stores] = await Promise.all([harvestPromise, storesPromise]);

  const countMap = {};
  harvesting.forEach((a) => {
    countMap[a._id] = a.count
  });
  // map over months to add sowing.count or 0
  const final = calendar.map((month) => ({_id: month._id, count: countMap[month._id] || 0}))
  //res.json(stores);

  res.render('harvestList', { final: final, stores: stores, title: 'When to Harvest', tab });
}

exports.searchStores = async (req, res) => {

  const stores = await Store
  // Find stores
  .find(
    {
      $text: { $search: req.query.q }
    }, {
    // score search
      score: { $meta: 'textScore' }
    }
  )
  // sort score
  .sort({
      score: { $meta: 'textScore' }
  })
  // limit to 8
  .limit(8);

  res.json(stores);
}