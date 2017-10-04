var GardenDAO = function(eventEmitter, mongoose) {
    var gardenSchema, Garden, self = this;
    gardenSchema = mongoose.Schema ({
        type: {type: String},
        d: {type: Date}, // save date time
        geometry: {
            type: {type: String},
            coordinates: {
                type: [[Number]],
                required: true,
                validate: {
                    validator: function(value) {
                        return value.length === 2;
                    },
                    message: 'coordinates must have 2 values.'
                }
            }
        },
        properties: {
            number  : {type: String, maxlength: 20},
            street  : {type: String, maxlength: 200},
            city    : {type: String, maxlength: 200},
            state   : {type: String, maxlength: 200},
            zip     : {type: String, maxlength: 200},
            country : {type: String, maxlength: 200},
            classifications: [{type: String, maxlength: 200}],
            subtype : {type: String, maxlength: 200},
            gardenname    : {type: String, maxlength: 200},
            area    : {type: Number, max: 100000, required: false, default: null},
            status  : {type: String, maxlength: 200},
            comment : {type: String, maxlength: 2000},
            organism: {type: String, maxlength: 200},
            manager : {type: String, maxlength: 200},
            email   : {type: String, maxlength: 200},
            tel     : {type: String, maxlength: 200},
            website : {type: String, maxlength: 200},
            images: [
                {imageName: {type: String, maxlength: 200}, imageDisplayName: {type: String, maxlength: 200}}]
        }
    });
    Garden = mongoose.model('gardens', gardenSchema);

    function format(data) {
        // remove lat et lng to avoid have them under properties
        var lat = data.lat;
        var lng = data.lng;
        var garden_string = "";
        delete data.lat;

        for (var prop in data) {
            if (data.hasOwnProperty(prop)) {
                garden_string += prop + " : " + data[prop] + "; ";
            }
        }
        console.log(garden_string);

        if (data.area && data.area != '') {
            data.area = parseInt(data.area, 10);
        } else {
            data.area = null;
        }

        var feature = {
            type: "Feature",
            d: new Date().toUTCString(),
            geometry: {type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)]},
            properties: data
        };
        return feature;
    }

    self.saveGarden = function (data) {
        var currentForm = this;
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            var garden = new Garden(format(data));

            garden.save(function(err, garden) {
                if (err) {
                    console.log('error saving garden');
                    console.log(err);
                    eventEmitter.emit('error', err, currentForm.next, garden);
                } else {
                    console.log(new Date() +" : garden successfully saved, id : ");
                    console.log(garden.id);
                    eventEmitter.emit('success', garden, currentForm.res);
                }
            });
        }
    };

    self.getAllGardens = function() {
        var context = this;
        if (mongoose.Connection.STATES.connected != mongoose.connection.readyState) {

            throw new Error('Not connected to the DB');

        } else {

            return Garden.find({}, null, {sort: {d: 1}}, function(err, gardens) {
                if (err) {
                    console.log('error getting all gardens');
                    console.log(err);
                    eventEmitter.emit('error', err, context.next);
                } else {
                    var root = {type: "FeatureCollection", features: gardens};
                    var json = JSON.stringify(root);
                    console.log(new Date() +' : accessing all gardens');
                    context.res.send(json);
                    context.res.end();
                }
            })

        }
    };
};

module.exports = GardenDAO;