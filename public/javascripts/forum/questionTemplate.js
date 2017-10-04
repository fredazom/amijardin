$(function() {
    "use strict";

    var $dispatcher = $({}),
        RawDate = function(id) {
            var self = this;
            self.getContent = function() {
                return self.$dom.text();
            };
            function bind() {
                self.$dom = $(id);
            }
            bind();
        },
        DateFormatted = function() {
            var self = this, rawDate;
            function populate() {
                self.$dom.html(utils.toLocalDateTime(new Date(rawDate.getContent())));
            }
            function bind() {
                self.$dom = $(".dateFormatted"); // 2 elements with same class
            }
            function init() {
                bind();
                rawDate = new RawDate('#rawDate');
                populate();
            }
            init();
        },
        EditDateFormatted = function(selector) {
            var self = this, rawDate;
            function hide() {
                self.$dom.addClass("hide");
            }
            function show() {
                self.$dom.removeClass("hide");
            }
            self.populate = function(data) {
                if (data === "") {
                    hide();
                } else {
                    self.$dom.html(utils.toLocalDateTime(new Date(data)));
                    show();
                }
            };
            function bind() {
                self.$dom = $(selector);
            }
            function init() {
                bind();
            }
            init();
        },
        ResponseSection = function() {
            var self = this;
            function bind() {
                self.$dom = $('#response-section');
                self.$responses = self.$dom.find(".text");
                self.$dates = self.$dom.find(".d span");
            }
            function formatTexts() {
                self.$responses.each(function(index, responseField){
                    responseField = $(responseField);
                    responseField.html(responseField.text());
                });
            }
            function formatDates() {
                self.$dates.each(function(index, dateField){
                    var $dateField = $(dateField)
                    if($dateField.html() === "") {
                        $dateField.addClass("hide");
                        return;
                    }
                    $dateField.html(utils.toLocalDateTime(new Date($dateField.html())));
                });
            }
            function init() {
                bind();
                formatTexts();
                formatDates();
            }
            init();
        },
        RawText = function() {
            var self = this;
            self.getContent = function() {
                return self.$dom.text();
            };
            function bind() {
                self.$dom = $("#rawText");
            }
            bind();
        },
        TextFormatted = function(selector) {
            var self = this;
            function bind() {
                self.$dom = $(selector);
            }
            function decode(text) {
                text = $("<textarea/>").html(text).text();
                return text;
            }
            function show() {
                self.$dom.removeClass("hide");
            }
            function hide() {
                self.$dom.addClass("hide");
            }
            self.populate = function(htmlText) {
                var formattedText = decode(htmlText);
                self.$dom.html(formattedText);
                if (self.$dom.text().trim() === "") {
                    hide();
                } else {
                    show();
                }
            }
            function init() {
                bind();
            }
            init();

        };
    new DateFormatted();
    new ResponseSection();
    var editDateFormatted = new EditDateFormatted("#question-details-container .editDateFormatted, #question-update-form .editDateFormatted");
    editDateFormatted.populate(new RawDate('#rawEditDate').getContent());
    var textFormatted = new TextFormatted("#textFormatted");
    textFormatted.populate(new RawText().getContent());



    function initResponseSection() {

        // response comment form

        var Form = function() {
                var form = this, submitButton, errorMessage, successMessage, cancelButton;
                form.fields = {};

                form.isDirty = function() {
                    var initialValue = false;
                    return _.reduce(form.fields, function(result, formField, key) {
                        return result || formField.isDirty();
                    }, initialValue);
                };

                function checkDirty() {
                    if(form.isDirty()) {
                        $dispatcher.trigger(Form.DIRTY);
                    } else {
                        $dispatcher.trigger(Form.NOT_DIRTY);
                    }
                };

                function hide () {
                    form.$dom.addClass("hide");
                }

                function reset() {
                    for (var key in form.fields) {
                        if (form.fields.hasOwnProperty(key)) {
                            form.fields[key].reset();
                        }
                    }
                };

                function resetAndHide() {
                    reset();
                    hide();
                }

                form.isValid = function() {
                    return form.$dom.valid();
                }

                function initValidator() {
                    form.validator = form.$dom.validate({
                        ignore: ":hidden:not(#t, #qid)",
                        rules: window.responseFormFields.validationRules,
                        messages: {
                            t: {
                                required: "Champ obligatoire",
                                textEmpty: "Champ obligatoire"
                            },
                            ps: {
                                required: "Champ obligatoire",
                                maxlength: "Max {0} caractères"
                            },
                            e: {
                                required: "Champ obligatoire",
                                maxlength: "Max {0} caractères"
                            },
                            qid: {
                                required: "Champ obligatoire",
                                maxlength: "Max {0} caractères"
                            }
                        },
                        highlight: function(element, errorClass) {
                            utils.validatorHighlight(element, errorClass);
                            if($(element).attr("name") === 't') {
                                $('.wysiwyg-container').addClass('editor-error');
                            }
                        },
                        unhighlight: function(element, errorClass) {
                            utils.validatorUnhighlight(element, errorClass);
                            if($(element).attr("name") === 't') {
                                $('.wysiwyg-container').removeClass('editor-error');
                            }
                        }
                    });

                    $.validator.addMethod("extendedemail", utils.emailValidator, "Format erroné: email@example.com");

                    $.validator.addMethod("textSize", function (value, element, params) {
                        var MAX_SIZE = params * 1024 * 1024;
                        if (element && element.value) {
                            if (element.value.length > MAX_SIZE) {
                                return false;
                            }
                        }
                        return true;
                    }, "La taille totale des 'Détails' est limitée à {0} MB");

                    $.validator.addMethod("textEmpty", function(value, element, params) {
                        if ($('.wysiwyg-editor').text().trim() === '') {
                            return false;
                        }
                        return true;
                    });
                }

                function submitCallback(e) {
                    if(form.isValid()) {
                        var id = form.$dom.find('#qid').val(), promise;
                        $dispatcher.trigger(Form.PROCESSING);
                        promise = $.ajax({
                            type: "POST",
                            url: '/forum/question/'+id+'/response/add',
                            data: form.$dom.serialize(),
                            cache: false
                        });
                        promise.then(function (question, textStatus, jqXHR) {
                            $dispatcher.trigger(Form.SUCCESS, question);
                        }).fail(function (jqXHR, textStatus, err) {
                            $dispatcher.trigger(Form.ERROR, err);
                        });

                    }

                    e.preventDefault();
                }

                function init() {
                    form.$dom = $('#response-comment-form');
                    initValidator();
                    form.fields["t"] = new utils.Textarea("#t");
                    form.fields["ps"] = new utils.Input("#ps");
                    form.fields["e"] = new utils.Input("#e");
                    submitButton = new utils.Button("#response-comment-form .submit", submitCallback);
                    errorMessage = new utils.ShowHide("#response-comment-section .error-message");
                    successMessage = new utils.ShowHide("#response-comment-section .success-message");
                    cancelButton = new utils.Button("#response-comment-form .cancel", function(e) {
                        $dispatcher.trigger(Form.CANCEL_PRESSED);
                    });
                }
                init();
                $dispatcher.on(Form.SUCCESS, function() {
                    resetAndHide();
                    errorMessage.hide();
                    successMessage.show();
                });
                $dispatcher.on(Form.ERROR, function() {
                    errorMessage.show();
                });
                $dispatcher.on(Form.PROCESSING, function() {
                    errorMessage.hide();
                });
                $dispatcher.on(Form.CANCEL_PRESSED, checkDirty);


            };

        Form.PROCESSING = "question_processing";
        Form.SUCCESS = "question_add_success";
        Form.ERROR = "question_add_error";
        Form.DIRTY = "form-dirty";
        Form.NOT_DIRTY = "form-not-dirty";
        Form.CANCEL_PRESSED = "cancel-pressed";


        var form = new Form(),
            submissionIndicator = new utils.ShowHide("#response-comment-section .submission-indicator"),
            warningWindow = new utils.WarningWindow("#close-response-confirmation", $dispatcher);
        $dispatcher.on(Form.DIRTY, warningWindow.show);
        $dispatcher.on(utils.WarningWindow.OK_PRESSED, function() {
            window.location.href = '/forum';
        });
        $dispatcher.on(Form.NOT_DIRTY, function() {
            window.location.href = '/forum';
        });
        $dispatcher.on(Form.SUCCESS, function(){
            submissionIndicator.hide();
        });
        $dispatcher.on(Form.ERROR, function(){
            submissionIndicator.hide();
        });
        $dispatcher.on(Form.PROCESSING, function(){
            submissionIndicator.show();
        });

    }

    // end of response comment form



    // start update question

    function initUpdateQuestionSection() {

        var UpdateQuestionForm = function() {
            var form = this, submitButton, cancelButton;

            function bind() {
                form.$dom = $('#question-update-form');
            }

            function initValidator() {
                form.validator = form.$dom.validate({
                    ignore: ":hidden:not(#t, #qid, #uid)",
                    rules: window.updateQuestionFormFields.validationRules,
                    messages: {
                        t: {
                            textSize: "La taille du texte est trop grande" // size in MB
                        },
                        s: {
                            required: "Champ obligatoire",
                            maxlength: "Max {0} caractères"
                        },
                        qid: {
                            required: "Champ obligatoire",
                            maxlength: "Max {0} caractères"
                        },
                        uid: {
                            required: "Champ obligatoire",
                            maxlength: "Max {0} caractères"
                        }
                    },
                    highlight: function(element, errorClass) {
                        utils.validatorHighlight(element, errorClass);
                        if($(element).attr("name") === 't') {
                            $('.wysiwyg-container').addClass('editor-error');
                        }
                    },
                    unhighlight: function(element, errorClass) {
                        utils.validatorUnhighlight(element, errorClass);
                        if($(element).attr("name") === 't') {
                            $('.wysiwyg-container').removeClass('editor-error');
                        }
                    }
                });

                $.validator.addMethod("textSize", function (value, element, params) {
                    var MAX_SIZE = params * 1024 * 1024;
                    if (element && element.value) {
                        if (element.value.length > MAX_SIZE) {
                            return false;
                        }
                    }
                    return true;
                }, "La taille totale des 'Détails' est limitée à {0} MB");
            }

            form.isValid = function() {
                return form.$dom.valid();
            }

            function submitCallback(e) {
                if(form.isValid()) {
                    var id = form.$dom.find('#qid').val(), promise;
                    $dispatcher.trigger(UpdateQuestionForm.PROCESSING);
                    promise = $.ajax({
                        type: "PUT",
                        url: '/forum/question/'+id+'/update',
                        data: form.$dom.serialize(),
                        cache: false
                    });
                    promise.then(function (question, textStatus, jqXHR) {
                        $dispatcher.trigger(UpdateQuestionForm.SUCCESS, JSON.parse(question));
                    }).fail(function (jqXHR, textStatus, err) {
                        $dispatcher.trigger(UpdateQuestionForm.ERROR, err);
                    });

                }

                e.preventDefault();
            }

            function cancelCallback(e) {
                $dispatcher.trigger(UpdateQuestionForm.CANCEL_PRESSED);
            }

            function init() {
                bind();
                initValidator();
                submitButton = new utils.Button("#question-update-form .submit", submitCallback);
                cancelButton = new utils.Button("#question-update-form .cancel", cancelCallback);
            }
            init();
        },
        Subject = function(selector) {
            var self = this;
            self.show = function() {
                self.$dom.removeClass('hide');
            }
            self.hide = function() {
                self.$dom.addClass('hide');
            }
            function bind() {
                self.$dom = $(selector);
            };
            self.setContent = function(data) {
                self.$dom.html(data);
            }
            bind();
        };
        UpdateQuestionForm.PROCESSING = "update_form_processing";
        UpdateQuestionForm.SUCCESS = "update_form_success";
        UpdateQuestionForm.ERROR = "update_form_error";
        UpdateQuestionForm.CANCEL_PRESSED = "update_form_cancel_pressed";
        UpdateQuestionForm.EDITOR_BUTTON_PRESSED = "update_form_editor_pressed";


        var updateQuestionForm = new UpdateQuestionForm(),
            questionDetailsContainer = new utils.ShowHide('#question-details-container'),
            questionUpdateContainer = new utils.ShowHide('#question-update-container'),
            subject = new Subject('.subject'),
            errorMessage = new utils.ShowHide('#question-update-container .error-message'),
            submissionIndicator = new utils.ShowHide('#question-update-container .submission-indicator'),
            editorButton = new utils.Button('#question-details-container .edition-icon', function(){
                $dispatcher.trigger(UpdateQuestionForm.EDITOR_BUTTON_PRESSED);
            });
        $dispatcher.on(UpdateQuestionForm.CANCEL_PRESSED, function() {
            questionUpdateContainer.hide();
            questionDetailsContainer.show();
            subject.show();
        });
        $dispatcher.on(UpdateQuestionForm.EDITOR_BUTTON_PRESSED, function() {
            questionUpdateContainer.show();
            questionDetailsContainer.hide();
            subject.hide();
        });
        $dispatcher.on(UpdateQuestionForm.SUCCESS, function(e, question) {
            editDateFormatted.populate(question.ed);
            textFormatted.populate(question.t);
            subject.setContent(question.s);
            subject.show();
            questionUpdateContainer.hide();
            questionDetailsContainer.show();
            errorMessage.hide();
            submissionIndicator.hide();
        });
        $dispatcher.on(UpdateQuestionForm.PROCESSING, function(e, question) {
            errorMessage.hide();
            submissionIndicator.show();
        });
        $dispatcher.on(UpdateQuestionForm.ERROR, function(e, question) {
            errorMessage.show();
            submissionIndicator.hide();
        });

    }

    function initUpdateResponseSection() {
        
        var UpdateResponseForm = function() {
            var form = this, submitButton, cancelButton;

            form.hide = function() {
                form.$dom.addClass("hide");
            }

            form.show = function() {
                form.$dom.removeClass("hide");
                setFocus();
            }

            form.isValid = function() {
                return form.$dom.valid();
            }

            function setFocus() {
                form.$editor.find('.wysiwyg-editor').focus();
            }

            function initValidator() {
                form.validator = form.$dom.validate({
                    ignore: ":hidden:not(#t, #qid)",
                    rules: window.responseFormFields.validationRules,
                    messages: {
                        t: {
                            required: "Champ obligatoire",
                            textEmpty: "Champ obligatoire"
                        }
                    },
                    highlight: function(element, errorClass) {
                        utils.validatorHighlight(element, errorClass);
                        if($(element).attr("name") === 't') {
                            $('.wysiwyg-container').addClass('editor-error');
                        }
                    },
                    unhighlight: function(element, errorClass) {
                        utils.validatorUnhighlight(element, errorClass);
                        if($(element).attr("name") === 't') {
                            $('.wysiwyg-container').removeClass('editor-error');
                        }
                    }
                });

                $.validator.addMethod("textSize", function (value, element, params) {
                    var MAX_SIZE = params * 1024 * 1024;
                    if (element && element.value) {
                        if (element.value.length > MAX_SIZE) {
                            return false;
                        }
                    }
                    return true;
                }, "La taille totale des 'Détails' est limitée à {0} MB");

                $.validator.addMethod("textEmpty", function(value, element, params) {
                    if ($('.wysiwyg-editor').text().trim() === '') {
                        return false;
                    }
                    return true;
                });
            }

            function submitCallback(e) {
                if(form.isValid()) {
                    var qid = form.$dom.find('#qid').val(),
                        rid = form.$dom.find('#rid').val(),
                        promise;
                    $dispatcher.trigger(UpdateResponseForm.PROCESSING);
                    promise = $.ajax({
                        type: "PUT",
                        url: '/forum/question/'+qid+'/response/'+rid+'/update',
                        data: form.$dom.serialize(),
                        cache: false
                    });
                    promise.then(function (question, textStatus, jqXHR) {
                        $dispatcher.trigger(UpdateResponseForm.SUCCESS, question);
                    }).fail(function (jqXHR, textStatus, err) {
                        $dispatcher.trigger(UpdateResponseForm.ERROR, err);
                    });

                }

                e.preventDefault();
            }

            function bind() {
                form.$dom = $('#response-comment-update-form');
                form.$editor = $('#response-comment-update-form .wysiwyg-container');
            }

            function init() {
                bind();
                initValidator();
                submitButton = new utils.Button("#response-comment-update-form .submit", submitCallback);
                cancelButton = new utils.Button("#response-comment-update-form .cancel", function(e) {
                    $dispatcher.trigger(UpdateResponseForm.CANCEL_PRESSED);
                });
                setFocus();
            }
            init();
        };
        UpdateResponseForm.PROCESSING = "update_response_form_processing";
        UpdateResponseForm.SUCCESS = "update_response_form_success";
        UpdateResponseForm.ERROR = "update_response_form_error";
        UpdateResponseForm.CANCEL_PRESSED = "update_response_form_cancel_pressed";
        UpdateResponseForm.EDITOR_BUTTON_PRESSED = "update_response_form_editor_pressed";
        
        var errorMessage = new utils.ShowHide("#response-comment-update-container .error-message"),
            updateResponseForm = new UpdateResponseForm(),
            updateResponseText = new TextFormatted("#response-comment-update-view .text"),
            updateResponseEditDates = new EditDateFormatted("#response-comment-update-form .editDateFormatted, #response-comment-update-view .editDateFormatted"),
            submissionIndicator = new utils.ShowHide("#response-comment-update-container .submission-indicator"),
            editorButton = new utils.Button('#response-comment-update-view .edition-icon', function(){
                $dispatcher.trigger(UpdateResponseForm.EDITOR_BUTTON_PRESSED);
            }),
            responseCommentUpdateView = new utils.ShowHide("#response-comment-update-view");

        responseCommentUpdateView.show = function() {
            var $textField = responseCommentUpdateView.$dom.find('.text');
            responseCommentUpdateView.$dom.removeClass('hide');
            $textField.addClass('highlight-in');
            setTimeout(function(){
                $textField.addClass('highlight-out');
            }, 2000);
            setTimeout(function(){
                $textField.removeClass('highlight-in highlight-out');
            }, 5000);
        };

        $dispatcher.on(UpdateResponseForm.SUCCESS, function(e, question) {
            var questionParsed = JSON.parse(question);
            errorMessage.hide();
            updateResponseForm.hide();
            responseCommentUpdateView.show();
            updateResponseText.populate(questionParsed.r[0].t);
            updateResponseEditDates.populate(questionParsed.r[0].ed);
            submissionIndicator.hide();
        });
        $dispatcher.on(UpdateResponseForm.ERROR, function() {
            errorMessage.show();
            submissionIndicator.hide();
        });
        $dispatcher.on(UpdateResponseForm.PROCESSING, function() {
            errorMessage.hide();
            submissionIndicator.show();
        });
        $dispatcher.on(UpdateResponseForm.CANCEL_PRESSED, function(){
            updateResponseForm.hide();
            responseCommentUpdateView.show();
            errorMessage.hide();
        });
        $dispatcher.on(UpdateResponseForm.EDITOR_BUTTON_PRESSED, function(){
            updateResponseForm.show();
            responseCommentUpdateView.hide();
        });
        
    }

    if($('#question-update-container').length > 0) {
        initUpdateQuestionSection();
    } else if($('#response-comment-update-container').length > 0) {
        initUpdateResponseSection();
    } else {
        initResponseSection();
    }


    //end update question
});