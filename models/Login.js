var mongoose = require('mongoose'),
    dbStorage = require('./DBStorage'),
    jwt = require('jsonwebtoken'),
    configObject = require('../conf/config'),
    Q = require('../public/javascripts/q.js'),
    fs = require('fs'),
    KEY_PATH = (typeof process.env.OPENSHIFT_DATA_DIR != 'undefined')?process.env.OPENSHIFT_DATA_DIR+'/.ssh/':'';

var Login = function () {
    var self = this;

    self.pwdEmailMap = null;
    self.config = null;
    self.private_key = null;
    self.public_key = null;


    configObject.getConfig().then(function(config){
        self.config = config;
        self.pwdEmailMap = {};
        self.pwdEmailMap[config.marpwd] = {email:"marisa.saladin@gmx.ch", username:"Marisa"};
        self.pwdEmailMap[config.letpwd] = {email:"letiziacaniglia77@gmail.com", username:"Letizia"};
        self.pwdEmailMap[config.frepwd] = {email:"fredazom@gmail.com", username:"Fredy"};
        self.pwdEmailMap[config.dompwd] = {email:"dominique.oestreicher@gmail.com", username:"Dominique"};
    }).fail(function(error){
        throw new Error('Error getting config : ' + error);
    });

    function loadCert() {
        self.private_key = fs.readFileSync(KEY_PATH + this.config.pkpath);
        self.public_key = fs.readFileSync(KEY_PATH + this.config.pubkpath);
    }

    self.authorizeAdmin = function(data){
        
        if (self.pwdEmailMap === null  || self.config === null ) {
            throw new Error('config has not been loaded yet in Login.js');
        }

        if (self.private_key === null) {
            loadCert();
        }

        var deferred = Q.defer();

        if(self.pwdEmailMap[data.l]) {

            jwt.sign({username: self.pwdEmailMap[data.l].username}, self.private_key, {algorithm: "RS256", issuer: 'urn:genevecultive', expiresIn: self.config.expiresIn, username: self.pwdEmailMap[data.l].username}, function(token, err) {
                //if(err) {
                //    deferred.reject(err);
                //} else {
                    deferred.resolve({
                        recipient: (process.env.NODE_ENV === 'development')?'fredazom@gmail.com':self.pwdEmailMap[data.l].email,
                        username: self.pwdEmailMap[data.l].username,
                        token: token
                    });
                //}
            });

        } else {
            deferred.reject("wrong password");
        }
        return deferred.promise;
    }


    self.verify = function(token){

        if (self.public_key === null) {
            loadCert();
        }
        
        var deferred = Q.defer();
        jwt.verify(token, self.public_key, { algorithms: ['RS256'], issuer: 'urn:genevecultive'}, function(err, decoded) {
            if(err) {
                deferred.reject(err);
            } else {
                deferred.resolve(decoded);
            }
        });

        return deferred.promise;
    }
};

var singleton = new Login();
module.exports = singleton;