const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');


// routes
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));

router.get('/add',
  authController.isLoggedIn,
  storeController.addStore
);
router.post('/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);
//edit
router.post('/add/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);

router.get('/stores/:id/edit', catchErrors(storeController.editStore));

router.get('/store/:slug', catchErrors(storeController.viewStore));

router.get('/sowing', catchErrors(storeController.getStoresBySow));
router.get('/sowing/:sow', catchErrors(storeController.getStoresBySow));

router.get('/harvesting', catchErrors(storeController.getStoresByHarvest));
router.get('/harvesting/:harvest', catchErrors(storeController.getStoresByHarvest));

router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/register', userController.registerForm);
router.post('/register',
  userController.validateRegister,
  catchErrors(userController.register),
  authController.login
);

router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.resetPassword));
router.post('/account/reset/:token',
  authController.confirmedPasswords,
  catchErrors(authController.updatePassword)
);

router.get('/logout', authController.logout);

// API
router.get('/api/search', catchErrors(storeController.searchStores));

module.exports = router;
