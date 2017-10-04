var validator = require('validator');
var formFields = require('../public/javascripts/questionFormFields');
var Utils = require("./Utils");
var sanitizeHtml = require('sanitize-html');
var Q = require('../public/javascripts/q.js');

var QuestionDAO = function(eventEmitter, mongoose) {
    var questionSchema, self = this;
    questionSchema = mongoose.Schema ({
        s: {type: String, maxlength: 250, required: true}, // s for subject
        t: {type: String, maxlength: 2000}, // t for text
        url: {type: String, maxlength: 200},
        v: {type: Boolean, default: false},
        n: {type: Boolean, default: false},
        ps: {type: String, maxlength: 50, required: true},
        u: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
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
        li: {type: Date} // li for last interaction
    });

    self.Question = mongoose.model('questions', questionSchema);

    function formatNewQuestion(data, user) {
        return {
            s: Utils.sanitizeHtml(data.s),
            t: Utils.sanitizeHtml(data.t),
            url: Utils.sanitizeURL(data.s),
            v: false,
            n: data.n===undefined?false:true,
            ps: user.ps,
            u: user,
            d: new Date().toUTCString(),
            li: new Date().toUTCString()
        };
    }

    function formatUpdatedQuestion(data) {
        return {
            s: Utils.sanitizeHtml(data.s),
            url: Utils.sanitizeURL(data.s),
            t: Utils.sanitizeHtml(data.t),
            v: true, // updating validates automatically
            ed: new Date().toUTCString(),
            li: new Date().toUTCString()
        };
    }

    function formatResponse(data, user) {
        return {
            t: Utils.sanitizeHtml(data.t),
            ps: Utils.sanitizeHtml(data.ps), //denormalized data
            u: user._id,
            d: new Date().toUTCString(),
            n: data.n===undefined?false:true,
            v: false
        }
    }

    function formatUpdateResponse(data) {
        return {
            t: Utils.sanitizeHtml(data.t),
            ed: new Date().toUTCString(),
            v: true
        }
    }

    self.saveQuestion = function (data, user) {
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            try {
                var question = new self.Question(formatNewQuestion(data, user)), deferred = Q.defer();
                question.save(function(err, question) {
                    if (err) {
                        // 't' corresponds to editor
                        if (err.errors && err.errors['t'] && err.errors['t'].kind === 'maxlength') {
                            console.log(new Date() + 'error question text to big');
                            var label = global.questionFormFields.formFields['t'].fieldLabel,
                                errorMessage = "Le champ '"+label+"' est trop long.";
                            err.code = 'CUSTOMIZED';
                            err.message = errorMessage;
                        }
                        deferred.reject(err);
                    } else {
                        deferred.resolve(question);
                    }
                });
                return deferred.promise;
            } catch(err){
                throw new Error(err);
            }
        }
    };

    self.saveResponse = function (data, user) {
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            try {
                var deferred = Q.defer();
                self.Question.findOneAndUpdate({"_id": data.qid}, {"$set": {"li": new Date().toUTCString()}, "$push": {"r": formatResponse(data, user)}}, {new: true, upsert: false, select: 'r'}, function(err, result){
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

    self.findByURL = function(url) {
        var context = this;
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            return self.Question.find({url: url}, function(err, question) {
                if (err) {
                    console.log(new Date() + ' : error getting question by URL');
                    console.log(err);
                    eventEmitter.emit('error', err, context.next);
                } else {
                    eventEmitter.emit('questionFoundByURL', question.length>0?question[0]:{}, context.res);
                }
            });

        }
    };

    self.findByField = function(fieldvalueObject) {
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            try {
                var deferred = Q.defer();
                var query = Array.isArray(fieldvalueObject)? self.Question.findOne(fieldvalueObject[0], fieldvalueObject[1]):self.Question.findOne(fieldvalueObject);
                query.exec(function(err, result){
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

    self.getAllQuestions = function() {
        var context = this;
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            return self.Question.find({v:true}).sort({li: 1}).exec(function(err, questions) {
                if (err) {
                    console.log(new Date()+' : error getting all questions');
                    console.log(err);
                    eventEmitter.emit('error', err, context.next);
                } else {
                    var json = JSON.stringify(questions);
                    context.res.send(json);
                    context.res.end();
                }
            })

        }
    };

    self.validateQuestion = function (id) {
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            try {
                var deferred = Q.defer();
                self.Question.findOneAndUpdate({"_id": id}, {"$set": {"v": true}},  {new: true, upsert: false, select: '_id'}, function(err, result){
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

    self.updateQuestion = function (data) {
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            try {
                var deferred = Q.defer();
                self.Question.findByIdAndUpdate(data.qid, { $set: formatUpdatedQuestion(data)}, {new : true}, function (err, question) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(question);
                    }
                });
                return deferred.promise;
            } catch(err){
                throw new Error(err);
            }
        }
    };

    self.validateResponse = function (rid) {
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            try {
                var deferred = Q.defer();
                self.Question.findOneAndUpdate({"r._id": rid}, {"$set": {"r.$.v": true}},  {new: true, upsert: false}, function(err, result){
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

    self.updateResponse = function (data) {

        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            try {
                var deferred = Q.defer(), formattedData = formatUpdateResponse(data);
                self.Question.findOneAndUpdate({"_id": data.qid, "r._id": data.rid}, {"$set": {"li": new Date().toUTCString(),"r.$.v": formattedData.v, "r.$.t": formattedData.t, "r.$.ed": formattedData.ed}}, {new: true, upsert: false, select: {r :{$elemMatch: {_id: data.rid}}}}, function (err, result) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(result);
                    }
                });
                return deferred.promise;
            } catch(err) {
                throw new Error(err);
            }
        }
    };

    self.unsubscribeByUser = function (data) {

        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            try {
                var deferred = Q.defer();
                self.Question.findById(data.qid).exec(function(err, question){
                    if (err) {
                        deferred.reject(err);
                    } else {
                        if (!question) {
                            deferred.resolve(null);
                        } else {
                            if (question.u.toString() === data.uid) {
                                question.n = false;
                            }
                            for (var i = 0; i < question.r.length; i++) {
                                if (question.r[i].u.toString() === data.uid) {
                                    question.r[i].n = false;
                                }
                            }
                            question.save(function (err, question) {
                                if (err) {
                                    deferred.reject(err);
                                } else {
                                    deferred.resolve(question);
                                }
                            });
                        }
                    }
                });
                return deferred.promise;
            } catch(err) {
                throw new Error(err);
            }
        }
    };


    self.loadQuestionWithUsers = function(question) {
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            try {
                var deferred = Q.defer();
                //self.Question.findOne({_id: question._id}, {'r': {$elemMatch: {'n': true, 'v': true}}}).populate('u').populate('r.u').exec(function(err, result) {
                self.Question.findOne({_id: question._id}).populate('u').populate('r.u').exec(function(err, result) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(result);
                    }
                });
                return deferred.promise;
            } catch(err) {
                throw new Error(err);
            }
        }
    }
};

module.exports = QuestionDAO;