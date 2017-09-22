const Store = require('../models/store');

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

exports.createStore = async (req, res) => {
  const { name, description, tags } = req.body;
  const store = new Store({ name, description, tags });
  const savedStore = await store.save();
  req.flash(
    'success',
    `Successfully created ${savedStore.name}! Care to leave a review?`
  );
  res.redirect('/');
};

exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render('stores', {
    title: 'Stores',
    stores
  });
};

exports.editStore = async (req, res) => {
  const storeId = req.params.id;
  const store = await Store.findById(storeId);
  res.render('editStore', { title: 'Edit Store', store });
};
