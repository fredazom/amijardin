$(function() {
    "use strict";

    var $dispatcher = $({});

    function digits2(dayOrMonth) {
        dayOrMonth = parseInt(dayOrMonth, 10);
        return dayOrMonth<10?"0"+dayOrMonth:dayOrMonth;
    }
    var Calendar = function() {
        var self = this,
            loader = new utils.Loader("", $dispatcher),
            calendarButton,
            calendarButtonClose,
            mobileCalendarDisplayed = false,
            getDefaultDaysRanged = function(inst){
                var currentMonth = parseInt(inst.selectedMonth, 10)+1,
                    currentYear = parseInt(inst.selectedYear, 10),
                    dateRange = [];

                dateRange[0] = "22/" + digits2(currentMonth-1===0?12:currentMonth-1) + "/" + (currentMonth-1==0?currentYear-1:currentYear);
                dateRange[1] = "06/" + digits2(currentMonth+1===13?1:currentMonth+1) + "/" + (currentMonth+1==13?currentYear+1:currentYear);

                return dateRange
            },
            getNouvelles = function(dateRange){
                loader.setUrl("/nouvelles/range?from="+ dateRange[0] +"&to=" +dateRange[1]);
                loader.load();
            },
            cleanDateRangeNouvelles = function() {
                $.each(self.dateRangeNouvelles, function(ddmm, objectViewArray) {
                    objectViewArray.forEach(function(viewObject){
                        viewObject.destroy();
                    });
                    objectViewArray = null;
                });
                self.dateRangeNouvelles = {};
            },
            onChangeMonthYear = function(yyyy, m /*starting from 1*/, inst) {
                getNouvelles(getDefaultDaysRanged(inst));
            },
            onSelect = function(mmddyyy, inst) {
                var month = parseInt(inst.selectedMonth, 10)+1,
                    day = parseInt(inst.selectedDay, 10),
                    ddmm = digits2(day) + "/" + digits2(month);

                // hide all links
                $.each(self.dateRangeNouvelles, function(key, objectViewArray){
                    objectViewArray.forEach(function(viewObject) {
                        viewObject.hide();
                    });
                });

                // show all links with this date
                if(self.dateRangeNouvelles[ddmm]) {
                    self.dateRangeNouvelles[ddmm].forEach(function(viewObject){
                        viewObject.show();
                    });
                }
            },
            beforeShowDay = function(date) {
                var ddmm = digits2(date.getDate()) + "/" + digits2(parseInt(date.getMonth(), 10)+1);
                if(self.dateRangeNouvelles[ddmm]) {
                    return [true, "calendar-event"];
                } else {
                    return [false, ""];
                }

            };

        function positionHookAndFixedCalendarContainer() {
            // set width to container necessary to center in left right column
            self.$centeredCalendarContainer.css("width", self.$calendar.find("table").width());
            // set width to fixed element to avoid nouvelles overflow
            self.$fixedCalendarContainer.css("width", self.$calendar.find("table").width());
         };

        function closeCalendar() {
            mobileCalendarDisplayed = false;
            calendarButton.show();
            calendarButtonClose.hide();
            self.$hook.hide();
        };

        function isMobileVersion() {
            if(self.$fixedCalendarContainer.css("position") === "relative") {
               return true;
            }
            return false;
        }

        function init() {
            self.$hook = $("#calendarhook");
            self.$hook.show = function() {
                self.$hook.addClass("show");
            };
            self.$hook.hide = function(){
                self.$hook.removeClass("show");
            };
            self.hide = function() {
                closeCalendar();
            };
            if (self.$hook.length > 0) {

                // set nouvelles objects array
                self.dateRangeNouvelles = {};

                self.$hook.before("<div class='calendar-button'>Calendrier</div>");
                self.$hook.before('<div class="calendar-button-close hide"><div class="button-back"><</div></div>');
                self.$hook.append("<div class='absolute-calendar-container'></div>");
                self.$absoluteCalendarContainer = self.$hook.find(".absolute-calendar-container");
                self.$absoluteCalendarContainer.append("<div class='centered-calendar-container'></div>");
                self.$centeredCalendarContainer = self.$absoluteCalendarContainer.find(".centered-calendar-container");
                self.$centeredCalendarContainer.append("<div class='fixed-calendar-container'></div>");
                self.$fixedCalendarContainer = self.$centeredCalendarContainer.find(".fixed-calendar-container");
                self.$fixedCalendarContainer.append("<div class='calendar'></div>");
                self.$fixedCalendarContainer.append("<div class='nouvelle-calendar-container'></div>");
                self.$calendar = self.$fixedCalendarContainer.find(".calendar");
                self.$nouvelleCalendarContainer = self.$fixedCalendarContainer.find(".nouvelle-calendar-container");
                self.$calendar.datepicker({
                    showOtherMonths: true,
                    selectOtherMonths: true,
                    dateFormat: "dd/mm/yy",
                    dayNamesMin: days,
                    firstDay: 1,
                    onChangeMonthYear: onChangeMonthYear,
                    onSelect: onSelect,
                    beforeShowDay: beforeShowDay
                });

                positionHookAndFixedCalendarContainer();


                // load nouvelles for given range
                var calendarInstance = $.datepicker._getInst(self.$calendar[0]);
                getNouvelles(getDefaultDaysRanged(calendarInstance));

                // bind calendarButton for mobile
                calendarButton = new utils.Button(".calendar-button", function(event){
                    mobileCalendarDisplayed = true;
                    calendarButton.hide();
                    calendarButtonClose.show();
                    self.$hook.show();
                    positionHookAndFixedCalendarContainer();
                });

                // bind calendar button close
                calendarButtonClose = new utils.Button(".calendar-button-close", closeCalendar);
            }

            $(window).resize(function(){
                if(!isMobileVersion()) {
                    self.$hook.show();
                    positionHookAndFixedCalendarContainer();
                } else if(mobileCalendarDisplayed) {
                    self.$hook.show();
                } else {
                    self.$hook.hide();
                }
            });

            $dispatcher.on(utils.Loader.ERROR_LOADING_NOUVELLES, function(){
                console.log("error loading news");
            });
            $dispatcher.on(utils.Loader.NOUVELLES_LOADED, function(event, nouvellesObject){
                cleanDateRangeNouvelles();
                self.cleanNouvellesLinks();
                self.setDateRangeNouvelles(nouvellesObject.array);
                // redraw datepicker in order to set markers in days with data from DB
                self.$calendar.datepicker("refresh");
                self.displayNouvelles();
            });
        }
        init();
    },
    CalendarViewObject = function(nouvelle, $dispatcher) {
        var self = this;
        function bind() {
            self.$dom.find("a").on("click", function(){
               $dispatcher.trigger(CalendarViewObject.LINK_PRESSED);
            });
        }
        function init() {
            self.$dom = $("<div class='nouvelle-calendar'><a class='nouvelle-link'></a></div>");
            self.nouvelle = nouvelle;
            bind();
        }
        init();
    };

    CalendarViewObject.LINK_PRESSED = "link_pressed";
    Calendar.prototype.getDisplayedDaysRange = function(){
        var $days = this.$calendar.find(".ui-datepicker-calendar").find("tbody td"),
            inst = $.datepicker._getInst(this.$calendar[0]),
            $firstDate = $($days[0]),
            $lastDate = $($days[$days.length-1]),
            currentMonth = parseInt(inst.selectedMonth, 10)+1,
            currentYear = parseInt(inst.selectedYear, 10),
            firstDayTag = $firstDate.find("span").length!=0?$firstDate.find("span")[0]:$firstDate.find("a")[0],
            lastDayTag = $lastDate.find("span").length!=0?$lastDate.find("span")[0]:$lastDate.find("a")[0],
            firstDayDisplayed = parseInt(firstDayTag.innerHTML, 10),
            lastDayDisplayed = parseInt(lastDayTag.innerHTML, 10),
            firstDaysMonth = firstDayDisplayed>1?((currentMonth-1)===0?12:currentMonth-1):currentMonth,
            lastDaysMonth = lastDayDisplayed<10?((currentMonth+1===13)?1:currentMonth+1):currentMonth,
            firstDaysYear = firstDaysMonth===12?currentYear-1:currentYear,
            lastDaysYear = lastDaysMonth<10&&currentMonth===12?currentYear+1:currentYear,
            dateRange = [];

        dateRange[0] = new Date(firstDaysYear+"-"+digits2(firstDaysMonth)+"-"+digits2(firstDayDisplayed));
        dateRange[1] = new Date(lastDaysYear+"-"+digits2(lastDaysMonth)+"-"+digits2(lastDayDisplayed));
        return dateRange
    }

    // set map {ddmm: [viewObject]}
    Calendar.prototype.setDateRangeNouvelles = function(nouvellesArray) {
        var self = this;
        nouvellesArray.forEach(function(nouvelle){
            var viewObject = new CalendarViewObject(nouvelle, $dispatcher);
            viewObject.populate();

            function pushToViewObjectsArray(dateasstring) {
                var ddmm = utils.ddmm(dateasstring);
                if(!self.dateRangeNouvelles[ddmm]) {
                    self.dateRangeNouvelles[ddmm] = [];
                }
                self.dateRangeNouvelles[ddmm].push(viewObject);
            }

            if (nouvelle.f) {
                pushToViewObjectsArray(nouvelle.f);
            }

            if (nouvelle.to)  {
                pushToViewObjectsArray(nouvelle.to);
            }
        });
    };

    // method called after rendering, we get first and last days displayed by datepicker
    Calendar.prototype.displayNouvelles = function () {
        var self = this, dateRange = self.getDisplayedDaysRange();

        function isInDisplayedRange(nouvelle) {
            var from = new Date(nouvelle.f),
                to = nouvelle.to?new Date(nouvelle.to):false;

            if (   dateRange[0] <= from && from <= dateRange[1]  ||  (to && dateRange[0] <= to && to <= dateRange[1])  ) {
                return true;
            }
            return false;
        }

        $.each(self.dateRangeNouvelles, function(ddmm, viewObjectArray){
            viewObjectArray.forEach(function(viewObject){

                if (isInDisplayedRange(viewObject.nouvelle)) {
                    // may pass several times for same viewObject but appended only once
                    self.$nouvelleCalendarContainer.append(viewObject.$dom[0]);
                }
            });
        });
    };

    Calendar.prototype.cleanNouvellesLinks = function () {
        this.$nouvelleCalendarContainer.find(".nouvelle-calendar").remove();
    };

    CalendarViewObject.prototype.populate = function() {
        var ddmm = utils.ddmm(this.nouvelle.f);
        if(this.nouvelle.to) {
            ddmm = ddmm + "-" + utils.ddmm(this.nouvelle.to);
        }
        this.$dom.find('.nouvelle-link').html(ddmm + " " + this.nouvelle.s).attr("href", "#"+this.nouvelle._id).attr("title", this.nouvelle.s);
    };

    CalendarViewObject.prototype.destroy = function() {
        if(this.$dom) {
            this.$dom.find("a").off();
            this.$dom.remove();
        }
        this.$dom = null;
    };

    CalendarViewObject.prototype.hide = function() {
        this.$dom.removeClass("bubble");
    };

    CalendarViewObject.prototype.show = function() {
        this.$dom.addClass("bubble");
    };

    var calendar = new Calendar();

    $dispatcher.on(CalendarViewObject.LINK_PRESSED, function(){
        calendar.hide();
    });

});