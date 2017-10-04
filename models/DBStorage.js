var EventEmitter = require('events').EventEmitter,
    Q = require('../public/javascripts/q.js'),
    util = require('util'),
    GardenDAO = require('./gardenDAO'),
    ForumDAO = require('./forumDAO'),
    UserDAO = require('./userDAO'),
    ConfigDAO = require('./configDAO'),
    NouvelleDAO = require('./nouvelleDAO'),
    mongoose = require('mongoose'), URL_DB_CONNECTION = 'mongodb://localhost:27017/genevecultive';

if (typeof process.env.MONGODB_USER != 'undefined') {
    URL_DB_CONNECTION = 'mongodb://'+process.env.MONGODB_USER + ":" +
        process.env.MONGODB_PASSWORD + "@" +
        process.env.MONGODB_DATABASE + ':' +
        '27017/amijardin';
    console.log("URL AT OPENSHIFT :"+URL_DB_CONNECTION);
} else {
    console.log("$OPENSHIFT_MONGODB_DB_HOST does not exist");
}

var DBStorage = function () {
    var self = this;
    var options = {server: {socketOptions: { keepAlive: 1 }}};
    var deferred = Q.defer();
    mongoose.connect(URL_DB_CONNECTION, options, function() {
        deferred.resolve(new ConfigDAO(mongoose));
    });

    var db = mongoose.connection;
    db.on('error', function (err) {
        throw err;
    });
    db.once('open', function () {
    });
    process.on('exit', function() {
        if (mongoose.Connection.STATES.connected === db.readyState) {
            console.log("disconnect mongoose after process.exit");
            mongoose.disconnect();
        }
    });
    self.gardenDAO = new GardenDAO(self, mongoose);
    self.forumDAO = new ForumDAO(self, mongoose);
    self.userDAO = new UserDAO(mongoose);
    self.nouvelleDAO = new NouvelleDAO(mongoose);
    self.ConfigDAOPromise = deferred.promise;
};


util.inherits(DBStorage, EventEmitter);

var singleton = new DBStorage();
module.exports = singleton;