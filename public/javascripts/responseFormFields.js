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
            formFields : {
                t: {fieldLabel: 'Réponse / commentaire'},
                qid: {fieldLabel: 'qid'}
            },
            validationRules : {
                t: {
                    required: true,
                    textEmpty: true,
                    textSize: 1.5 // size in MB
                },
                qid: {
                    required:true,
                    maxlength: 200
                }
            }
        },
        UpdateResponseFormFields = function() {
            var self = this;
            self.formFields =  {
                rid: {fieldLabel: 'rid'},
                uid: {fieldLabel: 'uid'}
            };
            self.validationRules = {
                rid: {
                    required:true,
                    maxlength: 200
                },
                uid: {
                    required:true,
                    maxlength: 200
                }
            };
            extend(self, commonFields);
        },
        ResponseFormFields = function () {
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
            }
        };

        self.MAX_URL_SIZE = 200;
        extend(self, commonFields);
    };
    if (typeof window === 'undefined') {
        context = global;
    } else {
        context = window;
    }
    context.responseFormFields = new ResponseFormFields();
    context.updateResponseFormFields = new UpdateResponseFormFields();
}());