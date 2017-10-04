require('../public/javascripts/utils');
require('../public/javascripts/login/loginFormFields.js');
var express = require('express'),
    login = require('../models/Login'),
    FormValidator = require('../models/questionResponseFormValidator'),
    validator = require('validator'),
    router = express.Router(),
    mailer = require('../models/Mailer.js'),
    loginAdminFormFields = new FormValidator(global.loginAdminFormFields),// global.loginAdminFormFields initialized by require('./public/javascripts/loginFormFields')

    errorHandler = function(err, msg, next) {
        console.log(new Date() + ' : '+msg);
        console.log(err);
        next({status: 400});
    },
    validIdParameter = function(id, next) {
        if (!id || id.length > global.utils.MAX_ID_LENGTH || !validator.isHexadecimal(id)) {
            console.log(new Date() + " : error with ID passed as parameter");
            next({status: 400});
            return false;
        }
        return true;
    }

router.get('/llggaa', function (req, res) {
    res.render('loginadmin');
});

//token securized URL, cf authRouter
router.get('/authaa/menu', function (req, res, next) {

    //if(process.env.NODE_ENV === 'development'){
    //    res.render('admin-menu', {token: '123', username: 'Fredy'});
    //} else {
        res.render('admin-menu', {token: req.authaa.token, username: req.authaa.username});
    //}
});

router.post('/auth/admin', function(req, res, next) {
    if (!loginAdminFormFields.validate(req.body)) {
        errorHandler(new Error("error validating"), "Error validating", next);
    } else {
        login.authorizeAdmin(req.body).then(function(evaluation){
            mailer.sendMail(mailer.adminAuthorization, [evaluation.username, evaluation.token], evaluation.recipient);
            res.send('und jetzt?');
            res.end();
        }).fail(function(err){
            errorHandler(err, "Error executing login.authorizeAdmin", next);
        });

    }
});

module.exports = router;
