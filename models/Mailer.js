var nodemailer = require('nodemailer'),
    config = require('../conf/config'),
    DOMAIN = (process.env.NODE_ENV === 'production')?'www.genevecultive.ch':'localhost:8080',
    interpolate = function(argsArray, template) {
        for(var i = 0; i<argsArray.length; i++) {
            template = template.replace(new RegExp("{@"+i+"}", 'g'), argsArray[i]);
        }
        return template;
    };

var Mailer = function () {
    var self = this;

    self.transporter = null;
    config.getConfig().then(function(config){
        self.transporter = nodemailer.createTransport("smtp://postmaster%40genevecultive.ch:"+config.mailerpwd+"@mail.infomaniak.com:587");

        self.transporter.on('error', function (err) {
            console.log("ERRRRROR FROM NODEMAILER TRANSPORTER");
            throw err;
        });
        
        self.transporter.on('idle', function() {
            console.log("NODEMAILER TRANSPORTER idle");
        });
    });
    
    self.sendMail = function(template, argsArray, recipient) {
        
        if (self.transporter === null) {
            throw new Error('config has not been loaded yet in Mailer.js');
        }
        
        var mailOptions = {
            from: "Genève cultive <info@genevecultive.ch>",
            to: recipient,
            bcc: (process.env.NODE_ENV === 'development')?"":"fredazom@hotmail.com",
            subject: template.subject, // Subject line
            text: interpolate(argsArray, template.msg)
            //html: "<b>Hello world</b>" // html body
        }
        self.transporter.sendMail(mailOptions, function (error) {
            if (error) {
                console.log(new Date() +" : error sending email");
                console.log(error);
            } else {
                console.log(new Date() +" : send mail for ["+template.subject+"]");
            }

            // if you don't want to use this transport object anymore, uncomment following line
            //self.transporter.close(); // shut down the connection pool, no more messages
        });
    }

    self.questionValidationTemplate = {msg: "Bonjour,\n\nVous pouvez valider votre question en cliquant sur:\nhttp://" + DOMAIN + "/forum/question/{@0}/validate\n\n" +
    "Si vous désirez modifier votre question, cliquez sur:\nhttp://"+DOMAIN+"/forum/question/{@0}/{@1}/update\n\n" +
    "Nous vous remercions pour votre participation et vous transmettons nos meilleures salutations.\n\n" +
    "L'équipe de Genève Cultive.",
        subject: "Validation de votre question au forum de Genève Cultive"};

    self.questionAddNotificationForGCTeamTemplate = {msg: "Bonjour l'équipe de Genève Cultive,\n\nUne question vient d'être postée sur le forum de Genève Cultive. Attention, il se peut que la question n'a pas encore été validée et n'est donc pas visible sur le forum.\n\n" +
    "Si vous accédez à la question, merci de ne pas modifier la question à moins que ça soit absolument nécessaire et ne pas cliquer sur 'Annuler' ou 'Update'.\n\n" +
    "Fermez simplement l'onglet une fois terminée.\n\n" +
    "Pour accéder à la question, cliquez sur:\nhttp://"+DOMAIN+"/forum/question/{@0}/{@1}/update\n\n" +
    "Fredy.",
        subject: "Ajout de question au forum de Genève Cultive"};

    self.responseValidationTemplate = {msg: "Bonjour,\n\nVous pouvez valider votre réponse/commentaire en cliquant sur:\nhttp://" + DOMAIN + "/forum/question/response/{@0}/validate\n\n" +
    "Si vous désirez modifier votre réponse/commentaire, cliquez sur:\nhttp://"+DOMAIN+"/forum/question/{@2}/response/{@0}/{@1}/update\n\n" +
    "Nous vous remercions pour votre participation et vous transmettons nos meilleures salutations.\n\n" +
    "L'équipe de Genève Cultive.",
        subject: "Validation de votre réponse/commentaire au forum de Genève Cultive"};
    
    self.responseNotificationForGCTeamTemplate = {msg: "Bonjour l'équipe de Genève Cultive,\n\nUne réponse vient d'être postée sur le forum de Genève Cultive. Attention, il se peut que la réponse n'a pas encore été validée et n'est donc pas visible sur le forum.\n\n" +
    "Si vous accédez à la réponse/commentaire, merci de ne pas modifier la réponse/commentaire à moins que ça soit absolument nécessaire et ne pas cliquer sur 'Annuler' ou 'Update'.\n\n" +
    "Fermez simplement l'onglet une fois terminé.\n\n" +
    "Pour accéder à la réponse/commentaire, cliquez sur:\nhttp://"+DOMAIN+"/forum/question/{@2}/response/{@0}/{@1}/update\n\n" +
    "Fredy.",
        subject: "Ajout de réponse/commentaire au forum de Genève Cultive"};

    self.notificationAfterResponseValidatedTemplate = {msg: "Bonjour,\n\nCeci est une notification après l'ajout d'une réponse/commentaire au forum de 'Genève cultive':\n\n" +
    "http://" + DOMAIN + "/forum/question/{@0}\n\n" +
    "Si vous ne voulez plus être notifié, cliquez sur:\nhttp://"+DOMAIN+"/forum/question/{@1}/user/{@2}/unsubscribe\n\n" +
    "Nous vous remercions pour votre participation et vous transmettons nos meilleures salutations.\n\n" +
    "L'équipe de Genève Cultive.",
        subject: "Notification du forum de Genève Cultive"};

    self.notificationQuestionOwnerTemplate = {msg: "Bonjour,\n\nCeci est une notification après l'ajout d'une réponse/commentaire à la question que vous avez posté sur le forum de 'Genève cultive':\n" +
    "http://" + DOMAIN + "/forum/question/{@0}\n\n" +
    "Si vous ne voulez plus être notifié, cliquez sur:\nhttp://"+DOMAIN+"/forum/question/{@1}/user/{@2}/unsubscribe\n\n" +
    "Nous vous remercions pour votre participation et vous transmettons nos meilleures salutations.\n\n" +
    "L'équipe de Genève Cultive.",
        subject: "Notification du forum de Genève Cultive"};

    self.adminAuthorization = {msg: "Salut {@0},\n\nMaintenant tu as des super pouvoirs...\n" +
    "http://"+DOMAIN+"/login/authaa/menu?token={@1}\n\n" +
    "L'équipe de Genève Cultive.",
        subject: "Gestion nouvelles - Genève Cultive"};

    self.gardenAddition = {msg: "Bonjour,\n\nLe jardin suivant vient d'être ajouté: \n" +
    "Nom: {@0};\n" +
    "Type: {@1};\n" +
    "Email: {@2};\n" +
    "Longitude: {@3};\n" +
    "Latitude: {@4}.\n" +
    "Plus d'info, sur la page d'admin, onglet 'Jardins';\n\n" +
    "L'équipe de Genève Cultive.",
        subject: "Ajout nouveau jardin - Genève Cultive"};

    self.gardenSaveError = {msg: "Fredy,\n\nLe jardin suivant n'a pas pu être ajouté: \n" +
    "Nom: {@0};\n" +
    "Type: {@1};\n" +
    "Email: {@2};\n" +
    "Description: {@3};\n" +
    "Canton: {@4};\n" +
    "Rue: {@5};\n" +
    "No: {@6};\n" +
    "ZIP: {@7};\n" +
    "Pays: {@8};\n" +
    "Tel: {@9};\n" +
    "Longitude: {@10};\n" +
    "Latitude: {@11}.\n" +
    "L'équipe de Genève Cultive.",
        subject: "Erreur lors d'ajout de nouveau jardin - Genève Cultive"};
};

var singleton = new Mailer();
module.exports = singleton;