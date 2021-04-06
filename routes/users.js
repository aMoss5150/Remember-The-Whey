const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')

const { User } = require('../db/models')
const { asyncHandler, csrfProtection } = require('./utils')

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


/* GET users listing. */
// show user html with log-in form
router.get('/log-in', csrfProtection, (req, res) => {
  res.render('log-in', {
    title: 'Log-in',
    csrfToken: req.csrfToken()
  });
});

// log user in, run validation, and authenticate
router.post('/log-in', csrfProtection, asyncHandler(async(req,res) => {

}))

router.get('/sign-up', csrfProtection, (req, res,) => {
  res.render('sign-up', {
    title: "Sign-up",
    csrfToken: req.csrfToken()
  });
});

router.post('/sign-up', csrfProtection, userValidators, asyncHandler(async(req,res) => {

}))

module.exports = router;
