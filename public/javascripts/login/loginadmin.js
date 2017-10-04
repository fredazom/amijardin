$(function() {
    "use strict";

    var Form = function() {
            var form = this,
                submitButton, formContainer;

            function submitCallback(e) {
                if (form.isValid()) {

                    var promise = $.ajax({
                        type: "POST",
                        url: '/login/auth/admin',
                        data: form.$dom.serialize(),
                        cache: false
                    });
                    /*jslint unparam: true*/
                    promise.then(function (question, textStatus, jqXHR) {

                    }).fail(function (jqXHR, textStatus, err) {
                        formContainer.shake();
                    });



                } else {
                    console.log("form not valid");
                }

                e.preventDefault();
            }

            form.isValid = function() {
                return form.$dom.valid();
            }

            function initValidator() {
                form.validator = form.$dom.validate({
                    ignore: ":hidden:not(#t)",
                    rules: window.loginAdminFormFields.validationRules,
                    messages: {
                        l: {
                            required: "Champ obligatoire",
                            maxlength: "Max {0} digits"
                        },
                        p: {
                            required: "Champ obligatoire",
                            maxlength: "Max {0} caractères"
                        },
                        p2: {
                            required: "Champ obligatoire",
                            maxlength: "Max {0} caractères"
                        },
                        p3: {
                            required: "Champ obligatoire",
                            maxlength: "Max {0} caractères"
                        }
                    },
                    highlight: utils.validatorHighlight,
                    unhighlight: utils.validatorUnhighlight
                });
            }


            function bind() {
                form.$dom = $('#login-add-form');
            }
            function init() {
                bind();
                initValidator();
                formContainer = new Shaker("#login-add-form-container");
                submitButton = utils.Button("#login-add-form .submit", submitCallback);
            }
            init();
        },
        Shaker = function(selector) {
            var self = this;
            self.shake = function() {
                self.$dom.addClass("shake");
                setTimeout(function (e) {
                    self.$dom.removeClass("shake");
                },1000);
            };
            function bind() {
                self.$dom = $(selector);
            }
            bind();
        }

    var form = new Form();

});