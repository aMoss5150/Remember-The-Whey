var express = require('express');
var router = express.Router();
const { asyncHandler, csrfProtection } = require('./utils')

/* GET users listing. */
router.get('/log-in', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/log-in')

router.get('/sign-up', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
