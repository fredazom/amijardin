require('../public/javascripts/questionFormFields');
require('../public/javascripts/responseFormFields');
require('../public/javascripts/utils');
var express = require('express'),
    mailer = require('../models/Mailer.js'),
    notifier = require('../models/Notifier.js'),
    dbStorage = require('../models/DBStorage'),
    FormValidator = require('../models/questionResponseFormValidator'),
    validator = require('validator'),
    questionFormValidator = new FormValidator(global.questionFormFields),// global.questionFormFields initialized by require('./public/javascripts/questionFormFields')
    updateQuestionFormValidator = new FormValidator(global.updateQuestionFormFields),// global.questionFormFields initialized by require('./public/javascripts/questionFormFields')
    responseFormValidator = new FormValidator(global.responseFormFields),
    updateResponseFormValidator = new FormValidator(global.updateResponseFormFields),
    router = express.Router(),
    errorHandler = function(err, msg, next) {
        console.log(new Date() + ' : '+msg);
        console.log(err);
        next({status: 400});
    },
    validIdParameter = function(id, next) {
        if (!id || id.length > global.utils.MAX_ID_LENGTH || !validator.isHexadecimal(id)) {
            errorHandler(new Error("error validating id"), "error with ID passed as parameter", next);
            return false;
        }
        return true;
    };

router.get('/', function (req, res) {
    res.render('forum');
});

router.get('/question/:question', function (req, res, next) {
    // check if size less than 200 chars and if only alphanumeric
    if(req.params.question && global.questionFormFields.MAX_URL_SIZE >= req.params.question.length && /^\w+$/.test(req.params.question)) {
        dbStorage.forumDAO.findByURL.call({res: res, next: next}, req.params.question);
    } else {
        res.render('forum');
    }
});

router.get('/question', function (req, res, next) {
    try {
        dbStorage.forumDAO.getAllQuestions.call({res: res, next: next});
    } catch(err) {
        next({status: 400});
    }
});

router.post('/question/add', function (req, res, next) {

    if (!questionFormValidator.validate(req.body)) {
        next({status: 400, message: "error validating"});
        return;
    }

    try {
        var promise = dbStorage.userDAO.findOrSave({ps: req.body.ps, e: req.body.e});
        promise.then(function(user){
            return dbStorage.forumDAO.saveQuestion(req.body, user);
        }).then(function(question){

            mailer.sendMail(mailer.questionValidationTemplate, [question._id, question.u._id], req.body.e);
            const recipient = (process.env.NODE_ENV === 'development')?"fredazom@gmail.com":"info@genevecultive.ch";
            mailer.sendMail(mailer.questionAddNotificationForGCTeamTemplate, [question._id, question.u._id], recipient);

            res.send(JSON.stringify(question));
            res.end();
        }).fail(function(err) {
            console.log(new Date() + " : error thrown from findOrSave user or saving question");
            console.log(err);
            next({status: 400});
        }).done();
    } catch (err) {
        console.log(new Date() + " : error thrown from dbStorage saving question");
        console.log(err);
        next({status: 400});
    }

});

router.post('/question/:id/response/add', function (req, res, next) {

    if (!responseFormValidator.validate(req.body)) {
        next({status: 400, message: "error validating"});
        return;
    }
    if (validIdParameter(req.params.id, next)) {
        try {
            var promise = dbStorage.userDAO.findOrSave({ps: req.body.ps, e: req.body.e});
            promise.then(function (user) {
                return dbStorage.forumDAO.saveResponse(req.body, user);
            }).then(function (responses) {
                var responseAdded = responses.r[responses.r.length-1];
                mailer.sendMail(mailer.responseValidationTemplate, [responseAdded._id, responseAdded.u, req.params.id], req.body.e);
                const recipient = (process.env.NODE_ENV === 'development')?"fredazom@gmail.com":"info@genevecultive.ch";
                mailer.sendMail(mailer.responseNotificationForGCTeamTemplate, [responseAdded._id, responseAdded.u, req.params.id], recipient);
                res.send(JSON.stringify(responses));
                res.end();
            }).fail(function (err) {
                errorHandler(err, "error thrown from findOrSave user or saving response", next);
            }).done();
        } catch (err) {
            errorHandler(err, "error thrown from dbStorage saving response/findOrSave user", next);
        }
    }
});

router.get('/question/:id/validate', function(req, res, next){
    if (validIdParameter(req.params.id, next)) {
        try {
            dbStorage.forumDAO.validateQuestion(req.params.id).then(function (question) {
                console.log(new Date() + " : question [" + question._id + "] validated successfully");
                res.redirect("/forum#validate");
            }).fail(function (err) {
                errorHandler(err, "error validating question [" + req.params.id + "]", next);
            });
        } catch(err) {
            errorHandler(err, "error executing forumDAO.validateQuestion", next);
        }
    }
});

router.get('/question/response/:rid/validate', function(req, res, next){
    if (validIdParameter(req.params.rid, next)) {
        try {
            dbStorage.forumDAO.validateResponse(req.params.rid).then(function (question) {

                try {
                    notifier.notifyByResponseValidatedUpdated(req.params.rid, question);
                } catch(err) {
                    console.log(new Date() +" : error notifying after validating response [" + req.params.rid + "]");
                    console.log(err);
                }

                res.redirect("/forum/question/"+question.url+"#validate");
            }).fail(function (err) {
                errorHandler(err, "error validating response [" + req.params.rid + "]", next);
            });
        } catch(err) {
            errorHandler(err, "error executing forumDAO.validateResponse", next);
        }
    }
});

router.get('/question/:id/:uid/update', function(req, res, next){
    if (validIdParameter(req.params.uid, next) && validIdParameter(req.params.uid, next)) {
        try {
            dbStorage.userDAO.findByField({'_id': req.params.uid}).then(function(user){


                if (user) {
                    dbStorage.forumDAO.findByField({'_id': req.params.id}).then(function (question) {
                        if (question) {
                            res.render('questionTemplate', {edition: true, question: question});
                        } else {
                            errorHandler(new Error('question not found'), "question with id : [" + req.params.id + "] not found", next);
                        }

                    }).fail(function (err) {
                        errorHandler(err, "error from forumDAO updating question : [" + req.params.id + "]", next);
                    });
                } else {
                    errorHandler(new Error('user not found'), "user with id : [" + req.params.uid + "] not found", next);
                }



            }).fail(function (err) {
                errorHandler(err, "error from forumDAO updating question : [" + req.params.id + "]", next);
            });
        } catch(err) {
            errorHandler(err, "error forum route, getting page to update question", next);
        }
    }
});

router.get('/question/:qid/response/:id/:uid/update', function(req, res, next){
    if (validIdParameter(req.params.qid, next) && validIdParameter(req.params.id, next) && validIdParameter(req.params.uid, next)) {
        try {
            dbStorage.userDAO.findByField({'_id': req.params.uid}).then(function(user){


                if (user) {
                    // this query checks owner of response
                    dbStorage.forumDAO.findByField({_id: req.params.qid, 'r': {$elemMatch: {'_id': req.params.id, 'u': req.params.uid}}}).then(function (question) {
                        if (question) {
                            res.render('questionTemplate', {editionResponse: true, question: question, responseToUpdateId: req.params.id});
                        } else {
                            errorHandler(new Error('response not found'), "response with id : [" + req.params.id + "] and userId : ["+req.params.uid+"] not found", next);
                        }

                    }).fail(function (err) {
                        errorHandler(err, "error from forumDAO updating response : [" + req.params.id + "]", next);
                    });
                } else {
                    errorHandler(new Error('user not found'), "user with id : [" + req.params.uid + "] not found", next);
                }



            }).fail(function (err) {
                errorHandler(err, "error from forumDAO updating response : [" + req.params.id + "]", next);
            });
        } catch(err) {
            errorHandler(err, "error forum route, getting page to update response", next);
        }
    }
});


router.put('/question/:id/update', function(req, res, next){
    if (!updateQuestionFormValidator.validate(req.body)) {
        next({status: 400, message: "error validating"});
        return;
    }
    if (validIdParameter(req.params.id, next)) {
        try {
            dbStorage.forumDAO.findByField({_id: req.params.id}).then(function(question){
                if(question) {
                    if(question.u.toString() === req.body.uid) {


                        dbStorage.forumDAO.updateQuestion(req.body).then(function (question) {
                            if (question) {

                                try {
                                    notifier.notifyAfterQuestionUpdated(question);
                                } catch(err) {
                                    console.log(new Date() +" : error notifying after validating response [" + req.params.rid + "]");
                                    console.log(err);
                                }


                                res.send(JSON.stringify(question));
                                res.end();
                            } else {
                                errorHandler(new Error("question not found"), "question with id : [" + req.params.id + "] could not update", next);
                            }

                        }).fail(function (err) {
                            errorHandler(err, "error from POST method in forumDAO to update Question : [" + req.params.id + "]", next);
                        });


                    } else {
                        errorHandler(new Error("authorization error"), "user : ["+req.body.uid+"] does not have privilege to modifiy question : [" + req.params.id + "]", next);
                    }
                } else {
                    errorHandler(new Error("question not found"), "question with id : [" + req.params.id + "] could not fount to be updated", next);
                }
            }).fail(function (err) {
                errorHandler(err, "error finding question with id : [" + req.params.id + "]", next);
            });

        } catch(err) {
            errorHandler(err, "error executing forumDAO.updateQuestion", next);
        }
    }
});

router.put('/question/:qid/response/:rid/update', function(req, res, next){
    if (!updateResponseFormValidator.validate(req.body)) {
        next({status: 400, message: "error validating"});
        return;
    }
    if (validIdParameter(req.params.qid, next) && validIdParameter(req.params.rid, next)) {
        try {
            var responseId = req.params.rid;
            // find by question to speed up search, response id AND user id to make sure USER is the same that created the response
            dbStorage.forumDAO.findByField([{_id: req.params.qid, 'r': {$elemMatch: {'_id': responseId, 'u': req.body.uid}}}, {'r.$':  responseId}]).then(function(question){
                if(question && question.r[0]) {
                    // REDUNDANT CHECK actually... but maybe in future we will introduce roles
                    if(question.r[0].u.toString() === req.body.uid) {

                        // returns array of responses with ONLY updated response
                        dbStorage.forumDAO.updateResponse(req.body).then(function (question) {
                            if (question) {

                                notifier.notifyByResponseValidatedUpdated(req.params.rid, question);


                                res.send(JSON.stringify(question));
                                res.end();
                            } else {
                                errorHandler(new Error("response not found"), "response with id ["+req.params.rid+"] of question with id : [" + req.params.qid + "] could not update", next);
                            }

                        }).fail(function (err) {
                            errorHandler(err, "error from POST method in forumDAO to update Response : [" + req.params.rid + "]", next);
                        });


                    } else {
                        errorHandler(new Error("authorization error"), "user : ["+req.body.uid+"] does not have privilege to modify response : [" + req.params.rid + "]", next);
                    }
                } else {
                    errorHandler(new Error("question or response not found"), "question with id : [" + req.params.qid + "] or response with id ["+req.params.rid+"] with user id ["+req.body.uid+"] could not fount to be updated", next);
                }
            }).fail(function (err) {
                errorHandler(err, "error finding question with id : [" + req.params.qid + "] and response with id ["+req.params.rid+"] and user id ["+req.body.uid+"]", next);
            });

        } catch(err) {
            errorHandler(err, "error executing forumDAO.updateQuestion", next);
        }
    }
});

router.get('/question/:qid/user/:uid/unsubscribe', function(req, res, next){
    if (validIdParameter(req.params.qid, next) && validIdParameter(req.params.uid, next)) {
        try {
            dbStorage.forumDAO.unsubscribeByUser({qid: req.params.qid, uid:req.params.uid})
                .then(function(question){
                    if (question) {
                        res.redirect("/forum/question/"+question.url+"#unsubscribe");
                    } else {
                        res.redirect("/forum#unsubscribe");
                    }
                }).fail(function(err) {
                    errorHandler(err, "error unsubscribing", next);
                });

        } catch(err) {
            errorHandler(err, "error forum route variables passed, unsubscribing response for notifications", next);
        }
    }
});



dbStorage.on('questionFoundByURL', function(question, res) {
    res.render('questionTemplate', {question: question});
});

module.exports = router;
