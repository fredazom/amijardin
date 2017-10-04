var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

    var options = {
        root: __dirname + '/../public/html'
    };

    //res.sendFile('map.html', options);
    res.render("map");
});

module.exports = router;