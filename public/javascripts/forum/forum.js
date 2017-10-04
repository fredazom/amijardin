$(function() {
    "use strict";

    var $dispatcher = $({});
    var CreateQuestionButton = function() {
        var self = this;
        function broadcastShowEditor() {
            $dispatcher.trigger(CreateQuestionButton.SHOW_EDITOR);
        }
        function bind() {
            self.$dom = $(".create-button");
            self.$dom.on('click', broadcastShowEditor);
        }
        bind();
    };
    CreateQuestionButton.SHOW_EDITOR = "showEditor";

    var Form = function() {
        var form = this, submitButton, errorMessage;
        form.fields = {};
        var Input = function(id) {
                var self = this;
                self.$dom = $("#"+id);
                self.isDirty = function() {
                    return self.$dom.val().trim() != "";
                };
            },
            Textarea = function() {
                var self = this;
                self.isDirty = function() {
                    var html = $("#t").wysiwyg('shell').getHTML();
                    return html != "<br>" && html != "";
                };
            },
            SubmitButton = function() {
                var self = this, promise;
                function ajaxSubmit(e) {

                    if(form.isValid()) {
                        $dispatcher.trigger(Form.PROCESSING);
                        promise = $.ajax({
                            type: "POST",
                            url: '/forum/question/add',
                            data: form.$dom.serialize(),
                            cache: false
                        });
                        /*jslint unparam: true*/
                        promise.then(function (question, textStatus, jqXHR) {
                            $dispatcher.trigger(Form.SUCCESS, question);
                        }).fail(function (jqXHR, textStatus, err) {
                            $dispatcher.trigger(Form.ERROR, err);
                        });

                    }

                    e.preventDefault();

                };
                function bind() {
                    self.$dom = $("#submit");
                    self.$dom.on('click', ajaxSubmit)
                };
                bind();
            },
            ErrorMessage = function() {
                var self = this;
                function show() {
                    self.$dom.removeClass("hide");
                }
                function hide() {
                    self.$dom.addClass("hide");
                }
                function bind() {
                    self.$dom = $('.error-message');
                }
                bind();
                $dispatcher.on(Form.ERROR, show);
                $dispatcher.on(Form.SUCCESS, hide);
                $dispatcher.on(WarningWindow.HIDE_EDITOR, hide);
                $dispatcher.on(EditorSection.EDITOR_CLOSED, hide);
            };

        form.isDirty = function() {
            var initialValue = false;
            return _.reduce(form.fields, function(result, formField, key) {
                return result || formField.isDirty();
            }, initialValue);
        };

        form.isValid = function() {
            return form.$dom.valid();
        }

        function initValidator() {
            form.validator = form.$dom.validate({
                ignore: ":hidden:not(#t)",
                rules: window.questionFormFields.validationRules,
                messages: {
                    s: {
                        required: "Champ obligatoire",
                        maxlength: "Max {0} digits"
                    },
                    ps: {
                        required: "Champ obligatoire",
                        maxlength: "Max {0} caractères"
                    },
                    e: {
                        required: "Champ obligatoire",
                        maxlength: "Max {0} caractères"
                    },
                    n: { // ne for notify checkbox
                        maxlength: "Max {0} caractères" // avoid injection of whatever it could be
                    }
                },
                highlight: utils.validatorHighlight,
                unhighlight: utils.validatorUnhighlight
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
        }

        function init() {
            form.$dom = $('#question-form');
            initValidator();
            form.fields["s"] = new Input("s");
            form.fields["t"] = new Textarea("t");
            form.fields["ps"] = new Input("ps");
            form.fields["e"] = new Input("e");
            submitButton = new SubmitButton();
            errorMessage = new ErrorMessage();
        }
        init();

    };

    Form.PROCESSING = "question_processing";
    Form.SUCCESS = "question_add_success";
    Form.ERROR = "question_add_error";

    var WarningWindow = function() {
        var warningWindow = this, warningCancelButton, warningOkButton,
            WarningCancelButton = function(){
                var self = this;
                function bind() {
                    self.$dom = $("#close-question-confirmation .cancel");
                    self.$dom.on("click", function(){
                        hideWarningWindow();
                    });
                };
                bind();
            },
            WarningOkButton = function(){
                var self = this;
                function bind() {
                    self.$dom = $("#close-question-confirmation .ok");
                    self.$dom.on("click", function(){
                        hideWarningWindow();
                        $dispatcher.trigger(WarningWindow.HIDE_EDITOR);
                    });
                };
                bind();
            };
        function showWarningWindow() {
            warningWindow.$dom.addClass("show");
        };
        function hideWarningWindow()  {
            warningWindow.$dom.removeClass("show");
        };
        function bind() {
            warningWindow.$dom = $("#close-question-confirmation");
        }
        function init() {
            bind();
            warningCancelButton = new WarningCancelButton();
            warningOkButton = new WarningOkButton();
        }
        $dispatcher.on(EditorSection.FORM_DIRTY, showWarningWindow);
        init();
    };
    WarningWindow.HIDE_EDITOR= "hideEditor";

    var EditorSection = function() {
        var self = this, form, editorCancelButton, submissionIndicator;

        var SubmissionIndicator = function() {
            var self = this;
            function show() {
                self.$dom.removeClass('hide');
            }
            function hide() {
                self.$dom.addClass('hide');
            }
            function bind() {
                self.$dom = $('.submission-indicator');
            };
            $dispatcher.on(Form.SUCCESS, hide);
            $dispatcher.on(Form.ERROR, hide);
            $dispatcher.on(Form.PROCESSING, show);
            bind();
        };

        var CancelButton = function() {
            var self = this;
            function bind() {
                self.$dom = $("#cancel");
                self.$dom.on('click', checkDirty)
            };
            bind();
        };

        function showEditor() {
            $("#forum-question-section").removeClass("hide");
        }
        function hideEditor() {
            $("#forum-question-section").addClass("hide");
        }
        function checkDirty() {
            if(form.isDirty()) {
                $dispatcher.trigger(EditorSection.FORM_DIRTY);
            } else {
                hideEditor();
                $dispatcher.trigger(EditorSection.EDITOR_CLOSED);
            }
        }
        function init() {
            editorCancelButton = new CancelButton();
            form = new Form();
            submissionIndicator = new SubmissionIndicator();
        }
        $dispatcher.on(CreateQuestionButton.SHOW_EDITOR, showEditor);
        $dispatcher.on(WarningWindow.HIDE_EDITOR, hideEditor);
        $dispatcher.on(Form.SUCCESS, hideEditor);
        init();
    };
    EditorSection.FORM_DIRTY = "formDirty";
    EditorSection.EDITOR_CLOSED = "closeEditor";

    var ContentSection = function() {
        var self = this, questionsSection, loadErrorMessage, successMessage,
            SuccessMessage = function() {
                var self = this;
                function show() {
                    self.$dom.removeClass("hide");
                }
                function bind() {
                    self.$dom = $('.success-message');
                }
                bind();
                $dispatcher.on(Form.SUCCESS, show);
            },
            QuestionsSection = function() {

                var self = this;

                function displayQuestion(question) {
                    var date = new Date(Date.parse(question.li)),
                        formattedDate = utils.toLocalDateTime(date);
                    self.$dom.prepend("<div><a href='/forum/question/"+question.url+"'>"+question.s+"</a><span class='ps'>"+question.ps+"</span><span class='d'>"+formattedDate+"</span></div>");
                }

                function fetchQuestions() {
                    var promise = $.ajax({
                        type: "GET",
                        url: '/forum/question',
                        cache: false
                    });
                    /*jslint unparam: true*/
                    promise.then(function (questions, textStatus, jqXHR) {
                        try {
                            questions = JSON.parse(questions);
                            questions.forEach(function(q){
                                displayQuestion(q);
                            });
                            $dispatcher.trigger(QuestionsSection.SUCCESS_LOADING_QUESTIONS);
                        } catch(err) {
                            $dispatcher.trigger(QuestionsSection.ERROR_LOADING_QUESTIONS);
                        }
                    }).fail(function (jqXHR, textStatus, err) {
                        $dispatcher.trigger(QuestionsSection.ERROR_LOADING_QUESTIONS);
                    });
                }

                function bind() {
                    self.$dom = $("#forum-content-section .questions");
                }

                function init() {
                    bind();
                    fetchQuestions();
                }
                init();
            },
            LoadErrorMessage = function() {
                var self = this;
                function show() {
                    self.$dom.removeClass("hide");
                }
                function hide() {
                    self.$dom.addClass("hide");
                }
                function bind() {
                    self.$dom = $("#forum-content-section .error-message");
                }
                bind();
                $dispatcher.on(QuestionsSection.ERROR_LOADING_QUESTIONS, show);
                $dispatcher.on(QuestionsSection.SUCCESS_LOADING_QUESTIONS, hide);
            };
        QuestionsSection.ERROR_LOADING_QUESTIONS = "errorLoadingQuestions";
        QuestionsSection.SUCCESS_LOADING_QUESTIONS = "successLoadingQuestions";
        function showQuestions(event) {
            self.$dom.removeClass("hide");
        }
        function hideQuestions() {
            self.$dom.addClass("hide");
        }

        function bind() {
            self.$dom = $("#forum-content-section");
        }
        function init() {
            bind();
            loadErrorMessage = new LoadErrorMessage();
            questionsSection = new QuestionsSection();
            successMessage = new SuccessMessage();
        }

        init();

        $dispatcher.on(CreateQuestionButton.SHOW_EDITOR, hideQuestions);
        $dispatcher.on(EditorSection.EDITOR_CLOSED, showQuestions);
        $dispatcher.on(WarningWindow.HIDE_EDITOR, showQuestions);
        $dispatcher.on(Form.SUCCESS, showQuestions);
    };

    var editorSection = new EditorSection(), createQuestionButton = new CreateQuestionButton(),
        contentSection = new ContentSection(), warningWindowInstance = new WarningWindow();


});