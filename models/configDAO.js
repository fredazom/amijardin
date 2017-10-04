var Q = require('../public/javascripts/q.js'),
    ConfigDAO = function(mongoose) {
    var configSchema, self = this;
    configSchema = mongoose.Schema ({
        env: {type: String, required: true},
        database: {type: String, required: false},
        pkpath : {type: String, required: true},
        pubkpath : {type: String, required: true},
        expiresIn: {type: Number, required: false, default: 7200},
        mailerpwd: {type: String, required: true},
        marpwd: {type: String, required: true},
        frepwd: {type: String, required: true},
        letpwd: {type: String, required: true},
        dompwd: {type: String, required: true}
    });

    function format(data) {
        return {ps: data.ps, e: data.e};
    }

    self.Config = mongoose.model('configs', configSchema);

    self.findByEnv = function(env) {
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            try {
                var deferred = Q.defer();
                self.Config.findOne({'env': env}).exec(function(err, result){
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(result);
                    }
                });
                return deferred.promise;
            } catch(err){
                throw new Error(err);
            }
        }
    };

};

module.exports = ConfigDAO;