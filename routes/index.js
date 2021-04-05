var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  // session? if no resredirect to login

  // if session res.render('index')
  res.render('index', { title: 'a/A Express Skeleton Home' });
});

// router.get('/log-in' )
//   res.render('log-in')


router.get('/sign-up', (req, res) => {
  res.render('sign-up')
})

router.post('/sign-up', )



module.exports = router;
