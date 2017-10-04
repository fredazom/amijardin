/*jslint node: true */
/*jslint browser: true*/
(function () {
    "use strict";
    var context;
    var FormFields = function () {
        var self = this, addressKeys;
        self.addressFields = {
            street_number: {fieldName: "number", fieldFormat: 'short_name'},
            route: {fieldName: "street", fieldFormat: 'long_name'},
            locality: {fieldName: "city", fieldFormat: 'long_name'},
            administrative_area_level_1: {fieldName: "state", fieldFormat: 'short_name'},
            country: {fieldName: "country", fieldFormat: 'long_name'},
            postal_code: {fieldName: "zip", fieldFormat: 'short_name'},
            lat: {fieldName: "lat"},
            lng: {fieldName: "lng"}
        };
        self.formFields = {
            classifications: {fieldName: "classifications"},
            subtype: {fieldName: "subtype"},
            images: {fieldName: "images"},
            gardenname: {fieldName: "gardenname"},
            area: {fieldName: "area"},
            status: {fieldName: "status"},
            comment: {fieldName: "comment"},
            organism: {fieldName: "organism"},
            manager: {fieldName: "manager"},
            email: {fieldName: "email"},
            tel: {fieldName: "tel"},
            website: {fieldName: "website"}
        };

        self.validationRules = {
            street: {
                required: true,
                maxlength: 100
            },
            number: {
                maxlength: 8
            },
            city: {
                required: true,
                maxlength: 30
            },
            state: {
                required: true,
                maxlength: 2
            },
            zip: {
                required: true,
                maxlength: 8
            },
            country: {
                required: true,
                maxlength: 12
            },
            classifications: {
                required: true,
                maxlength: 50
            },
            subtype: {
                maxlength: 50
            },
            images: {
                totalImagesSize: 2 // size in MB
            },
            gardenname: {
                maxlength: 100
            },
            area: {
                number: true,
                min: 0,
                max: 100000,
                maxlength: 8
            },
            status: {
                maxlength: 20
            },
            comment: {
                maxlength: 2000
            },
            organism: {
                maxlength: 100
            },
            manager: {
                maxlength: 100
            },
            email: {
                required: true,
                extendedemail: true,
                maxlength: 50
            },
            tel: {
                maxlength: 30
            },
            website: {
                maxlength: 100,
                url: true
            }
        };

        for (addressKeys in self.addressFields) {
            if (self.addressFields.hasOwnProperty(addressKeys)) {
                self.formFields[addressKeys] = self.addressFields[addressKeys];
            }
        }
    };
    if (typeof window === 'undefined') {
        context = global;
    } else {
        context = window;
    }
    context.formFields = new FormFields();
}());