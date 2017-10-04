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
            l: {fieldLabel: 'Login'},
            p: {fieldLabel: 'Mot de passe'}
        },
        validationRules: {
            l: {
                required: true,
                maxlength: 250
            },
            p: {
                required: true,
                maxlength: 250
            }
        }
    };
    var LoginAdminFormFields = function () {
        var self = this;
        self.formFields = {
            p2: {fieldLabel: 'Mot de passe 1'},
            p3: {fieldLabel: 'Mot de passe 2'}
        };

        self.validationRules = {
            p2: {
                required: true,
                maxlength: 250
            },
            p3: {
                required: true,
                maxlength: 250
            }
        };


        extend(self, commonFields);
    };

    if (typeof window === 'undefined') {
        context = global;
    } else {
        context = window;
    }
    context.loginAdminFormFields = new LoginAdminFormFields();
}());