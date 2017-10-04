/*jslint browser: true*/
/*jslint plusplus: true*/
/*global $, google, console, Q*/
(function () {
    "use strict";

    var map, service, infowindow, marker, gardenTypes = {}, gardenFeatures = [], AddressForm, addressFormInstance,
        showAddressFormAction, notificationStepAction, confirmationStepAction, gardenInfowindow, deactiveFilters = true,
        windowWidthBreakInEM = 73.8, mobileGardenFilterButtonsInstance, mobileInfoWindowInstance, gardenSearchInstance, $dispatcher = $({});;



    function removeShowAllGardens(action) {
        var show = action ==="show"?true:false;
        for (var key in gardenFeatures)  {
            if (gardenFeatures.hasOwnProperty(key)) {
                gardenFeatures[key].forEach(function (feature) {
                    map.data.overrideStyle(feature, {visible: show});
                });
            }
        }
    }

    function SearchGardenList() {
        var self = this, populateList;
        self.$gardenList = $(".gardenList");
        populateList =  function (event, features) {
                console.log("argentina-peru: 0-3");
                console.log(features.array);
                features.array.forEach(function (feature) {
                    const gardenname = feature.getProperty("gardenname"),
                    div = "<div>" + (!!gardenname ? gardenname : "-") + "</div>";
                    // create linkObject: onclick implement logic to localize point in map
                    self.$gardenList.append(div);
                });

            }


        $dispatcher.on("gardensLoaded", populateList);
    }

    function GardenSearchWidget() {
        var self = this, closed = true, hideShowInput, gardenListInstance;
        self.$dom = $("#gardenSearch");
        self.$searchIcon = self.$dom.find(".font-icon");
        self.$input = self.$dom.find("#searchGardenInput");
        hideShowInput = function () {
            closed = !closed;
            if (closed) {
                self.$input.addClass("hide");
            } else {
                self.$input.removeClass("hide");
            }
        }

        gardenListInstance = new SearchGardenList();

        // get all gardens alphabetically and add to dom
        self.$searchIcon.on("click", hideShowInput);
    }
    
    function MobileGardenFilterButtons() {
        var self = this,transitionToFirstState, transitionToSecondState, transitionToThirdState, transitionToFourthState;
        self.$dom = $("#gardenFilterButton");
        self.$domBack = $("#gardenFilterButtonBack");
        self.$domBackButton = $("#gardenFilterButtonBack .button-back");
        self.$gardenFilter = $("#gardenFilter");

        transitionToFirstState = function() {
            self.$dom.removeClass("hide");
            self.$domBack.addClass("hide");
            self.$gardenFilter.removeClass("show");
            removeShowAllGardens("show");
            mobileInfoWindowInstance.close();
        };
        transitionToSecondState = function() {
            self.$dom.addClass("hide");
            self.$domBack.removeClass("hide");
            self.$gardenFilter.addClass("show");
            self.$domBackButton.removeClass("white");
            self.$domBack.find("label").html();
            self.$domBack.css("background-color", "inherit");
            mobileInfoWindowInstance.close();
        };
        transitionToThirdState = function(buttonInstance) {
            self.$gardenFilter.removeClass("show");
            self.$domBack.find("label").html($("#"+buttonInstance.dom.id).find("span").html());
            self.$domBack.css("background-color", gardenTypes[buttonInstance.dom.id].icon.fillColor);
            self.$domBackButton.addClass("white");
            mobileInfoWindowInstance.close();
        }

        self.states = [];
        self.states[0] = {label: "Classification", action: transitionToFirstState};
        self.states[1] = {label: "<", action: transitionToSecondState};
        self.states[2] = {label: "<", action: transitionToThirdState};
        self.states[3] = {label: "<", action: function(){console.log("4th state");}};
        self.currentStateIndex = 0;
        self.click = function(buttonInstance) {
            if(self.currentStateIndex === 3){return;}
            self.currentStateIndex++;
            self.states[self.currentStateIndex].action(buttonInstance);//only ok from second state
        };
        self.back = function() {
            if(self.currentStateIndex === 0){return;}
            self.currentStateIndex--;
            self.states[self.currentStateIndex].action();
        };

        self.init = function() {
            self.$dom.on("click", self.click);
            self.$domBackButton.on("click", self.back);
            if ('ontouchstart' in document) {
                self.$gardenFilter.addClass("no-hover");
            }
        };

        self.setToFirstState = function() {
            transitionToFirstState();
            self.currentStateIndex = 0;
        }
    }

    function hasFeatureAnyCategory(categories, feature) {
        // check if sub-category not pressed before deleting
        var hasCategory = false;
        categories.each(function (index, category) {
            hasCategory = feature.getProperty("classifications").indexOf(category.id) > -1;
            return !hasCategory; // if hasCategory = true, then it stops
        });
        return hasCategory;
    }

    function gardenButtonAction (self) {
        var pressed = !$(self.dom).hasClass("active"); // toggle, when has class active, we switch to not pressed

        if (deactiveFilters) {
            pressed = true; // remove if multiple selection in mobile
            deactiveFilters = false;
            $('#gardenFilter').find(".active").removeClass("active");
            // hide all gardens
            for (var key in gardenFeatures)  {
                if (gardenFeatures.hasOwnProperty(key) && key !== self.dom.id) {
                    gardenFeatures[key].forEach(function (feature) {
                        if( feature.getProperty("classifications").indexOf(self.dom.id) < 0 ) { // hide if subcategory selected not contained in other sub-category
                            map.data.overrideStyle(feature, {visible: false});
                            if (gardenInfowindow.getPosition() === feature.getGeometry().get()) {
                                gardenInfowindow.close();
                            }
                        }
                    });
                }
            }
        } else {
            var features = gardenFeatures[self.dom.id] || [] /*id = classification (individual, share, etc)*/,
                categories = $("#gardenFilter > div.active").not("#"+self.dom.id);

            features.forEach(function (feature) {
                if (!pressed /*if remove*/ && hasFeatureAnyCategory(categories, feature)) {
                    map.data.overrideStyle(feature, {visible: true});
                } else {
                    map.data.overrideStyle(feature, {visible: pressed});
                }

                if (!pressed && gardenInfowindow.getPosition() === feature.getGeometry().get()) {
                    gardenInfowindow.close();
                }
            });
        }

        // add css style
        if( pressed) {
            $(self.dom).addClass("active");
        } else {
            $(self.dom).removeClass("active");
        }

    }

    function mobileGardenButtonAction(buttonInstance) {
        mobileGardenFilterButtonsInstance.click(buttonInstance);
        removeShowAllGardens("remove");
        //show gardens related to this button
        var features = gardenFeatures[buttonInstance.dom.id] || []; //id = classification (individual, share, etc)
        features.forEach(function (feature) {
            map.data.overrideStyle(feature, {visible: true});
        });
    }

    function GardenButton(id) {
        var self = this;
        self.dom = document.getElementById(id);
        self.toggle = function () {
            if (isMobileVersion()) {
                mobileGardenButtonAction(self);
            } else {
                gardenButtonAction(self);
            }
        };
    }

    //If we have a control at RIGHT_TOP, we consider controls have been set
    function controlVisible () {
        return 0 < map.controls[google.maps.ControlPosition.RIGHT_TOP].length;
    }

    function restoreNodes() {
        $(document.menuControl).removeAttr("style");
        $(document.menuControl).prependTo("body");
        document.menuControl = null;

        $(document.gardenFilterControl).removeAttr("style");
        $(document.gardenFilterControl).insertAfter("#gardenFilterButtonBack");
        document.gardenFilterControl = null;
    }

    function removeCustomMapHeaderOptions() {
        map.controls[google.maps.ControlPosition.RIGHT_TOP].clear();
        map.controls[google.maps.ControlPosition.TOP_LEFT].clear();
    }

    function removeCustomMapBottomOptions() {
        map.controls[google.maps.ControlPosition.BOTTOM_LEFT].clear();
    }

    function setCustomMapHeaderOptions() {
        document.gardenFilterControl = document.gardenFilterControl || document.getElementById('gardenFilter'),
        document.logoControl = document.logoControl || document.getElementsByClassName('menu-logo')[0],
        document.menuControl = document.menuControl || document.getElementsByClassName('menu')[0];

        document.gardenFilterControl.index = 0;
        document.logoControl.style.display = "block";
        document.menuControl.style.display = "block";

        map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.gardenFilterControl);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.logoControl);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.menuControl);


        //otherwise right: auto
        $(document.menuControl).css("right", 0);
    }

    function setCustomMapBottomOptions() {
        document.subscribeGarden = document.subscribeGarden || document.getElementById('subscribeGarden');
        document.subscribeGarden.style.display = "block";
        map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(document.subscribeGarden);
    }

    function setCustomMapOptions() {

        var shareGardenButton,
            individualGardenButton,
            dividedGardenButton,
            familyGardenButton,
            roofGardenButton,
            verticalGardenButton,
            institutionGardenButton,
            enterpriseGardenButton,
            farmGardenButton,
            henhouseGardenButton,
            hiveGardenButton,
            aquaponicsGardenButton,
            producerGardenButton,
            marketGardenButton,
            undefinedGardenButton;

        shareGardenButton = new GardenButton("share");
        individualGardenButton = new GardenButton("individual");
        dividedGardenButton = new GardenButton("divided");
        familyGardenButton = new GardenButton("family");
        roofGardenButton = new GardenButton("roof");
        verticalGardenButton = new GardenButton("vertical");
        institutionGardenButton = new GardenButton("institution");
        enterpriseGardenButton = new GardenButton("enterprise");
        farmGardenButton = new GardenButton("farm");
        henhouseGardenButton = new GardenButton("henhouse");
        hiveGardenButton = new GardenButton("hive");
        aquaponicsGardenButton = new GardenButton("aquaponics");
        producerGardenButton = new GardenButton("producer");
        marketGardenButton = new GardenButton("market");
        undefinedGardenButton = new GardenButton("undefined");

        google.maps.event.addDomListener(shareGardenButton.dom, 'click', shareGardenButton.toggle);
        google.maps.event.addDomListener(individualGardenButton.dom, 'click', individualGardenButton.toggle);
        google.maps.event.addDomListener(dividedGardenButton.dom, 'click', dividedGardenButton.toggle);
        google.maps.event.addDomListener(familyGardenButton.dom, 'click', familyGardenButton.toggle);
        google.maps.event.addDomListener(roofGardenButton.dom, 'click', roofGardenButton.toggle);
        google.maps.event.addDomListener(verticalGardenButton.dom, 'click', verticalGardenButton.toggle);
        google.maps.event.addDomListener(institutionGardenButton.dom, 'click', institutionGardenButton.toggle);
        google.maps.event.addDomListener(enterpriseGardenButton.dom, 'click', enterpriseGardenButton.toggle);
        google.maps.event.addDomListener(farmGardenButton.dom, 'click', farmGardenButton.toggle);
        google.maps.event.addDomListener(henhouseGardenButton.dom, 'click', henhouseGardenButton.toggle);
        google.maps.event.addDomListener(hiveGardenButton.dom, 'click', hiveGardenButton.toggle);
        google.maps.event.addDomListener(aquaponicsGardenButton.dom, 'click', aquaponicsGardenButton.toggle);
        google.maps.event.addDomListener(producerGardenButton.dom, 'click', producerGardenButton.toggle);
        google.maps.event.addDomListener(marketGardenButton.dom, 'click', marketGardenButton.toggle);
        google.maps.event.addDomListener(undefinedGardenButton.dom, 'click', undefinedGardenButton.toggle);

        if(!isMobileVersion()) {
            setCustomMapHeaderOptions();
            setCustomMapBottomOptions();
        }
    }

    function loadGardens() {

        map.data.loadGeoJson(utils.URL_PREFIX + "/gardens", {idPropertyName: "_id"},
            function (features) {
                $dispatcher.trigger("gardensLoaded", {array: features});
                features.forEach(function (feature) {
                    // create array with gardens grouped by type
                    feature.getProperty("classifications").forEach(function(classification){
                        if(classification === ''){
                            return;
                        }
                        if (!gardenFeatures[classification]) {
                            gardenFeatures[classification] = [];
                        }
                        gardenFeatures[classification].push(feature);
                    });
                    // set custom icon per garden type
                    map.data.overrideStyle(feature, {icon: gardenTypes[feature.getProperty("classifications")[0]].icon, visible: true});
                });
            }
            );
    }

    function circleIconFactory(color) {
        return {
            //path: 'M 0 0 L 3 0 L 2 3 z',
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            strokeColor: 'white',
            strokeWeight: 2,
            fillColor: color,
            fillOpacity: 1,
            anchor: new google.maps.Point(0, 0)
        };
    }

    function initGardenTypes() {
        var shareIcon = circleIconFactory('#99CCCC'),
            individualIcon = circleIconFactory('#006699'),
            dividedIcon = circleIconFactory('#0A8F85'),
            familyIcon= circleIconFactory('#DECAE0'),
            roofIcon = circleIconFactory('#AB84AF'),
            verticalIcon = circleIconFactory('#EAD09D'),
            institutionIcon = circleIconFactory('#BF0000'),
            enterpriseIcon = circleIconFactory('#FF8500'),
            farmIcon = circleIconFactory('#B1CE1C'),
            henhouseIcon = circleIconFactory('#AA8D00'),
            hiveIcon = circleIconFactory('#FFE000'),
            aquaponicsIcon = circleIconFactory('#A34200'),
            producerIcon = circleIconFactory('#6B2B00'),
            marketIcon = circleIconFactory('#E8AA0F'),
            undefinedIcon = circleIconFactory('#819DC6');

        gardenTypes.individual = {type: "individual", icon: individualIcon, label: "Jardin individuel"};
        gardenTypes.share = {type: "share", icon: shareIcon, label:"Jardin en commun"};
        gardenTypes.divided = {type: "divided", icon: dividedIcon, label:"Jardin partagé"};
        gardenTypes.family = {type: "family", icon: familyIcon, label:"Jardin familial"};
        gardenTypes.roof = {type: "roof", icon: roofIcon, label:"Jardin sur le toit"};
        gardenTypes.vertical = {type: "vertical", icon: verticalIcon, label:"Jardin vertical"};
        gardenTypes.institution = {type: "institution", icon: institutionIcon, label:"Jardin institutionnel"};
        gardenTypes.enterprise = {type: "enterprise", icon: enterpriseIcon, label:"Jardin d'entreprise"};
        gardenTypes.farm = {type: "farm", icon: farmIcon, label:"Ferme urbaine"};
        gardenTypes.henhouse = {type: "henhouse", icon: henhouseIcon, label:"Poulailler urbain"};
        gardenTypes.hive = {type: "hive", icon: hiveIcon, label:"Ruche"};
        gardenTypes.aquaponics = {type: "aquaponics", icon: aquaponicsIcon, label:"Acquaponie"};
        gardenTypes.producer = {type: "producer", icon: producerIcon, label:"Producteur"};
        gardenTypes.market = {type: "market", icon: marketIcon, label:"Marché"};
        gardenTypes.undefined = {type: "undefined", icon: undefinedIcon, label:"Surface disponible"};
    }

    function updateInfoWindowContent(placeDetailResult, event) {
        addressFormInstance.update(placeDetailResult, event);
    }

    function openInfoWindow(placeDetailResult, event) {

        addressFormInstance.reset();
        infowindow.setContent(infowindow.addressFormNode);
        updateInfoWindowContent(placeDetailResult, event);

        marker.setPosition(event.latLng);
        marker.setDraggable(true);
        marker.setVisible(true);
        infowindow.open(map, marker);
    }

    function closeInfoWindow() {
        marker.setVisible(false);
        infowindow.close();
    }


    function updateInfoWindow(event) {
        addressFormInstance.resetAddress();
        getPlaceDetails(event, updateInfoWindowContent);
        // reopen it, google.maps will pan in order to show whole form
        infowindow.open(map, marker);
    }

    function updateMarkerAndInfoWindow(event) {
        marker.setPosition(event.latLng);
        updateInfoWindow(event);
    }

    function searchByPlaceId(placeResults) {
        var request, deferred = Q.defer();
        if (placeResults.length > 0 && placeResults[0] && placeResults[0].place_id) {
            request = {
                placeId: placeResults[0].place_id
            };
            service.getDetails(request, function (placeResults, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    deferred.resolve(placeResults);
                } else {
                    deferred.reject(placeResults);
                }
            });
        } else {
            deferred.reject('place without place_id');
        }
        return deferred.promise;
    }

    function searchByLocation(latLng) {
        var deferred = Q.defer(),
            request = {
                location: latLng,
                radius: '0.1'
            };
        service.nearbySearch(request, function (results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                deferred.resolve(results);
            } else {
                deferred.reject(status);
            }

        });
        return deferred.promise;
    }

    function getPlaceDetails(event, infoWindowCallback) {
        searchByLocation(event.latLng)
            .then(function (placeResults) {
                return searchByPlaceId(placeResults);
            })
            .then(function (placeResultByPlaceId) {
                infoWindowCallback(placeResultByPlaceId, event);
            })
            .catch(function (error) {
                console.log(error);
            })
            .done();
    }



    function launchPopup(event) {
        getPlaceDetails(event, openInfoWindow);
    }

    function onMapDoubleClick(event) {

        if (isMobileVersion()) {
            return; // don't create garden if mobile version
        }

        gardenInfowindow.close();

        if (marker.getVisible()) {
            // if first step
            if (infowindow.getContent() === infowindow.addressFormNode) {
                updateMarkerAndInfoWindow(event);
            }
            // otherwise do nothing
        } else {
            addressFormInstance.flow.start.init(event);
        }
    }

    function initInfoWindow() {

        infowindow = new google.maps.InfoWindow();
        infowindow.addressFormNode = infowindow.addressFormNode || document.getElementById('addressFormContainer');
        infowindow.setContent(infowindow.addressFormNode);

        google.maps.event.addListener(infowindow, 'closeclick', function () {
            marker.setVisible(false);
        });

        google.maps.event.addListener(infowindow, 'position_changed', function () {
            addressFormInstance.validator.resetForm();
        });

        $(infowindow.getContent()).on('mouseover', function () {
            map.setOptions({scrollwheel: false});
        });

        $(infowindow.getContent()).on('mouseout', function () {
            map.setOptions({scrollwheel: true});
        });
    }

    function MobileInfoWindow() {
        var self = this;
        self.$dom = $(".mobile-garden-info-window");
        self.$content = self.$dom.find(".content");
        self.close = function() {
            self.$dom.removeClass("show");
        };
        self.$dom.find(".close").on("click", function() {
            self.close();
        });
        self.setContent = function(content) {
            self.$content.empty().html(content);
            // html remove click handlers second call
            gardenInfowindow.bindImages($(content).find(".imagesContainer").find("img"));
        };
        self.show = function () {
            self.$dom.addClass("show");
            self.$dom.scrollTop(0);
        };
    }

    function initMobileInfoWindow() {
        mobileInfoWindowInstance = new MobileInfoWindow();
    }

    function initMarker() {
        marker = new google.maps.Marker({
            map: map,
            anchorPoint: new google.maps.Point(0, -29),
            draggable: true,
            visible: false
        });

        google.maps.event.addListener(marker, 'dragend', updateInfoWindow);
    }

    function setMap(results, status) {

        google.maps.event.addListener(map, 'dblclick', onMapDoubleClick);

        if (status === google.maps.places.PlacesServiceStatus.OK) {

            map.fitBounds(results[0].geometry.viewport);
            map.setOptions({
                zoom: 12,
                panControl: false,
                scaleControl: false,
                disableDoubleClickZoom: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.LEFT_BOTTOM,
                    style: google.maps.ZoomControlStyle.LARGE
                },
                streetViewControlOptions: {
                    position: google.maps.ControlPosition.LEFT_BOTTOM
                },
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                    position: google.maps.ControlPosition.BOTTOM_LEFT
                }
            });

            //map.data.loadGeoJson("/gvaBounderies", {'idPropertyName': 'id'}, function (features) {
            //    // get feature by id, commented line below
            //    //var bounderyFeature = map.data.getFeatureById('gvaBounderies');
            //    var genevaBounderyFeature = features[0];
            //    map.data.overrideStyle(genevaBounderyFeature, {fillColor: 'red', fillOpacity: '0.1', strokeWeight: 1, strokeColor: 'red'});
            //});

            loadGardens();

            // data listener
            map.data.addListener("click", function (event) {
                if (event.feature && event.feature.getGeometry() && event.feature.getGeometry().getType() === 'Point') {
                    gardenInfowindow.setDetails(event.feature);
                    if (!isMobileVersion()) {
                        gardenInfowindow.setPosition(event.feature.getGeometry().get());
                        gardenInfowindow.open(map);
                    } else {
                        mobileInfoWindowInstance.setContent(gardenInfowindow.gardenDetailsNode);
                        mobileInfoWindowInstance.show();
                    }

                }
            });

            results.forEach(function (result) {
                console.log(result);
            });

            setCustomMapOptions();
        }

    }

    notificationStepAction = function () {
        infowindow.notificationNode = infowindow.notificationNode || document.getElementById("successContainer");
        $(infowindow.notificationNode).find("#notification").get(0).onclick = closeInfoWindow;
        return function () {
            infowindow.setContent(infowindow.notificationNode);
            marker.setDraggable(false);
        };
    };

    confirmationStepAction = function () {
        var step = this;

        step.saveGardenErrorCallback = function () {
            //show message in head of current step
            $(infowindow.confirmationNode).find(".error-message").removeClass("hide");
        };

        step.saveGardenAction = function () {
            addressFormInstance.ajaxSubmit(step.next.executeAction, step.saveGardenErrorCallback);
        };

        step.backToFormAction = function () {
            $(infowindow.confirmationNode).find(".error-message").addClass("hide");
            step.previous.executeAction();
        };

        infowindow.confirmationNode = infowindow.confirmationNode || document.getElementById("confirmationContainer");
        $(infowindow.confirmationNode).find("#confirm").get(0).onclick = step.saveGardenAction;
        $(infowindow.confirmationNode).find("#formpage").get(0).onclick = step.backToFormAction;
        return function (event) {
            event.preventDefault();
            $(infowindow.confirmationNode).find(".error-message").addClass("hide");
            if (addressFormInstance.isValid()) {
                infowindow.setContent(infowindow.confirmationNode);
                addressFormInstance.updateConfirmationPage();
                marker.setDraggable(false);
            }
        };
    };

    showAddressFormAction = function () {
        //var step = this;
        //$(infowindow.addressFormNode).find("#submit").get(0).onclick = step.next.executeAction;
        return function () {
            infowindow.setContent(infowindow.addressFormNode);
            marker.setDraggable(true);
        };
    };

    function Step(actionMethod, nextStep, previousStep) {
        var self = this, action;
        self.next = nextStep;
        self.previous = previousStep;
        self.executeAction = function (event) {
            if (!action) {
                action = actionMethod.call(self); // execute this method only once
            }
            action(event);
        };
    }

    function GardenSaveFlow() {
        var self = this, confirmationStep, successStep;
        successStep = new Step(notificationStepAction);
        self.start = new Step(showAddressFormAction);
        confirmationStep = new Step(confirmationStepAction, successStep, self.start);
        self.start.next = confirmationStep;
        self.start.init = function (event) {
            launchPopup(event);
            $(infowindow.addressFormNode).find("#byajax").get(0).onclick = self.start.next.executeAction;
        };
    }

    AddressForm = function () {
        var self = this, formFields, form, addressFields, subtypeEntry = $('#subtypeEntry'), subtypeDropdown = $('#subtype');

        form = $('#addressForm');

        // hide-show subType dropDown
        //$('#type').on('change', function(event) {
        //    if (event.currentTarget.value === '') {
        //        subtypeEntry.hide();
        //    } else {
        //        var ra = [new Option('onthe', 'fly', false, false), new Option('onthee', 'flye', false, false)];
        //        subtypeDropdown[0].options[0] = ra[0];
        //        subtypeDropdown[0].options[1] = ra[1];
        //        subtypeEntry.show();
        //    }
        //});


        function hideMultipleSelects() {
            var controlDivs = $(infowindow.addressFormNode).find(".icon-plus-minus");
            var selects = controlDivs.closest("tr");
            selects.addClass("hide");
            $(selects[0]).removeClass("hide");
            controlDivs.removeClass("hide");
        }

        // formFields use in back and front to ease maintenance
        addressFields = window.formFields.addressFields;
        formFields = window.formFields.formFields;

        function resetForm(listOfFields) {
            var component, domElement;
            for (component in listOfFields) {
                if (listOfFields.hasOwnProperty(component)) {
                    domElement = $(infowindow.addressFormNode).find('[name="' + listOfFields[component].fieldName +'"]');
                    if (domElement.is("select")) {
                        if(component === 'classifications') {
                            hideMultipleSelects();
                        }
                        domElement.each(function(){
                            this.selectedIndex = 0;
                        });
                    } else {
                        $(infowindow.addressFormNode).find('[name="' + listOfFields[component].fieldName+'"]').val('');
                    }
                }
            }
        }

        self.resetAddress = function () {
            resetForm(addressFields);
        };

        // reset ALL
        self.reset = function () {
            resetForm(formFields);
        };

        self.update = function (placeDetailResult, event) {
            var i, addressType, val;
            // Get each component of the address from the place details
            // and fill the corresponding field on the form.
            for (i = 0; i < placeDetailResult.address_components.length; i++) {
                addressType = placeDetailResult.address_components[i].types[0];
                if (formFields[addressType]) {
                    val = placeDetailResult.address_components[i][formFields[addressType].fieldFormat];
                    // force user to enter number
                    if (addressType !== 'street_number') {
                        $(infowindow.addressFormNode).find('[name="' + formFields[addressType].fieldName+'"]').val(val);
                    }
                }
            }

            //set coordinates
            $(infowindow.addressFormNode).find('#lat').val(event.latLng.lat());
            $(infowindow.addressFormNode).find('#lng').val(event.latLng.lng());
        };

        self.submitProcessing = false;
        self.ajaxSubmit = function (success, error) {
            var promise;
            if (self.submitProcessing) {
                return;
            }
            self.submitProcessing = true;
            if (form.valid()) {
                var data = new FormData(form[0]);

                promise = $.ajax({
                    type: "POST",
                    url: utils.URL_PREFIX + '/gardens/add',
                    data: data,
                    //dataType: 'json',
                    //contentType: 'application/json; charset=utf-8', // default application/x-www-form-urlencoded will post Form Data: key: value
                    contentType: false, //'multipart/form-data',
                    processData: false,
                    cache: false
                });
                /*jslint unparam: true*/
                promise.then(function () {
                    self.submitProcessing = false;
                    success();
                }).fail(function (jqXHR, textStatus, err) {
                    if (jqXHR.responseJSON && jqXHR.responseJSON.code === 'CUSTOMIZED') {
                        error(jqXHR.responseJSON.message);
                        self.submitProcessing = false;
                    } else {
                        error();
                        self.submitProcessing = false;
                    }
                });
            } else {
                error();
            }
        };

        self.validator = form.validate({
            rules: window.window.formFields.validationRules,
            messages: {
                number:    {
                    maxlength: "Max {0} digits"
                },
                street:    {
                    required: "Champ obligatoire",
                    maxlength: "Max {0} caractères"
                },
                city:      {
                    required: "Champ obligatoiree",
                    maxlength: "Max {0} caractères"
                },
                state:     {
                    required: "Champ obligatoire",
                    maxlength: "Max {0} caractères"
                },
                zip:       {
                    required: "Champ obligatoire",
                    maxlength: "Max {0} digits"
                },
                country:   {
                    required: "Champ obligatoire",
                    maxlength: "Max {0} caractères"
                },
                classifications:      {
                    required: "Champ obligatoire",
                    maxlength: "Max {0} caractères"
                },
                'type[1]':      {
                    maxlength: "Max {0} caractères"
                },
                'type[2]':      {
                    maxlength: "Max {0} caractères"
                },
                'type[3]':      {
                    maxlength: "Max {0} caractères"
                },
                subtype: {
                    maxlength: "Max {0} caractères"
                },
                images: {
                    maxsize: 10
                },
                gardenname: {
                    maxlength: "Max {0} caractères"
                },
                area: {
                    maxlength: "Max {0} caractères",
                    number: "Veuillez introduire une surface valide",
                    min: "Veuillez introduire une surface valide",
                    max: "Max {0} m2"
                },
                status: {
                    maxlength: "Max {0} caractères"
                },
                comment: {
                    maxlength: "Max {0} caractères"
                },
                organism: {
                    maxlength: "Max {0} caractères"
                },
                manager: {
                    maxlength: "Max {0} caractères"
                },
                email: {
                    required: "Champ obligatoire",
                    maxlength: "Max {0} caractères"
                },
                tel: {
                    maxlength: "Max {0} caractères"
                },
                website: {
                    maxlength: "Max {0} caractères",
                    url: "Le format doit être http://www.monsite.com"
                }
            },
            highlight: utils.validatorHighlight,
            unhighlight: utils.validatorUnhighlight
        });

        /*jslint unparam: true*/
        $.validator.addMethod("extendedemail", utils.emailValidator, "Format erroné: email@example.com");

        $.validator.addMethod("totalImagesSize", function (value, element, params) {
            var MAX_SIZE = params * 1024 * 1024;
            if (element && element.files.length > 0) {
                var size = 0;
                for(var i = 0; i< element.files.length; i++) {
                    size += element.files[i].size;
                    if (size > MAX_SIZE) {
                        return false;
                    }
                };
            }
            return true;
        }, "La taille totale des images est limitée à {0} MB");



        self.isValid = function () {
            return form.valid();
        };

        self.flow = new GardenSaveFlow();

        self.updateConfirmationPage = function () {
            var confirmationField, key, formElement;
            for (key in formFields) {
                if (formFields.hasOwnProperty(key)) {
                    confirmationField = $(infowindow.confirmationNode).find('[name="' + formFields[key].fieldName + '-read"]');
                    if (confirmationField.get(0)) {
                        formElement = $(infowindow.addressFormNode).find('[name="' + formFields[key].fieldName+'"]');
                        if (formElement.is("select")) {
                            if (formElement.length > 1) {
                                    var values = [];
                                    formElement.find('option:not(:first):selected').each(function(){
                                        values.push($(this).text().trim());
                                    });
                                confirmationField.html(values.join(", "));
                            } else {
                                confirmationField.html(formElement.find('option:not(:first):selected').text());
                            }
                        } else {
                            if (key === 'website') {
                                var url = $(infowindow.addressFormNode).find('[name="' + formFields[key].fieldName+'"]').val();
                                confirmationField.html(url.trim()!=""?"<a href='"+url+"' target='_blank'>"+url+"</a>":"");
                            } else {
                                confirmationField.html($(infowindow.addressFormNode).find('[name="' + formFields[key].fieldName+'"]').val());
                            }
                        }
                    }
                }
            }
        };

        self.addClassification = function(event) {
            $(event.currentTarget).parent().addClass("hide");
            $(event.currentTarget).closest("tr").next().removeClass('hide');
        };

        self.removeClassification = function(event) {
            $(event.currentTarget).closest("tr").addClass("hide");
            $(event.currentTarget).closest("tr").prev().find(".icon-plus-minus").removeClass("hide");
        };

        $('.icon-plus').on('click', self.addClassification);
        $('.icon-minus').on('click', self.removeClassification);
    };

    function initForm() {
        addressFormInstance = new AddressForm();
        $("#comment").on('keyup', function () {
            addressFormInstance.validator.element("#comment");
        });
    }

    function getClassisicationNames (classifications) {
        var labels = [];
        classifications.forEach(function(classification) {
            if (classification != '') {
                labels.push(gardenTypes[classification].label);
            }
        });
        return labels;
    }

    function initGardenDetails() {
        var detailField, key, formFields = window.formFields.formFields, status = {};

        gardenInfowindow = new google.maps.InfoWindow();
        gardenInfowindow.gardenDetailsNode = gardenInfowindow.gardenDetailsNode || document.getElementById('gardenDetails');
        gardenInfowindow.carrousel = new Carrousel("#carrousel", ".content");
        gardenInfowindow.setContent(gardenInfowindow.gardenDetailsNode);
        $(infowindow.addressFormNode).find('#status > option').each(function(index, option){
            status[option.value] = option.innerHTML;
        });

        $(gardenInfowindow.getContent()).on('mouseover', function(){
            map.setOptions({scrollwheel: false});
        });
        $(gardenInfowindow.getContent()).on('mouseout', function(){
            map.setOptions({scrollwheel: true});
        });

        gardenInfowindow.bindImages = function(images) {
            // handlers removed with .empty
            images.each(function(){
                $(this).on("click", gardenInfowindow.carrousel.show);
            });
            gardenInfowindow.carrousel.populateCarrousel(images);
        };

        gardenInfowindow.setDetails = function (feature) {
            for (key in formFields) {
                if (formFields.hasOwnProperty(key)) {
                    detailField = $(gardenInfowindow.gardenDetailsNode).find('[name="' + formFields[key].fieldName + '-detail"]');
                    if (detailField.get(0)) {
                        var value = '-', persistedValue = feature.getProperty(formFields[key].fieldName);
                        if (formFields[key].fieldName === 'gardenname') {
                            value = 'Anonyme';
                            detailField.css("color", gardenTypes[feature.getProperty("classifications")[0]].icon.fillColor);
                        }

                        if (persistedValue && persistedValue != '') {
                            value = persistedValue;
                            if (formFields[key].fieldName === 'street') {
                                var number = feature.getProperty('number') != ''?feature.getProperty('number')+", ":"";
                                value = number + value;
                            } else if (formFields[key].fieldName === 'status') {
                                value = status[value];
                            } else if (formFields[key].fieldName === 'area') {
                                value = value + " m2";
                            } else if (formFields[key].fieldName === 'website') {
                                value = "<a href='"+value+"' target='_blank'>"+value+"</a>";
                            }
                        }
                        detailField.html(value);
                    } else if (formFields[key].fieldName === "classifications") {
                        var classifications = getClassisicationNames(feature.getProperty("classifications"));
                        $(gardenInfowindow.gardenDetailsNode).find('[name="classification-detail"]').html(classifications[0]).css("color", gardenTypes[feature.getProperty("classifications")[0]].icon.fillColor);
                        classifications.splice(0, 1);
                        if (classifications.length > 0) {
                            $(gardenInfowindow.gardenDetailsNode).find('[name="autres-classifications-detail"]').html(classifications.join(", "));
                        } else {
                            $(gardenInfowindow.gardenDetailsNode).find('[name="autres-classifications-detail"]').html("-");
                        }

                    } else if (formFields[key].fieldName === "images") {
                        var images = feature.getProperty("images");
                        var imagesContainer = $(gardenInfowindow.gardenDetailsNode).find('.imagesContainer');
                        imagesContainer.empty();

                        if(images && images.length > 0) {
                            var index = 0;
                            images.forEach(function(image){
                                // temp solution until empty image upload solved
                                if(image.imageName.split(".").length > 1) {//it means file has an extension
                                    imagesContainer.append("<span><img src='"+ utils.URL_PREFIX +"/images/upload/"+image.imageName+"' data-index='"+index+"' \/><\/span>");
                                    index++;
                                } else {
                                    // temp solution until empty image upload solved
                                    imagesContainer.append("<span>-</span>");
                                }
                            });

                        } else {
                            imagesContainer.append("<span>-</span>");
                        }

                        gardenInfowindow.bindImages(imagesContainer.find("img"));
                    }
                }
            }
        };

    }

    function calculateWindowWidthInEm() {
        return $(window).width()/parseInt($("body").css("font-size"),10);
    }

    function isMobileVersion() {
        return windowWidthBreakInEM >= calculateWindowWidthInEm();
    }

    function initMobileGardenFilterButtons() {
        mobileGardenFilterButtonsInstance = new MobileGardenFilterButtons();
        mobileGardenFilterButtonsInstance.init();
    }
    
    function initGardenSearchWidget() {
        gardenSearchInstance = new GardenSearchWidget();
    }

    function initialize() {
        map = new google.maps.Map(document.getElementById('map-canvas'));

        initMarker();
        initInfoWindow();
        initGardenTypes();
        initForm();
        initGardenDetails();
        initMobileGardenFilterButtons();
        initMobileInfoWindow();
        initGardenSearchWidget();

        var request = {
            query: 'Geneva, Switzerland'
        };

        service = new google.maps.places.PlacesService(map);
        service.textSearch(request, setMap);

    }


    google.maps.event.addDomListener(window, 'load', initialize);

    // close popup when click on escape
    window.onkeydown = function( event ) {
        if ( event.keyCode === 27 ) {
            closeInfoWindow();
            gardenInfowindow.close();
            map.setOptions({scrollwheel: true});
        }
    };

    $(window).resize(function(){
        //$('#indicator').text($("body").css("font-size")+"-"+$(window).width()+"-"+$(window).width()/parseInt($("body").css("font-size"),10));
        if (!isMobileVersion()) {

            //close mobileGardenInfoWindow
            if (mobileInfoWindowInstance) {mobileInfoWindowInstance.close();}


            if(!controlVisible()) {
                setCustomMapHeaderOptions();
                setCustomMapBottomOptions();
                // init buttons and show all gardens when transition mobile->wide screen
                removeShowAllGardens("show");
                $("#gardenFilter > div").addClass("active");
                deactiveFilters = true; // remove if multiple selection in mobile
            }
        } else { // window too narrow

            //close gardenform, gardenInfowindow
            closeInfoWindow();
            gardenInfowindow.carrousel.close();
            gardenInfowindow.close();

            if(controlVisible()) {
                removeCustomMapHeaderOptions();
                removeCustomMapBottomOptions();
            }
            if(!$(".menu")[0]) {//if menu removed
                restoreNodes();
                // init Classification button and show all gardens when transition wide screen->mobile
                mobileGardenFilterButtonsInstance.setToFirstState();
            }
        }
    });

}());