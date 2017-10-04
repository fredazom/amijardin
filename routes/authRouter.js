require('../public/javascripts/utils');
var express = require('express'),
    login = require('../models/Login'),
    router = express.Router(),
    errorHandler = function(err, msg, next) {
        console.log(new Date() + ' : '+msg);
        console.log(err);
        next({status: 400});
    };

function tokenVerifier (req, res, next) {

    //if(process.env.NODE_ENV === 'development'){
    //    req.authaa = {};
    //    req.authaa.username = "Fredy";
    //    next();
    //} else {

        var token = (req.body && req.body.token) || (req.query && req.query.token) || (req.headers && req.headers['x-access-token']);
        if (!token) {
            next({status: 401, message: "token missing"});
        } else {

            login.verify(token)
                .then(function (decoded) {
                    req.authaa = {};
                    req.authaa.token = token;
                    req.authaa.username = decoded.username;
                    for(var key in decoded){console.log(key + " : " +decoded[key]);}
                    next();
                })
                .fail(function (err) {
                    if (err.message === 'jwt expired') {
                        next({status: 401, message: 'session expired'});
                    } else {
                        errorHandler(err, "error verifying token", next)
                    }
                });

        }
    //}
};

//token securized URL
router.use('/login/authaa/*', tokenVerifier);
router.use('/nouvelles/authaa/*', tokenVerifier);

module.exports = router;
