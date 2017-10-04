/**
 * Created by fmesia on 21.07.2015.
 */
/*global console*/
/*jslint node: true */

var validator = require('validator');
require('../public/javascripts/formFields');// necessary to load formFields and set it in global variable
require('../public/javascripts/utils.js');

(function () {
    "use strict";
    var FormValidator = function () {
        var self = this;
        self.validate = function (body) {
            var fieldKey, maxlength, required, form = global.formFields;

            for (fieldKey in form.formFields) {
                if (form.formFields.hasOwnProperty(fieldKey)) {



                    if(fieldKey === 'classifications') {

                        maxlength = form.validationRules['classifications'].maxlength;
                        for(var i = 0; i<body[form.formFields[fieldKey].fieldName].length;i++) {
                            //only required for 1st classification
                            required = (i===0);
                            if (!utils.isValidLengthForRequiredOrNotEmptyField(required, maxlength, body[form.formFields[fieldKey].fieldName][i])) {
                                console.log(new Date() + " :  Error validating classifications, too long or empty");
                                return false;
                            }
                        }

                    } else if (form.validationRules[form.formFields[fieldKey].fieldName] &&
                            form.validationRules[form.formFields[fieldKey].fieldName].maxlength) {

                        maxlength = form.validationRules[form.formFields[fieldKey].fieldName].maxlength;
                        required = form.validationRules[form.formFields[fieldKey].fieldName].required;
                        if (!utils.isValidLengthForRequiredOrNotEmptyField(required, maxlength, body[form.formFields[fieldKey].fieldName])) {
                            console.log(new Date() + " :  Error validating "+fieldKey);
                            return false;
                        }
                        //if( (required || body[form.formFields[fieldKey].fieldName].toString() != '')  && !validator.isLength(body[form.formFields[fieldKey].fieldName], 1, 2) ) {//maxlength) ) {
                        //    return false;
                        //}
                        if (form.formFields[fieldKey].fieldName === 'email' && !validator.isEmail(body[form.formFields[fieldKey].fieldName])) {
                            return false;
                        } else if (form.formFields[fieldKey].fieldName === 'area' && body[form.formFields[fieldKey].fieldName].toString() != '') {
                            if (validator.isNumeric(body[form.formFields[fieldKey].fieldName])) {
                                var result = parseInt(body[form.formFields[fieldKey].fieldName], 10) > 0;
                                if(!result){console.log(new Date() + " :  Error validating area");}
                                return result;
                            }
                            return false;
                        } else if (form.formFields[fieldKey].fieldName === 'website' && body[form.formFields[fieldKey].fieldName].toString() != '' &&
                            !validator.isURL(body[form.formFields[fieldKey].fieldName].toString(), {require_protocol: true})) {
                            console.log(new Date() + " :  Error validating url");
                            return false;
                        }

                    }
                }
            }
            return true;
        };
    };

    module.exports = new FormValidator();
}());
