$(function() {
    "use strict";

    const carrousel = new Carrousel("#carrousel", ".content");
    const images = $("#images-tab").find("img");
    images.each(function(){
        $(this).on("click", carrousel.show);
    });
    carrousel.populateCarrousel(images);
    
    
    function get2Columns(imageContainers) {
        var col1 = [];
        var col2 = [];
        imageContainers.each(function(index, container){
            if (index % 2 === 0) {
                col1.push(container);
            } else {
                col2.push(container);
            }
        });
        return [col1, col2];
    }

    function get3Columns(imageContainers) {
        var col1 = [];
        var col2 = [];
        var col3 = [];
        imageContainers.each(function(index, container){
            if (index % 3 === 0) {
                col1.push(container);
            } else if (index % 2 === 0) {
                col2.push(container);
            } else {
                col3.push(container);
            }
        });
        return [col1, col2, col3];
    }

    function get4Columns(imageContainers) {
        var col1 = [];
        var col2 = [];
        var col3 = [];
        var col4 = [];
        imageContainers.each(function (index, container) {
            if (index % 4 === 0) {
                col1.push(container);
            } else if (index % 3 === 0) {
                col2.push(container);
            } else if (index % 2 === 0) {
                col3.push(container);
            } else {
                col4.push(container);
            }
        });
        return [col1, col2, col3, col4];
    }

    function calculateWindowWidthInEm() {
        return $(window).width()/parseInt($("body").css("font-size"),10);
    }

    function getImageColumns(width, imageContainers) {
        var columns;
        // align with cultivonsnous.css
        if (width >= 116 ) {
            columns = get4Columns(imageContainers);
        } else if(width >= 96) {
            columns = get3Columns(imageContainers);
        } else if(width >= 73.8) {
            columns = get2Columns(imageContainers);
        } else { // mobile
            columns = imageContainers;
        }
        return columns;
    }

    function displayImageContainersInColumn(imageContainers, $container) {
        var currentWidth = calculateWindowWidthInEm();
        var imageContentColumns = getImageColumns(currentWidth, imageContainers);
        $container.empty();
        imageContentColumns.forEach(function(cols, index) {
            var div = $("<div></div>");
            cols.forEach(function(container) {
                div.append(container);
            });
            $container.append(div);
        });
    }

    // const imageContainers = $("#images-tab").find(".image-container");
    // displayImageContainersInColumn(imageContainers, $("#images-tab"));
    // $(window).resize(function() {
    //     displayImageContainersInColumn(imageContainers, $("#images-tab"));
    // });
});