$(function(){
    const $dispatcher = $({});
    const ids = {};
    ids["undefined"] = 0;
    ids["individual"] = 0;
    ids["share"] = 0;
    ids["divided"] = 0;
    ids["family"] = 0;
    ids["roof"] = 0;
    ids["vertical"] = 0;
    ids["institution"] = 0;
    ids["enterprise"] = 0;
    ids["farm"] = 0;
    ids["henhouse"] = 0;
    ids["hive"] = 0;
    ids["aquaponics"] = 0;
    ids["producer"] = 0;
    ids["market"] = 0;

    const populateChiffres = function(gardens) {
        const array = gardens && gardens.array && gardens.array.features;
        if (array) {
            $("#total").text(array.length);
            array.forEach(function(garden){
                for (key in ids) {
                    if (garden.properties.classifications.indexOf(key) > -1) {
                        var $current = $("#"+key+"_total");
                        var c = parseInt($current.text(), 10) + 1;
                        $("#"+key+"_total").text(c);
                    }
                }
            });
            // reduce array
        }
    };

    const CHIFFRES_GARDENS_SUCCESS = "CHIFFRES_GARDENS_SUCCESS";
    const CHIFFRES_GARDENS_FAILURE = "CHIFFRES_GARDENS_FAILURE";
    const loader = new utils.Loader(utils.URL_PREFIX + "/gardens", $dispatcher, CHIFFRES_GARDENS_SUCCESS, CHIFFRES_GARDENS_FAILURE);
    $dispatcher.on(CHIFFRES_GARDENS_SUCCESS, function(event, gardens) {
        populateChiffres(gardens);
    });
    $dispatcher.on(CHIFFRES_GARDENS_FAILURE, function(err) {
        console.log(err);
    });
    loader.load();


});