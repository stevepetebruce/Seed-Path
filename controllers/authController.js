const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');


exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You have logged out');
  res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  req.flash('error', 'Please log in');
  res.redirect('/login');
}

exports.forgot = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'No account found with this address');
    return res.redirect('/login');
  }
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000; //plus one hour
  await user.save();

  req.flash('success', `You have been emailed a new reset link http://${req.headers.host}/account/reset/${user.resetPasswordToken}`);
  res.redirect('/login');
}

exports.resetPassword = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() } //MongoDB query Expiry is greater than now
  });
  if (!user) {
    req.flash('error', 'Your details are invalid or have expired.');
    return res.redirect('/login');
  }
  res.render('reset', { title: 'Reset Your Password'});
}

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body['confirm-password']){
    next();
    return;
  }
  req.flash('error', 'Passwords do not match.');
  res.redirect('back');
}

exports.updatePassword = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() } //MongoDB query Expiry is greater than now
  });
  if (!user) {
    req.flash('error', 'Your details are invalid or have expired.');
    return res.redirect('/login');
  }
  const setPassword = promisify(user.setPassword, user)
  await setPassword(req.body.password);
  //Remove tokens
  resetPasswordToken: undefined;
  resetPasswordExpires: undefined;

  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash('success', 'Your password has been reset.');
  res.redirect('/');
}