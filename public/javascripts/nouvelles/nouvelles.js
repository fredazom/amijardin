$(function() {
    var $dispatcher = $({}),
        loadErrorMessage = new utils.ShowHide(".nouvelles-section .error-message");

    var nouvellesLoader = new utils.Loader('/nouvelles/visible', $dispatcher), nouvellesSection = new utils.DocumentsSection("#nouvelles-section-id", utils.NouvelleViewObject);
    nouvellesLoader.load();
    $dispatcher.on(utils.Loader.ERROR_LOADING_NOUVELLES, function(){
        loadErrorMessage.show();
    });
    $dispatcher.on(utils.Loader.NOUVELLES_LOADED, function(event, objectWithNouvelles){
        nouvellesSection.populate(objectWithNouvelles.array, false);
    });


    function Scroller () {
        var $window = $(window);
        $window .scroll(function() {
            if ($window .scrollTop() > 100) {
                $('.scrolltop:hidden').stop(true, true).fadeIn();
            } else {
                $('.scrolltop').stop(true, true).fadeOut();
            }
        });
        $(function(){$(".scroll").click(function(){$("html,body").animate({scrollTop:0},"1000");return false})})
    }

    new Scroller();
});