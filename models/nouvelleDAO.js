require('../public/javascripts/utils');
var formFields = require('../public/javascripts/admin/nouvellesFormFields');
var Utils = require('./Utils');
var Q = require('../public/javascripts/q.js');

var NouvellesDAO = function(mongoose) {
    var nouvellesSchema, self = this;
    nouvellesSchema = mongoose.Schema ({
        s: {type: String, maxlength: 250, required: true}, // s for subject
        t: {type: String, maxlength: 2000, required: true}, // t for text
        url: {type: String, maxlength: 200, default: ""},
        v: {type: Boolean, default: false},
        a: {type: String, maxlength: 50, required: true},//author who created
        ea: {type: String, maxlength: 50},//author who edited
        f: {type: Date, default: null},
        to: {type: Date, default: null},
        r: { // r for response
            required: false,
            default: [],
            type: [{
                t: {type: String, required: true},
                ps: {type: String, maxlength: 50}, // denormilized data from user
                u: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
                d: {type: Date},
                ed: {type: Date, default: null},
                v: {type: Boolean, defautl: false},
                n: {type: Boolean, defautl: false}
            }]
        },
        d: {type: Date}, // d for Date
        ed: {type: Date, default: null}, // ed for edited date
    });

    self.Nouvelle = mongoose.model('nouvelles', nouvellesSchema);

    function formatNewNouvelle(data) {
        return {
            s: Utils.sanitizeHtml(data.s),
            t: Utils.sanitizeHtml(data.t),
            url: data.url?Utils.sanitizeHtml(data.url):"",
            v: data.v==='undefined'?false:true,
            f: data.f?new Date(utils.ddmmyyIntoISODateFormatter(data.f)):null,
            to: data.to?new Date(utils.ddmmyyIntoISODateFormatter(data.to)):null,
            a: data.a,
            d: new Date().toUTCString()
        };
    };

    function formatUpdatedNouvelle(data) {
        return {
            s: Utils.sanitizeHtml(data.s),
            t: Utils.sanitizeHtml(data.t),
            url: data.url?Utils.sanitizeHtml(data.url):"",
            v: data.v==='undefined'?false:true,
            f: data.f?new Date(utils.ddmmyyIntoISODateFormatter(data.f)):null,
            to: data.to?new Date(utils.ddmmyyIntoISODateFormatter(data.to)):null,
            ea: data.a,
            ed: new Date().toUTCString()
        };
    };

    self.saveNouvelle = function (data) {
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            try {
                var nouvelle = new self.Nouvelle(formatNewNouvelle(data)), deferred = Q.defer();
                nouvelle.save(function(err, nouvelle) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(nouvelle);
                    }
                });
                return deferred.promise;
            } catch(err){
                throw new Error(err);
            }
        }
    };

    self.updateNouvelle = function (data) {
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            try {
                var deferred = Q.defer();
                self.Nouvelle.findByIdAndUpdate(data.nid, { $set: formatUpdatedNouvelle(data)}, {new : true}, function (err, nouvelle) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(nouvelle);
                    }
                });
                return deferred.promise;
            } catch(err){
                throw new Error(err);
            }
        }
    };


    self.getAllNouvelles = function() {
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            try {
                var deferred = Q.defer();
                self.Nouvelle.find({}).sort({d: -1, ed: -1}).exec(function(err, nouvelles) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(nouvelles);
                    }
                });
                return deferred.promise;
            } catch(err){
                throw new Error(err);
            }
        }
    };


    self.getVisibleNouvelles = function() {
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            try {
                var deferred = Q.defer();
                self.Nouvelle.find({v:true}).sort({o: -1, d: -1, ed: -1}).exec(function(err, nouvelles) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(nouvelles);
                    }
                });
                return deferred.promise;
            } catch(err){
                throw new Error(err);
            }
        }
    };



    self.getNouvellesByRange = function(from, to) {
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            try {
                var deferred = Q.defer();             // $not returns where to does not exist OR lte param
                self.Nouvelle.find({v: true, $or: [{f:{$gte: from, $lte: to}}, {to: {$gte: from, $lte:to}}]}).sort({f: -1, to: -1}).exec(function(err, nouvelles) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(nouvelles);
                    }
                });
                return deferred.promise;
            } catch(err){
                throw new Error(err);
            }
        }
    };
};

module.exports = NouvellesDAO;