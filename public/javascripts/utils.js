var days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    utils = {
        MAX_ID_LENGTH : 200,
        URL_PREFIX: "",
        toLocalDateTime: function(date)
        {
            // local because all getters return the local date-time
            if (!(date instanceof Date)) {
                throw new Error("utils.toLocalDateTime : not a Date object");
            }
            var hours = date.getHours(), min = date.getMinutes(), day = date.getDate(), month = parseInt(date.getMonth(), 10) + 1,
                time = (hours < 10 ? "0" + hours : hours) + ":" + (min < 10 ? "0" + min : min),
                dayMonth = (day < 10 ? "0" + day : day) + "/" + (month < 10 ? "0" + month : month),
                formattedDate = days[date.getDay()] + " " + dayMonth + "/" + date.getFullYear() + " " + time;
            return formattedDate;
        },
        toDate: function(datestring)
        {
            try {
                var date = new Date(datestring), month = date.getUTCMonth()+1, day = date.getUTCDate();
                day=day<10?"0"+day:day;
                month=month<10?"0"+month:month;
                return days[date.getUTCDay()] + " " + day + "/" + month + "/" + date.getUTCFullYear();
            } catch (err) {
                throw new Error("utils.toDate : not correct date string ");
            }
        },
        ddmm: function(datestring)
        {
            try {
                var date = new Date(datestring), month = date.getUTCMonth()+1, day = date.getUTCDate();
                day=day<10?"0"+day:day;
                month=month<10?"0"+month:month;
                return day + "/" + month;
            } catch (err) {
                throw new Error("utils.mmdd : not correct date string ");
            }
        },
        validatorHighlight: function (element, errorClass) {
            $("[for='" + $(element).attr("name") + "']").addClass(errorClass);
            $(element).addClass(errorClass);
        },
        validatorUnhighlight: function (element, errorClass) {
            $("[for='" + $(element).attr("name") + "']").removeClass(errorClass);
            $(element).removeClass(errorClass);
        },
        emailValidator: function (value, element) {
            var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            return re.test(value);
        },
        ddmmyyIntoISODateFormatter: function(value) {
            var re = /^\d{2}\/\d{2}\/\d{4}$/;
            if (re.test(value)) {
                var date = value.split("/"), days = date[0], month = date[1], year = date[2];
                return year+"-"+month+"-"+days;
            } else {
                throw new Error("not correct date format : "+value)
            }
        } ,
        dateValidator: function(value, element) {
            try {
                var result = Date.parse(utils.ddmmyyIntoISODateFormatter(value)); // ISO 8601
                if (!result) {
                    return false;
                }
                return true;
            } catch(err) {
                return false;
            }
        },
        isValidLengthForRequiredOrNotEmptyField: function(required, maxlength, valueToTest) {
            if( (required || valueToTest.toString() != '')  && !(valueToTest.length >= 1 && (typeof maxlength === 'undefined' || valueToTest.length <= maxlength)) ) {
                return false;
            }
            return true;
        },
        WarningWindow: function(id, $dispatcher) {
            var warningWindow = this, warningCancelButton, warningOkButton,
                WarningCancelButton = function(){
                    var self = this;
                    function bind() {
                        self.$dom = $(id + " .cancel");
                        self.$dom.on("click", function(){
                            hide();
                        });
                    };
                    bind();
                },
                WarningOkButton = function(){
                    var self = this;
                    function bind() {
                        self.$dom = $(id +" .ok");
                        self.$dom.on("click", function(){
                            hide();
                            $dispatcher.trigger(utils.WarningWindow.OK_PRESSED);
                        });
                    };
                    bind();
                };
            warningWindow.show = function() {
                warningWindow.$dom.addClass("show");
            };
            function hide()  {
                warningWindow.$dom.removeClass("show");
            };
            function bind() {
                warningWindow.$dom = $(id);
            }
            function init() {
                bind();
                warningCancelButton = new WarningCancelButton();
                warningOkButton = new WarningOkButton();
            }
            init();
        },
        Button: function(selector, callback, ancestor) {
            var self = this;
            self.show = function() {
                self.$dom.removeClass('hide');
            };
            self.hide = function() {
                self.$dom.addClass('hide');
            };
            function bind() {
                if (ancestor) {
                    self.$dom = ancestor.find(selector);
                } else {
                    self.$dom = $(selector);
                }
                self.$dom.on('click', callback)
            };
            bind();
        },
        ShowHide: function(selector, ancestor) {
            var self = this;
            self.show = function() {
                self.$dom.removeClass('hide');
            };
            self.hide = function() {
                self.$dom.addClass('hide');
            };
            function bind() {
                if (ancestor) {
                    self.$dom = ancestor.find(selector);
                } else {
                    self.$dom = $(selector);
                }
            };
            bind();
        },
        Input: function(id) {
            var self = this;
            self.$dom = $(id);
            self.isDirty = function() {
                return self.$dom.val().trim() != "" || self.$dom.is(':checked');
            };
            self.reset = function() {
                self.$dom.val("");
                self.$dom.removeAttr('checked');
            };
            self.setContent = function(data) {
                self.$dom.val(data);
            }
        },
        Textarea: function(id) {
            var self = this;
            self.$dom = $(id);
            self.isDirty = function() {
                var html = self.$dom.wysiwyg('shell').getHTML();
                return html != "<br>" && html != "";
            };
            self.reset = function() {
                self.$dom.wysiwyg('shell').setHTML("");
            };
            self.setContent = function(data) {
                self.$dom.wysiwyg('shell').setHTML(data);
            }
        },
        DateInput: function(selector) {
            var self = this;
            utils.Input.call(this, selector);
            function init() {
                self.$dom.datepicker({
                    showOtherMonths: true,
                    selectOtherMonths: true,
                    dateFormat: "dd/mm/yy",
                    dayNamesMin: days,
                    firstDay: 1
                });
            }
            init();
        },
        
        DocumentsSection: function(selector, ViewObject) {
            var self = this, documentViewObjects = [];
            self.populate = function(nouvelles, prepend) {
                _.forEach(nouvelles, function(nouvelle){
                    var view = new ViewObject(nouvelle);
                    view.populate(nouvelle);
                    documentViewObjects.push(view);
                    if (prepend) {
                        self.$dom.prepend(view.$dom);
                    } else {
                        self.$dom.append(view.$dom);
                    }
                });
            };

            self.getViewObjects = function() {
                return documentViewObjects;
            }

            function bind() {
                self.$dom= $(selector);
            }

            function init() {
                bind();
            }

            init();
        },
        Loader: function(url, $dispatcher, eventSuccess, eventFailure) {
            var self = this;
            self.setUrl = function(url){
                self.url = url;
            };
            self.setUrl(url);
            self.load = function() {
                var promise = $.ajax({
                    type: "GET",
                    url: self.url,
                    cache: false
                });
                promise.then(function (documents, textStatus, jqXHR) {
                    var arrayOfDocs = {array : JSON.parse(documents)};
                    $dispatcher.trigger((eventSuccess || utils.Loader.NOUVELLES_LOADED), arrayOfDocs);
                }).fail(function (jqXHR, textStatus, err) {
                    $dispatcher.trigger((eventFailure || utils.Loader.ERROR_LOADING_NOUVELLES), err);
                });
            };

            function init() {

            }

            init();
        },
        //this object works with a template where its selector is ALWAYS nouvelles-template .single-nouvelle-container, but this change if necessary
        NouvelleViewObject: function(nouvelle) {
            var self = this;
            self.AWESOMEFONT_OPEN_EYE = '&#xf06e';
            self.AWESOMEFONT_CLOSED_EYE = '&#xf070';
            self.nouvelle = nouvelle;
            self.hide = function() {
                self.$dom.addClass("hide");
            };
            self.show = function() {
                self.$dom.removeClass("hide");
            };
            self.update = function(nouvelle) {
                self.nouvelle = nouvelle;
                self.populate();
            };

            function bind() {
                self.$dom = $("#nouvelles-template .single-nouvelle-container").clone();
                self.extensible= new utils.ExtensibleImageContainer(".image", self.$dom)
            };
            bind();
        },
        ExtensibleImageContainer: function(selector, $parent) {
            var self = this;
            function setMaxHeight() {
                self.$dom.css({"height": utils.ExtensibleImageContainer.calculateStartHeightPX(), "overflow-y": "hidden"});
            }
            function removeMaxHeight() {
                self.$dom.css({"height": "auto", "overflow-y": "inherit"});
            }
            self.bindImage = function ($image) {
                self.$image = $image;
                self.$dom.find("img").remove();
                self.$dom.append(self.$image);
            }
            self.hideControls = function() {
                if(self.buttons){self.buttons.hide();}
                removeMaxHeight();
            }
            function bind() {
                if (parent) {
                    self.$dom = $parent.find(selector);
                } else {
                    self.$dom = $(selector);
                }
            }

            function bindControls() {
                self.buttons = new utils.ShowHide(".extensible-buttons", self.$dom.parent());
                self.extendButton = new utils.Button(".extend-button", function(){
                    self.$dom.animate({height: self.$image.height()},{duration: 500, complete: function(){
                        self.extendButton.hide();
                        self.collapseButtond.show();
                    }});
                }, self.buttons.$dom);
                self.collapseButtond = new utils.Button(".collapse-button", function(){
                    self.$dom.animate({height: utils.ExtensibleImageContainer.calculateStartHeightPX()},{duration: 500, complete: function(){
                        self.extendButton.show();
                        self.collapseButtond.hide();
                    }});
                }, self.buttons.$dom);
            }
            self.initControls = function() {
                bindControls();
                self.buttons.show();
                setMaxHeight();
            }
            function init() {
                bind();
            }
            init();
        }
    };
// In case widow width < default width of images (i.e. in mobile phones), we recalculate the default hieght for images
utils.ExtensibleImageContainer.calculateStartHeightPX = function() {
    var startHeight = utils.ExtensibleImageContainer.START_HEIGHT_PX;
    if ($(window).width() < utils.ExtensibleImageContainer.MAX_WIDTH_PX) {
        startHeight = (utils.ExtensibleImageContainer.START_HEIGHT_PX/utils.ExtensibleImageContainer.MAX_WIDTH_PX)*$(window).width();
    }
    return startHeight;
}

utils.NouvelleViewObject.prototype.populate = function() {
    this.$dom.find(".anchor").attr("name", ""+this.nouvelle._id);
    this.$dom.find(".subject").html(this.nouvelle.s);
    this.$dom.find(".text").html(this.nouvelle.t);
    this.$dom.find(".author").html(this.nouvelle.a);
    if(this.nouvelle.url){this.$dom.find(".url-link").attr("href", this.nouvelle.url).removeClass("hide");}else{this.$dom.find(".url-link").addClass("hide");}
    this.$dom.find(".fb-like").attr("data-href", window.location.protocol+"//"+window.location.host+window.location.pathname+"#"+this.nouvelle._id);
    this.$dom.find(".edition-date").html(utils.toLocalDateTime(new Date(this.nouvelle.d)));
    this.$dom.find(".visible-icon").html(!this.nouvelle.v?this.AWESOMEFONT_CLOSED_EYE:this.AWESOMEFONT_OPEN_EYE);
    this.$dom.find(".from").html(this.nouvelle.f?"Événement "+utils.toDate(this.nouvelle.f):"");
    this.$dom.find(".to").html(this.nouvelle.to?" - "+utils.toDate(this.nouvelle.to):"");

    // extract image from nouvelle.t and put it above title
    var images = this.$dom.find(".text").find("img");
    if(images.length > 0) {
        var $image = $(images[0]),
            height = ($image.height() === 0)?parseInt($image.attr("height"), 10):$image.height(), // chrome does not consider height() or width() as long as image not displayed
            width = ($image.width() === 0)?parseInt($image.attr("width"), 10):$image.width();
        this.extensible.bindImage($image);

        if ((utils.ExtensibleImageContainer.MAX_WIDTH_PX/width)*height > utils.ExtensibleImageContainer.START_HEIGHT_PX + 8 /*size marge for not having control display when image is bigger for a few pixels*/) {
            this.extensible.initControls();
        } else {
            this.extensible.hideControls();
        }
    }

    //remove heading tags without text, eg <br></br> or <div><br></br></div> and trailing br (only after image has been removed)
    var $tags = this.$dom.find(".text").children();
    if ($tags.length > 0) {

        if($($tags[$tags.length-1]).text() === "") {
            $($tags[$tags.length-1]).remove();
        }
        if($($tags[0]).text() === "") {
            $($tags[0]).remove();
        }
    }

    this.populateOtherFields();
};
utils.NouvelleViewObject.prototype.populateOtherFields = function() {}


utils.DateInput.prototype = Object.create(utils.Input.prototype);
utils.DateInput.prototype.constructor = utils.DateInput;

utils.WarningWindow.OK_PRESSED= "utils_warning_ok_pressed";
utils.Loader.ERROR_LOADING_NOUVELLES = "loader_error_loading_documents";
utils.Loader.NOUVELLES_LOADED = "loader_documents_loaded";

utils.ExtensibleImageContainer.START_HEIGHT = "60em";
utils.ExtensibleImageContainer.START_HEIGHT_PX = 60*10;
utils.ExtensibleImageContainer.MAX_WIDTH_PX = 80*10; // TO BE ALIGNED WITH .nouvelles-section in nouvelles_commun.css

if (typeof window === 'undefined') {
    global.utils = utils;
} else {
    window.utils = utils;
}