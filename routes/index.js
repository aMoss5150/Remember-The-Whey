const express = require('express');
const {List} = require('../db/models');
const {asyncHandler} = require('./utils');
const router = express.Router();



/* GET home page. */
router.get('/', asyncHandler(async(req, res) => {
  if(!res.locals.authenticated) {
    res.redirect('/users/log-in')
  } else {
    //get all lists from the user
    // let lists = await List.findAll();
    // lists = lists.map(el => el.name);
    res.render('index', { title: 'a/A Express Skeleton Home' });
  }

}));






module.exports = router;
