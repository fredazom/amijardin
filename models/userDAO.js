var Q = require('../public/javascripts/q.js'),
    UserDAO = function(mongoose) {
    var userSchema, self = this;
    userSchema = mongoose.Schema ({
        ps: {type: String, maxlength: 50, required: true}, // ps for pseudo
        role: {type: String, maxlength: 50, default: null},
        e: {type: String, maxlength: 200, required: true} // e for email
    });

    function format(data) {
        return {ps: data.ps, e: data.e};
    }

    self.User = mongoose.model('users', userSchema);

    self.findByField = function(fieldvalueObject) {
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            try {
                var deferred = Q.defer();
                self.User.findOne(fieldvalueObject).exec(function(err, result){
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

    self.findOrSave = function (userObject) {
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            try {

                var promise = self.findByEmail(userObject.e), deferred = Q.defer();
                promise.then(function(user){
                    if (user) {
                        deferred.resolve(user);
                    } else {
                        self.save(userObject).then(function(user){
                            deferred.resolve(user);
                        }).fail(function(err){
                            deferred.reject(err);
                        });
                    }
                }).fail(function(err){
                    deferred.reject(err);
                });
                return deferred.promise;

            } catch(err){
                throw new Error(err);
            }
        }
    };

    self.findByEmail = function(fieldValue) {
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            try {
                var deferred = Q.defer();
                self.User.findOne({'e': fieldValue}, function(err, user){
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(user);
                    }
                });
                return deferred.promise;
            } catch(err){
                console.log(new Date() + " : error executing userDAO.findOne"); // error will be console.logged in fail method of try/catch or promise.fail
                throw new Error(err);
            }
        }
    };

    self.save = function(data) {
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            try {
                var deferred = Q.defer();
                new self.User(format(data)).save(function(err, user){
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(user);
                    }
                });
                return deferred.promise;
            } catch(err){
                console.log(new Date()+" : error from userDAO.save");// error will be console.logged in fail method of try/catch or promise.fail
                throw new Error("error executing userDAO.save");
            }
        }
    };
};

module.exports = UserDAO;