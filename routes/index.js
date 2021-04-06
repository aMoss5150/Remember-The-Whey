const express = require('express');
const router = express.Router();



/* GET home page. */
router.get('/', (req, res) => {
  if(!res.locals.authenticated) {
    res.redirect('/users/log-in')
  } else {
    res.render('index', { title: 'a/A Express Skeleton Home' });
  }

});






module.exports = router;
