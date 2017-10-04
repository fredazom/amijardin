var _ = require("../public/javascripts/lodash_4_3_0.js"),
    mailer = require('./Mailer'),
    mongoose = require('mongoose'),
    dbStorage = require('./DBStorage'),
    errorHandler = function(err, msg) {
        console.log(new Date() + ' : '+msg);
        console.log(err);
    };

var Notifier = function () {
    var self = this;

    self.excludeResponses = function(question, userObjectId) {
        if(!userObjectId) {
            return question;
        }
        question.r =  _.filter(question.r, function(response){
            return userObjectId.toString() != response.u._id.toString();
        });
        return question;
    };
    self.extractResponsesValidatedToNotify = function(question) {
        _.remove(question.r, function(response){
            return !(response.n === true && response.v === true);
        });
        return question;
    };

    self.removeDuplicatedEmails = function(question) {
        question.r = _.unionBy(question.r, 'u.e');
        return question;
    };

    self.removeQuestionOwnerEmailFromResponses = function(question) {
        if(!question.n || !question.v) {
            return question;
        }

        question.r = _.remove(question.r, function(response){
            return !(response.u.e === question.u.e);
        });
        return question;
    };

    function notifyObjectGenerator(url, qid, uid, e) {
        return {
            url: url,
            qid: qid,
            uid: uid,
            e: e
        };
    }
    self.getNotificationObjectsForResponses = function(question, userObjectId) {
        var notify = [];
        question = self.excludeResponses(question, userObjectId);
        question = self.extractResponsesValidatedToNotify(question);
        question = self.removeDuplicatedEmails(question);
        question = self.removeQuestionOwnerEmailFromResponses(question);
        for(var i=0; i<question.r.length; i++) {
            notify[i] = notifyObjectGenerator(question.url, question._id, question.r[i].u._id, question.r[i].u.e);
        }
        return notify;
    };


    function notifyToQuestionOwner(question, userIdToExclude) {
        if (question.v === true && question.n === true && question.u._id.toString() !== userIdToExclude.toString()) {
            var notification = notifyObjectGenerator(question.url, question._id, question.u._id, question.u.e);
            try {
                mailer.sendMail(mailer.notificationQuestionOwnerTemplate,
                    [notification.url, notification.qid, notification.uid],
                    notification.e);
            } catch(err) {
                throw err;
            }
        }
    };

    function notifyToResponseOwners(question, userObjectId) {
        var notifications = self.getNotificationObjectsForResponses(question, userObjectId);
        for(var i=0; i<notifications.length; i++){
            try {
                mailer.sendMail(mailer.notificationAfterResponseValidatedTemplate, [notifications[i].url, notifications[i].qid, notifications[i].uid], notifications[i].e);
            } catch(err) {
                throw err;
            }

        }
    };

    self.getResponseById = function(question, idResponseAdded) {
        return _.find(question.r, {_id: mongoose.Types.ObjectId(idResponseAdded)});
    }

    self.notifyByResponseValidatedUpdated = function (idResponseAdded, question) {
        dbStorage.forumDAO.loadQuestionWithUsers(question)
            .then(function (question) {
                var responseAdded = self.getResponseById(question, idResponseAdded);
                notifyToQuestionOwner(question, responseAdded.u._id);
                notifyToResponseOwners(question, responseAdded.u._id);
            }).fail(function (err) {
                errorHandler(err, "error retrieving emails to notifyByResponseValidatedUpdated; question id : ["+question._id+"]")
            });
    };

    self.notifyAfterQuestionUpdated = function(question) {
        dbStorage.forumDAO.loadQuestionWithUsers(question)
            .then(function (question) {
                notifyToResponseOwners(question, [{'u._id': question.u._id}]);
            }).fail(function (err) {
                errorHandler(err, "error retrieving emails to notifyAfterQuestionUpdated; question id : ["+question._id+"]")
            });
    }
};

var singleton = new Notifier();
module.exports = singleton;