const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const { loginUser, logoutUser } = require('./auth');

const { User } = require('../db/models')
const { asyncHandler, csrfProtection } = require('./utils');

// had to npm install csurf, express-validator, bcryptjs

const userValidators = [
  check('firstName')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for First Name')
    .isLength({ max: 50 })
    .withMessage('First Name must not be more than 50 characters long'),
  check('lastName')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Last Name')
    .isLength({ max: 50 })
    .withMessage('Last Name must not be more than 50 characters long'),
  check('email')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Email Address')
    .isLength({ max: 255 })
    .withMessage('Email Address must not be more than 255 characters long')
    .isEmail()
    .withMessage('Email Address is not a valid email'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Password')
    .isLength({ max: 255 })
    .withMessage('Password must not be more than 50 characters long'),
  check('confirmPassword')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Confirm Password')
    .isLength({ max: 255 })
    .withMessage('Confirm Password must not be more than 50 characters long')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Confirm Password does not match Password');
      }
      return true;
    }),
];

const loginValidators = [
  check('email')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Email Address'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Password'),
];


/* GET users listing. */
// show user html with log-in form
router.get('/log-in', csrfProtection, (req, res) => {
  res.render('log-in', {
    title: 'Log-in',
    csrfToken: req.csrfToken()
  });
});

// log user in, run validation, and authenticate
router.post('/log-in', csrfProtection, loginValidators, asyncHandler(async (req, res) => {
  const {
    email,
    password
  } = req.body

  let errors = [];
  const validationErrors = validationResult(req)

  if (validationErrors.isEmpty()) {

    const user = await User.findOne({ where: { email } });

    if (user) {
      //const passMatch = await bcrypt.compare(password, user.hashPW.toString())
      const passMatch = password === user.hashPW;
      if (passMatch) {
        loginUser(req, res, user)  // log in user by assigning a req.session.auth object with user id
        return res.redirect('/')
      }
    }

    errors.push("Sorry, that wasn't a valid login. Please try again.");

  } else {
    errors = validationErrors.array().map(error => error.msg)
  }

  res.render('log-in', {
    title: 'Log-in',
    csrfToken: req.csrfToken(),
    errors
  });
}))

router.get('/sign-up', csrfProtection, (req, res,) => {
  res.render('sign-up', {
    title: "Sign-up",
    csrfToken: req.csrfToken()
  });
});


// when the form is submitted from sign up page
// check csrf, validate input fields
router.post('/sign-up', csrfProtection, userValidators, asyncHandler(async (req, res) => {

  const {
    firstName,
    lastName,
    email,
    password
  } = req.body

  const user = User.build({
    firstName,
    lastName,
    email,
    hashPW: password
  })

  const validationErrors = validationResult(req)

  if (validationErrors.isEmpty()) {

    //const hashedPW = await bcrypt.hash(password, 10);  // created hashed pw to store in DB

    //user.hashPW = hashedPW;
    await user.save()

    loginUser(req, res, user);  // logs in user after successful sign-up
    res.redirect('/');

  } else {

    const errors = validationErrors.array().map(error => error.msg)

    res.render('sign-up', {
      title: "Sign-up",
      csrfToken: req.csrfToken(),
      errors
    });
  };
}));


// logout deletes session through logoutUser, redirects user to log-in
router.post('/logout', (req, res) => {
  logoutUser(req, res);
  res.redirect('/users/log-in')
})

module.exports = router;
