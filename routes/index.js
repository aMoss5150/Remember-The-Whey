const express = require('express');
const {List} = require('../db/models');
const {asyncHandler} = require('./utils');
const router = express.Router();
const { csrfProtection } = require('./utils');


/* GET home page. */
router.get('/', csrfProtection, (req, res) => {
  if(!res.locals.authenticated) {
    res.redirect('/users/log-in')
  } else {
    res.render('index', { title: 'a/A Express Skeleton Home', csrfToken: req.csrfToken() });
  }

});

module.exports = router;
