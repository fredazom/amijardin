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

    var NouvellesAdminFormFields = function () {
        var self = this;
        self.formFields = {
            s: {fieldLabel: 'Sujet'},
            t: {fieldLabel: 'Texte'},
            v: {fieldLabel: 'Option visibilité'},
            nid: {fieldLabel: 'id'},
            url: {fieldLabel: 'URL'},
            f: {fieldLabel: 'Événement à partir de'},
            to: {fieldLabel: "jusqu'à"}
        };

        self.validationRules = {
            s: {
                required: true,
                maxlength: 250
            },
            t: {
                required: true,
                textEmpty: true,
                textSize: 1.5
            },
            v: {
                maxlength: 10
            },
            nid: {
                maxlength: 200
            },
            url: {
                maxlength: 200,
                url: true
            },
            f: {
                //maxlength not necessary because homemade validDate validation rule checks it, otherwise it wouldn't be validated by questionResponseFormValidator!
                required: false,
                validDate: {
                    depends: function(element) {
                        return !(element.value == '');
                    }
                }

            },
            to: {
                //maxlength not necessary because homemade validDate validation rule checks it, otherwise it wouldn't be validated by questionResponseFormValidator!
                required: false,
                validDate: {
                    depends: function(element) {
                        return !(element.value == '');
                    }
                },
                fromMissing: {
                    depends: function(element) {
                        return !(element.value == '');
                    }
                }
            }
        };


    };

    if (typeof window === 'undefined') {
        context = global;
    } else {
        context = window;
    }
    context.nouvellesAdminFormFields = new NouvellesAdminFormFields();
}());