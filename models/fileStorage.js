var EventEmitter = require('events').EventEmitter,
util = require('util'),
fs = require('fs'),
FILE_PATH = __dirname+'/../public/json/gardensDB.json'

var jsonFileWriter = {

    createFile: function (data) {
        var context = this;
        fs.appendFile(FILE_PATH, data, {encoding: 'utf8'}, function (err) {
            if (err) {
                context.emit('error', err);
            }
            console.log(new Date()+ "-" + FILE_PATH + ' created successfully');
            context.emit('finish');
        });
    },

    appendFile: function(data) {
        var context = this;
        fs.readFile(FILE_PATH, {encoding: 'utf8'}, function (err, fileContent) {
            if (err) {
                context.emit('error', err);
            } else {

                try {
                    jsonFileWriter.overwriteFile.call(context, data);
                } catch (err1) {
                    console.log("programmatic error (?)");
                    context.emit(new Date()+'- error saving file: ', err1);
                } finally {

                }

            }
        });
    },

    overwriteFile: function(content) {
        var context = this;

        fs.writeFile(FILE_PATH, content, {encoding: 'utf8'}, function(err) {
            if(err) {
                context.emit('error', err);
            } else {
                context.emit('finish');
            }
        });
    },


};

var FileStorage = function() {
    var self = this;
    this.save = function(data, req, res) {
        self.currentReq = req;
        self.currentRes = res;
        fs.exists(FILE_PATH, function (exists) {
            if (exists) {
                jsonFileWriter.appendFile.call(self, feature);
            } else {
                jsonFileWriter.createFile.call(self, feature);
            }
        });
    }

};



util.inherits(FileStorage, EventEmitter);

var singleton = new FileStorage();
module.exports = singleton;