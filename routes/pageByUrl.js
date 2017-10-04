var express = require('express');
var router = express.Router();

router.get('/nous-sommes', function (req, res) {
    res.render('nous-sommes');
});

router.get('/buts', function (req, res) {
    res.render('buts');
});

router.get('/classification', function (req, res) {
    res.render('classification');
});

router.get('/experts', function (req, res) {
    res.render('experts');
});

// forum is in routes/forum.js
// nouvelles is in routes/nouvelles.js

router.get('/chiffres', function (req, res) {
    res.render('chiffres');
});

router.get('/contact', function (req, res) {
    res.render('contact');
});

router.get('/soutenez-nous', function (req, res) {
    res.render('soutenez-nous');
});

router.get('/galerie', function (req, res) {
    res.render('galerie');
});

router.get('/premiere-rencontre-geneve-cultive', function (req, res) {
    res.render('premiere-rencontre');
});

router.get('/troisieme-rencontre-geneve-cultive', function (req, res) {
    res.render('troisieme-rencontre');
});

router.get('/deuxieme-rencontre-geneve-cultive', function (req, res) {
    res.render('deuxieme-rencontre');
});

router.get('/alternatiba-geneve-cultive', function (req, res) {
    res.render('alternatiba-15');
});

router.get('/aperos-decouvertes-jardins-urbains-geneve', function (req, res) {
    res.render('aperos-decouvertes');
});

router.get('/aperos-decouvertes-jardins-urbains-geneve-troinex', function (req, res) {
    res.render('aperos-decouvertes-troinex');
});

router.get('/aperos-decouvertes-jardins-urbains-geneve-pieds-verts', function (req, res) {
    res.render('aperos-decouvertes-pieds-verts');
});

module.exports = router;
