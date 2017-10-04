require('../public/javascripts/admin/nouvellesFormFields.js');
var router = require('express').Router(),
    FormValidator = require('../models/questionResponseFormValidator'),
    validator = require('validator'),
    dbStorage = require('../models/DBStorage'),
    nouvellesAdminFormValidator = new FormValidator(global.nouvellesAdminFormFields),
    errorHandler = function(err, msg, next) {
        console.log(new Date() + ' : '+msg);
        console.log(err);
        next({status: 400});
    },
    validIdParameter = function(id, next) {
        if (!id || id.length > global.utils.MAX_ID_LENGTH || !validator.isHexadecimal(id)) {
            errorHandler(new Error("error validating id"), "error with ID passed as parameter", next);
            return false;
        }
        return true;
    };

router.get('/', function (req, res) {
    res.render('nouvelles');
});

router.get('/all', function (req, res) {
    try {
        dbStorage.nouvelleDAO.getAllNouvelles().then(function(nouvelles){
            res.send(JSON.stringify(nouvelles));
            res.end();
        }).fail(function(err){
            errorHandler(err, "Error fetching all Nouvelles", next);
        });
    } catch (err) {
        errorHandler(err, "Error fetching all Nouvelles", next);
    }
});

router.get('/visible', function (req, res) {
    try {
        dbStorage.nouvelleDAO.getVisibleNouvelles().then(function(nouvelles){
            res.send(JSON.stringify(nouvelles));
            res.end();
        }).fail(function(err){
            errorHandler(err, "Error fetching visible Nouvelles", next);
        });
    } catch (err) {
        errorHandler(err, "Error fetching visible Nouvelles", next);
    }
});

router.get('/range', function (req, res, next) {

    try {
        var from = new Date(utils.ddmmyyIntoISODateFormatter(req.query.from));
        var to = new Date(utils.ddmmyyIntoISODateFormatter(req.query.to));
        //res.send(JSON.stringify({"hi":"hello", "array":[{"tt":"ll"}, {"tt":"ll"}]}));
        //res.end();
        dbStorage.nouvelleDAO.getNouvellesByRange(from, to).then(function(nouvelles){
            res.send(JSON.stringify(nouvelles));
            res.end();
        }).fail(function(err){
            errorHandler(err, "Error fetching visible Nouvelles", next);
        });
    } catch (err) {
        errorHandler(err, "Error fetching Nouvelles by date range", next);
    }
});

//token securized URL, cf authRouter
router.post('/authaa/nouvelle/add', function (req, res, next) {

    if (!nouvellesAdminFormValidator.validate(req.body)) {
        next({status: 400, message: "error validating req.body"});
    } else {
        try {
            //set user through data set in authRouter through token
            req.body.a = req.authaa.username;
            dbStorage.nouvelleDAO.saveNouvelle(req.body).then(function(nouvelle){
                res.send(JSON.stringify(nouvelle));
                res.end();
            }).fail(function(err){
                errorHandler(err, "Error creating a Nouvelle", next);
            });
        } catch (err) {
            errorHandler(err, "Error creating a Nouvelle", next);
        }
    }
});

//token securized URL, cf authRouter
router.put('/authaa/nouvelle/:nid/update', function (req, res, next) {

    if (!nouvellesAdminFormValidator.validate(req.body)) {
        next({status: 400, message: "error validating"});
    } else {
        if (validIdParameter(req.params.nid, next)) {
            try {
                //set user through data set in authRouter through token
                req.body.a = req.authaa.username;
                dbStorage.nouvelleDAO.updateNouvelle(req.body).then(function (nouvelle) {
                    res.send(JSON.stringify(nouvelle));
                    res.end();
                }).fail(function (err) {
                    errorHandler(err, "Error updating Nouvelle", next);
                });
            } catch (err) {
                errorHandler(err, "Error updating Nouvelle", next);
            }
        }
    }
});

module.exports = router;
