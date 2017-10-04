$(function() {
    "use strict";

    const populateTable = function(gardens) {
        const array = gardens && gardens.array && gardens.array.features;
        if (array) {
            const $tbody = $("#garden-tab").find("tbody");
            array.forEach(function(garden){
                $tbody.append("<tr>");
                $tbody.append("<td>" + garden.properties.gardenname + "</td>");
                $tbody.append("<td>" + garden.properties.email + "</td>");
                $tbody.append("<td>" + garden.properties.state + "</td>");
                $tbody.append("<td>" + garden.properties.street + "</td>");
                $tbody.append("<td>" + garden.properties.number + "</td>");
                $tbody.append("<td>" + garden.properties.tel + "</td>");
                $tbody.append("<td>" + garden.properties.manager + "</td>");
                $tbody.append("<td>" + garden.properties.organism + "</td>");
                $tbody.append("<td>" + garden.geometry.coordinates[0] + "</td>");
                $tbody.append("<td>" + garden.geometry.coordinates[1] + "</td>");
                $tbody.append("<td>" + (!!garden.d ? (utils.toLocalDateTime(new Date(garden.d))) : ("-")) + "</td>");
                $tbody.append("</tr>");
            });
        }
    }
    const $dispatcher = $({});
    const CHIFFRES_GARDENS_SUCCESS = "CHIFFRES_GARDENS_SUCCESS";
    const CHIFFRES_GARDENS_FAILURE = "CHIFFRES_GARDENS_FAILURE";
    const loader = new utils.Loader(utils.URL_PREFIX + "/gardens", $dispatcher, CHIFFRES_GARDENS_SUCCESS, CHIFFRES_GARDENS_FAILURE);
    $dispatcher.on(CHIFFRES_GARDENS_SUCCESS, function(event, gardens) {
        populateTable(gardens);
    });
    $dispatcher.on(CHIFFRES_GARDENS_FAILURE, function(err) {
        console.log(err);
    });
    loader.load();
});