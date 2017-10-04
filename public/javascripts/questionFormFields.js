/*jslint node: true */
/*jslint browser: true*/
(function () {
    "use strict";
    var context;

    function extend(target, source){
        for(var prop in source){
            if(target[prop]) {
                extend(target[prop], source[prop]);
            }else {
                target[prop] = source[prop];
            }
        }
    }

    var commonFields = {
        formFields: {
            s: {fieldLabel: 'Sujet'},
            t: {fieldLabel: 'Détails'}
        },
        validationRules: {
            s: {
                required: true,
                maxlength: 250
            },
            t: {
                textSize: 1.5 // size in MB
            }
        },
        MAX_URL_SIZE: 200
    };
    var UpdateQuestionFormFields = function () {
        var self = this;
        self.formFields = {
            qid: {fieldLabel: 'qid'},
            uid: {fieldLabel: 'uid'}
        };

        self.validationRules = {
            qid: {
                required:true,
                maxlength: 200
            },
            uid: {
                required:true,
                maxlength: 200
            }
        };


        extend(self, commonFields);
    };
    var QuestionFormFields = function () {
        var self = this;
        self.formFields = {
            ps: {fieldLabel: 'Pseudo'},
            e: {fieldLabel: 'Email'}
        };

        self.validationRules = {
            ps: {
                required: true,
                maxlength: 30
            },
            e: {
                required: true,
                extendedemail: true,
                maxlength: 50
            },
            n: {
                maxlength: 5
            }
        };


        extend(self, commonFields);
    };


    if (typeof window === 'undefined') {
        context = global;
    } else {
        context = window;
    }
    context.questionFormFields = new QuestionFormFields();
    context.updateQuestionFormFields = new UpdateQuestionFormFields();
}());