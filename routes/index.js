const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchE } = require('../handlers/errorHandlers');

/*
 * store routes
*/
router.get('/', catchE(storeController.getStores));
router.get('/add', authController.isLoggedIn, storeController.addStore);
router.get('/stores', catchE(storeController.getStores));
router.post(
  '/add',
  authController.isLoggedIn,
  storeController.upload,
  catchE(storeController.resize),
  catchE(storeController.createStore)
);
router.post(
  '/add/:id',
  authController.isLoggedIn,
  storeController.upload,
  catchE(storeController.resize),
  catchE(storeController.updateStore)
);
router.get(
  '/stores/:id/edit',
  authController.isLoggedIn,
  catchE(storeController.editStore)
);
router.get('/store/:slug', catchE(storeController.getStoreBySlug));

router.get('/tags', catchE(storeController.getStoresByTag));
router.get('/tags/:tag', catchE(storeController.getStoresByTag));

// User routes
router.get('/login', userController.loginForm);
router.post('/login', catchE(authController.login));
router.get('/register', userController.registerForm);
router.post(
  '/register',
  userController.validateRegister,
  catchE(userController.register),
  authController.login
);
router.get('/logout', authController.logout);
router.get('/account', userController.account);
router.post('/account', catchE(userController.updateAccount));
router.post('/account/forgot', catchE(authController.forgot));
router.get('/account/reset/:resetToken', catchE(authController.reset));
router.post(
  '/account/reset/:resetToken',
  authController.confirmPasswords,
  catchE(authController.updatePassword)
);

module.exports = router;
