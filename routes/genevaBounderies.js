var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

    var options = {
        root: __dirname + '/../public/json'
    };

    res.sendFile('genevaBounderies.json', options);
});

module.exports = router;