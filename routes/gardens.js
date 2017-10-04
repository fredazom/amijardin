/*jslint node: true */
"use strict";
var express = require('express'),
    dbStorage = require('../models/DBStorage'),
    mailer = require('../models/Mailer.js'),
    formValidator = require('../models/formValidator'),
    router = express.Router(),
    multiparty = require('multiparty'),
    UPLOAD_PATH = (typeof process.env.OPENSHIFT_DATA_DIR != 'undefined')?process.env.OPENSHIFT_DATA_DIR+'/upload':__dirname+'/../public/images/upload';

/* GET users listing. */
router.get('/', function(req, res, next) {

    var options = {
        root: __dirname + '/../public/json'
    };

    //res.sendFile('gardensDB.json', options);

    dbStorage.gardenDAO.getAllGardens.call({next: next, res: res});
});

/**
 * Treat multipart/data-form
 * Split images and garden info
 * Save images in disk
 * Save garden's info in db
 */
router.post('/add', function(req, res, next) {

    var form = new multiparty.Form({encoding: 'utf8', maxFieldSize: 500, maxFields: 30, maxFilesSize: 2097152, autoFiles: false, uploadDir: UPLOAD_PATH});
    form.next = next;
    form.res = res;
    form.parse(req, function(err, fieldsObject, filesObject) {
        if (err) {
            if (err.code === 'ETOOBIG') {
                console.log('error totalsize to big');
                form.next({status: 400, code: 'CUSTOMIZED', message: 'Total size of images is limited to  N MB'});
            }  else {
                console.log('error parsing form');
                console.log(err);
                form.next({status: 400});
            }
        }  else {

            var images = [];

            if (filesObject.images && filesObject.images.length > 0) {

                filesObject.images.forEach(function (file) {
                    var array = file.path.split('/');
                    images.push({imageDisplayName: file.originalFilename, imageName: array[array.length-1]});
                });

            }

            if (fieldsObject ) {

                if (!formValidator.validate(fieldsObject)) {
                    next({status: 400, message: "error validating"});
                    return;
                }

                try {
                    fieldsObject.images = images;
                    dbStorage.gardenDAO.saveGarden.call(form, fieldsObject);
                } catch (err) {
                    console.log(new Date() +" error thrown from dbStorage");
                    console.log(err);
                    form.next({status: 400});
                }


            } else {
                console.log(new Date() +' error parsing form, fields do not exist');
                form.next({status: 400});
            }
        }
    });
    form.on('error', function(err) {
        console.log('error parsing file :');
        console.log(err);
        form.next({status: 400});
    });
    form.on('close', function() {
    });
});

dbStorage.on('error', function(err, next, garden) {
    next({status: 400});
    mailer.sendMail(mailer.gardenSaveError, [
        garden.properties.gardenname,
        garden.properties.classifications[0],
        garden.properties.email,
        garden.properties.comment,
        garden.properties.state,
        garden.properties.street,
        garden.properties.number,
        garden.properties.zip,
        garden.properties.country,
        garden.properties.tel,
        garden.geometry.coordinates[0],
        garden.geometry.coordinates[1]], "fredazom@gmail.com");
});
dbStorage.on('success', function(garden, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end();
    var recipient = (process.env.NODE_ENV === 'development')?"fredazom@gmail.com":"letiziacaniglia77@gmail.com";
    mailer.sendMail(mailer.gardenAddition, [
        garden.properties.gardenname,
        garden.properties.classifications[0],
        garden.properties.email,
        garden.geometry.coordinates[0],
        garden.geometry.coordinates[1]], recipient);
});

module.exports = router;