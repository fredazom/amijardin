/**
 * SET NODE_ENV TO PRODUCTION ON OPENSHIFT:
 * rhc env-set NODE_ENV="production" -a amijardin
 *
 * TO REVIEW CURRENT ENVIRONMENT VARIABLES
 * rhc env-list amijardin
 */

var fs = require('fs'),
    dbStorage = require('../models/DBStorage'),
    Q = require('../public/javascripts/q.js');

var Config = function() {
    var self = this, env = null, node_env = process.env.NODE_ENV ? 'production' : 'development';

    self.getConfig = function() {
        var deferred = Q.defer();

        if (env === null) {
            try {
                // var path = process.env.NODE_ENV !== 'development'?'path_in_server':'/home/fredy/projects/amijardindata/env/';
                // env = JSON.parse(fs.readFileSync(path+'env.json'), 'utf8');
                dbStorage.ConfigDAOPromise.then(function(configDAO) {
                    configDAO.findByEnv(node_env).then(function(envir){
                        deferred.resolve(envir);
                    }).catch(function(err){console.log(err);});
                });
            } catch(err) {
                deferred.reject(err);
            }

        }

        // deferred.resolve(env[node_env]);
        return deferred.promise;
    }

    self.getConfigTest = function() {
        env = JSON.parse(fs.readFileSync('/home/fredy/projects/amijardindata/env/env.json'), 'utf8');
        return env['development'];
    }
};

var singleton = new Config();
module.exports = singleton;