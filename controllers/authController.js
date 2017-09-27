const passport = require('passport');
const crypto = require('crypto');
const User = require('../models/User');
const promisify = require('es6-promisify');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed login.',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out 👋🏼');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'Oops! you must be logged in to do that!');
  res.redirect('/login');
};

exports.forgot = async (req, res) => {
  // 1) see if user exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'A password reset has been mailed to you!');
    return res.redirect('back');
  }
  // 2) Set reset tokens on account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();
  // 3) Send them email with a token
  const resetURL = `http://${req.headers
    .host}/account/reset/${user.resetPasswordToken}`;
  // 4) redirect to login page after email has been sent
  req.flash(
    'success',
    'You have been emailed a password reset link. ' + resetURL
  );
  res.redirect('/login');
};

exports.reset = async (req, res, next) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.resetToken,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash('error', 'password reset token is invalid or has expired.');
    return res.redirect('/login');
  }
  res.render('reset', { title: 'Reset your password' });
};

exports.confirmPasswords = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) return next();
  req.flash('error', 'passwords do not match!');
  return res.redirect('back');
};

exports.updatePassword = async (req, res, next) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.resetToken,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash('error', 'password reset token is invalid or has expired.');
    return res.redirect('/login');
  }
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash(
    'success',
    'Nice! Your password has been reset! You are now logged in!'
  );
  res.redirect('/');
};
