/*global console*/
/*jslint node: true */

var validator = require('validator');
var sanitizeHtml = require('sanitize-html');
require('../public/javascripts/utils.js');

(function () {
    "use strict";

    function sanitize(text) {
        return sanitizeHtml(text, {allowedTags: []});
    };

    var FormValidator = function (formFields) {
        var self = this;
        self.validate = function (body) {
            var fieldName, maxlength, required, form = formFields;

            for (fieldName in form.formFields) {
                if (form.formFields.hasOwnProperty(fieldName)) {
                    if (form.validationRules[fieldName] &&
                        form.validationRules[fieldName].maxlength) {

                        body[fieldName] = sanitize(body[fieldName]);

                        maxlength = form.validationRules[fieldName].maxlength;
                        required = form.validationRules[fieldName].required;
                        if (!utils.isValidLengthForRequiredOrNotEmptyField(required, maxlength, body[fieldName])) {
                            return false;
                        }
                        if (fieldName === 'e' && !validator.isEmail(body[fieldName])) {
                            return false;
                        }
                        if (fieldName === 'url' && !validator.isURL(body[fieldName], {require_protocol: true}) && body[fieldName] && body[fieldName].toString().trim() != '') {
                            return false;
                        }
                    } else if (form.validationRules[fieldName] &&
                        form.validationRules[fieldName].textEmpty) {
                        if(body[fieldName] === "<br>" || body[fieldName] === "") {
                            return false;
                        }
                    } else if (form.validationRules[fieldName] &&
                        form.validationRules[fieldName].validDate &&
                        body[fieldName] && body[fieldName].toString().trim() != '' &&
                        !utils.dateValidator(body[fieldName])) {
                            return false;
                    }

                }
                    // size of whole text cannot be bigger than 2 mB, this is checked by body-parser in app.js : app.post('/forum/question/add', ...)
            }
            return true;
        };
    };

    module.exports = FormValidator;
}());
