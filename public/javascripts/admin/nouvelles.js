$(function() {
    "use strict";

    var $dispatcher = $({}), formInstance, nouvellesLoader, nouvellesSection,
        warningWindow = new utils.WarningWindow('#nouvelles-tab-content .close-question-confirmation', $dispatcher),
        errorMessage = new utils.ShowHide("#nouvelles-tab-content  .error-message-form"),
        loadErrorMessage = new utils.ShowHide("#nouvelles-tab-content  .nouvelles-section .error-message"),
        submissionIndicator = new utils.ShowHide("#nouvelles-tab-content .submission-indicator"),
        CREATE_BUTTON_PRESSED = "nouvelles_tab_create_button_pressed",
        createButton = new utils.Button("#nouvelles-tab-content .create-button", function(){
            $dispatcher.trigger(CREATE_BUTTON_PRESSED);
        }),
        nouvellesFormConatiner = new utils.ShowHide("#nouvelles-tab-content .nouvelles-form-container"),
        NouvelleViewObjectWithEditorButton = function(nouvelle) {
            var self = this;
            self.$editionButton;
            utils.NouvelleViewObject.call(self, nouvelle);
            function init() {
                self.$editionButton = self.$dom.find(".edition-icon");
                self.$editionButton.on("click", function() {
                    self.hide();
                    $dispatcher.trigger(NouvelleViewObjectWithEditorButton.EDIT_BUTTON_PRESSED, self);
                });
            }
            init();
        },
        Form = function() {
            var form = this, saveButton, cancelButton, updateButton, cancelUpdateButton;

            form.isDirty = function() {
                var initialValue = false;
                return _.reduce(form.fields, function (result, formField, key) {
                    return result || formField.isDirty();
                }, initialValue);
            };

            form.reset = function() {
                form.validator.resetForm();
                for (var key in form.fields) {
                    if (form.fields.hasOwnProperty(key)) {
                        form.fields[key].reset();
                    }
                }
            };

            function submitCallback(e) {
                if(form.isValid()) {
                    var promise;
                    $dispatcher.trigger(Form.PROCESSING);
                    $.ajaxSetup({
                        headers: {
                            'x-access-token': $("#token").val()
                        }
                    });

                    promise = $.ajax({
                        type: "POST",
                        url: '/nouvelles/authaa/nouvelle/add',
                        data: form.$dom.serialize(),
                        cache: false
                    });
                    promise.then(function (nouvelle, textStatus, jqXHR) {
                        $dispatcher.trigger(Form.SUCCESS, JSON.parse(nouvelle));
                    }).fail(function (jqXHR, textStatus, err) {
                        var error = jqXHR.responseJSON.error;
                        alert("Info à donner à Fredy :\n Error status : "+error.status+"\n Error message : "+error.message+"\n Error code : "+error.code+"\n Error stack : "+error.stack);
                        $dispatcher.trigger(Form.ERROR, err);
                    });

                }

                e.preventDefault();
            };

            function updateCallback(e) {
                if(form.isValid()) {
                    var promise;
                    $dispatcher.trigger(Form.PROCESSING);
                    $.ajaxSetup({
                        headers: {
                            'x-access-token': $("#token").val()
                        }
                    });

                    promise = $.ajax({
                        type: "PUT",
                        url: '/nouvelles/authaa/nouvelle/'+form.$dom.find('#nid').val()+'/update',
                        data: form.$dom.serialize(),
                        cache: false
                    });
                    promise.then(function (nouvelle, textStatus, jqXHR) {
                        $dispatcher.trigger(Form.UPDATE_SUCCESS, {nouvelleViewObject : form.currentNouvelleViewObject, nouvelle : JSON.parse(nouvelle)});
                    }).fail(function (jqXHR, textStatus, err) {
                        var error = jqXHR.responseJSON.error;
                        alert("Info à donner à Fredy :\n Error status : "+error.status+"\n Error message : "+error.message+"\n Error code : "+error.code+"\n Error stack : "+error.stack);
                        $dispatcher.trigger(Form.UPDATE_ERROR);
                    });

                }

                e.preventDefault();
            };

            form.isValid = function() {
                return form.$dom.valid();
            };

            function populate(nouvelle) {
                form.fields['s'].setContent(nouvelle.s);
                form.fields['t'].setContent(nouvelle.t);
                form.fields['url'].setContent(nouvelle.url);
                form.fields['f'].setContent(nouvelle.f?utils.toDate(nouvelle.f).split(" ")[1]:"");
                form.fields['to'].setContent(nouvelle.to?utils.toDate(nouvelle.to).split(" ")[1]:"");
                form.fields['v'].$dom.prop('checked', nouvelle.v);
                form.fields['nid'].setContent(nouvelle._id);
            };

            form.detach = function() {
                return form.$dom.detach();
            };

            function insertWithData(nouvelleViewObject) {
                form.detach().insertAfter(nouvelleViewObject.$dom);
                populate(nouvelleViewObject.nouvelle);
            };

            form.initUpdateForm = function(nouvelleViewObject) {
                form.currentNouvelleViewObject = nouvelleViewObject;
                cancelButton.hide();
                saveButton.hide();
                updateButton.show();
                cancelUpdateButton.show();
                insertWithData(nouvelleViewObject);
            };

            form.initCreationForm = function($domToInsertInto) {
                cancelButton.show();
                saveButton.show();
                updateButton.hide();
                cancelUpdateButton.hide();
                form.reset();
                $domToInsertInto.append(form.detach());
            };

            function initValidator() {
                form.validator = form.$dom.validate({
                    ignore: ":hidden:not(#t, #nid)",
                    rules: window.nouvellesAdminFormFields.validationRules,
                    messages: {
                        s: {
                            required: "Champ obligatoire",
                            maxlength: "Max {0} caractères"
                        },
                        t: {
                            required: "Champ obligatoire",
                            textEmpty: "Champ obligatoire",
                            textSize: "La taille du texte est trop grande"
                        },
                        v: {
                            required: "Champ obligatoire",
                            maxlength: "Max {0} caractères"
                        },
                        nid: {
                            maxlength: "Max {0} caractères"
                        },
                        url: {
                            maxlength: "Max {0} caractères",
                            url: "L'URL n'est pas valide"
                        },
                        f: {
                            validDate: "La date doit avoir le format 23/12/2050"
                        },
                        to: {
                            validDate: "La date doit avoir le format 23/12/2050",
                            fromMissing: "Cette date n'est pas acceptée si \""+window.nouvellesAdminFormFields.formFields['f'].fieldLabel+"\" n'est pas présente"
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
                }, "La taille totale du 'Texte' est limitée à {0} MB");

                $.validator.addMethod("textEmpty", function(value, element, params) {
                    if (form.$dom.find('.wysiwyg-editor').text().trim() === '') {
                        return false;
                    }
                    return true;
                });

                $.validator.addMethod("fromMissing", function(value, element, params) {
                    var fromIsEmtpy = !form.fields['f'].isDirty();
                    if(fromIsEmtpy){
                        return false;
                    } else {
                        return true;
                    }

                });

                $.validator.addMethod('validDate', utils.dateValidator, "La date n'est pas valide.");
            }

            function bind() {
                form.$dom = $('#nouvelles-form');
            }

            function init() {
                bind();
                form.fields = {};
                form.fields['s'] = new utils.Input('#nouvelles-form [name=s]');
                form.fields['v'] = new utils.Input('#nouvelles-form [name=v]');
                form.fields['nid'] = new utils.Input('#nouvelles-form [name=nid]');
                form.fields['url'] = new utils.Input('#nouvelles-form [name=url]');
                form.fields['t'] = new utils.Textarea('#nouvelles-form [name=t]');
                form.fields['f'] = new utils.DateInput('#nouvelles-form [name=f]');
                form.fields['to'] = new utils.DateInput('#nouvelles-form [name=to]');
                cancelButton = new utils.Button('#nouvelles-form .cancel', function(e){
                    if(form.isDirty()) {
                        $dispatcher.trigger(Form.FORM_DIRTY);
                    } else {
                        $dispatcher.trigger(Form.CANCEL_BUTTON);
                    }
                    e.preventDefault();
                });
                saveButton = new utils.Button('#nouvelles-form .submit', submitCallback);
                updateButton = new utils.Button('#nouvelles-form .update', updateCallback);
                cancelUpdateButton = new utils.Button('#nouvelles-form .cancelUpdate', function(e) {
                    $dispatcher.trigger(Form.CANCEL_UPDATE_BUTTON, form.currentNouvelleViewObject);
                    e.preventDefault();
                });
                updateButton.hide();
                cancelUpdateButton.hide();
                initValidator();
            }

            init();
        };

    NouvelleViewObjectWithEditorButton.prototype = Object.create(utils.NouvelleViewObject.prototype);
    NouvelleViewObjectWithEditorButton.prototype.constructor = NouvelleViewObjectWithEditorButton;

    NouvelleViewObjectWithEditorButton.prototype.activateButton = function() {
        this.$editionButton.removeClass("hide");
    };

    NouvelleViewObjectWithEditorButton.prototype.deactiveButton = function() {
        this.$editionButton.addClass("hide");
    };

    utils.DocumentsSection.prototype.deactiveEditionButtons = function() {
        _.forEach(this.getViewObjects(), function(view){
            view.deactiveButton();
        });
    };

    utils.DocumentsSection.prototype.activeEditionButtons = function() {
        _.forEach(this.getViewObjects(), function(view){
            view.activateButton();
        });
    };

    Form.CANCEL_BUTTON = "nouvelles_form_close_pressed";
    Form.CANCEL_UPDATE_BUTTON = "nouvelles_form_close_updated_pressed";
    Form.FORM_DIRTY = "nouvelles_form_dirty";
    Form.SAVE_BUTTON = "nouvelles_form_save_pressed";
    Form.PROCESSING = "nouvelles_form_processing";
    Form.SUCCESS = "nouvelles_form_success";
    Form.UPDATE_SUCCESS = "nouvelles_form_update_success";
    Form.ERROR = "nouvelles_form_error";
    Form.UPDATE_ERROR = "nouvelles_form_update_error";
    NouvelleViewObjectWithEditorButton.EDIT_BUTTON_PRESSED = "nouvelles_section_edit_button_pressed";

    formInstance = new Form(), nouvellesLoader = new utils.Loader('/nouvelles/all', $dispatcher),
        nouvellesSection = new utils.DocumentsSection("#nouvelles-tab-content .nouvelles-section", NouvelleViewObjectWithEditorButton);

    nouvellesLoader.load();

    $dispatcher.on(utils.WarningWindow.OK_PRESSED, function(){
        formInstance.reset();
        errorMessage.hide();
        nouvellesFormConatiner.hide();
        nouvellesSection.activeEditionButtons();
    });
    $dispatcher.on(Form.FORM_DIRTY, function(){
        warningWindow.show();
    });
    $dispatcher.on(Form.CANCEL_BUTTON, function(){
        formInstance.reset();
        nouvellesFormConatiner.hide();
        nouvellesSection.activeEditionButtons();
    });
    $dispatcher.on(Form.SUCCESS, function(event , nouvelle){
        errorMessage.hide();
        submissionIndicator.hide();
        nouvellesSection.populate([nouvelle], true);
        formInstance.reset();
        nouvellesFormConatiner.hide();
        nouvellesSection.activeEditionButtons();
    });
    $dispatcher.on(Form.PROCESSING, function(){
        errorMessage.hide();
        submissionIndicator.show();
    });
    $dispatcher.on(Form.ERROR, function(){
        errorMessage.show();
        submissionIndicator.hide();
    });
    $dispatcher.on(Form.UPDATE_ERROR, function(){
        submissionIndicator.hide();
    });
    $dispatcher.on(CREATE_BUTTON_PRESSED, function(){
        formInstance.initCreationForm(nouvellesFormConatiner.$dom);
        nouvellesFormConatiner.show();
        nouvellesSection.deactiveEditionButtons();
    });
    $dispatcher.on(utils.Loader.ERROR_LOADING_NOUVELLES, function(){
        loadErrorMessage.show();
    });
    $dispatcher.on(utils.Loader.NOUVELLES_LOADED, function(event, objectWithNouvelles){
        nouvellesSection.populate(objectWithNouvelles.array, false);
    });
    $dispatcher.on(NouvelleViewObjectWithEditorButton.EDIT_BUTTON_PRESSED, function(event, nouvelleViewObject){
        nouvellesSection.deactiveEditionButtons();
        formInstance.initUpdateForm(nouvelleViewObject);
        createButton.hide();
    });
    $dispatcher.on(Form.CANCEL_UPDATE_BUTTON, function(event, nouvelleViewObject){
        nouvellesSection.activeEditionButtons();
        nouvelleViewObject.show();
        formInstance.reset();
        formInstance.detach();
        createButton.show();
    });
    $dispatcher.on(Form.UPDATE_SUCCESS, function(event, payload){
        errorMessage.hide();
        submissionIndicator.hide();
        nouvellesSection.activeEditionButtons();
        payload.nouvelleViewObject.show();
        payload.nouvelleViewObject.update(payload.nouvelle);
        formInstance.detach();
        createButton.show();
    });
});