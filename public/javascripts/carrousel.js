$(function() {
    "use strict";
    function Carrousel(selector, contentSelector) {
        var self = this, IMAGE_WIDTH = 0.7, IMAGE_HEIGHT = 0.7;
        self.$dom = $(selector);
        self.$domContent = self.$dom.find(contentSelector);
        self.calculateImageSize = function(image) {
            var width = image[0].width, height = image[0].height, size = {},
                screenWidth = $(window).width(), screenHeight = $(window).height(),
                screenLandscape = screenWidth >= screenHeight, imageLandscape = width >= height;
    
            if (screenLandscape && imageLandscape) {
                // if even with image width scaled to 70%, image height > screen height => adapt width
                if (screenWidth*IMAGE_WIDTH*(height/width) > screenHeight*IMAGE_HEIGHT) {
                    size.x = ((width/height)*screenHeight*IMAGE_HEIGHT).toFixed();
                } else {
                    size.x = (screenWidth*IMAGE_WIDTH).toFixed();
                }
                size.y = "auto";
            } else if ((!screenLandscape && !imageLandscape)  || (screenLandscape && !imageLandscape)) {
                // if even with image height scaled to 70%, image width > screen width => adapt height
                if(screenHeight*IMAGE_HEIGHT*(width/height) > screenWidth*IMAGE_WIDTH) {
                    size.y = ((height/width)*screenWidth*IMAGE_WIDTH).toFixed();
                } else {
                    size.y = (screenHeight*IMAGE_HEIGHT).toFixed();
                }
                size.x = "auto";
            } else if (!screenLandscape && imageLandscape) {
                size.x = "100%";
                size.y = "auto";
            } else if (screenLandscape && !imageLandscape) {
                size.y = "100%";
                size.x = "auto";
            }
            return size;
        };
        self.setImageSizes = function () {
            self.$domContent.find("img").each(function(){
                var size = self.calculateImageSize($(this));
                $(this).css("width", size.x).css("height", size.y);
            });
        };
        self.populateCarrousel = function(images) {
            var ul = $("<ul></ul>").css("width", images.length*100+"%");
            self.$domContent.empty().append(ul);
            images.each(function(){
                var li = $("<li class='vertical-center'></li>").css("width", (100/images.length)+"%"), div = $("<div></div>");
                var imageClone = $(this).clone();
                div.append(imageClone[0]);
                li.append(div);
                li.appendTo(ul);
            });
        };
        self.positionImageToShow = function(event) {
            var imageIndex = 0,
                screenWidth = $(window).width(), ul = self.$domContent.find("ul");
            ul.find("img").each(function(index, image) {
                if (image.src === event.currentTarget.src) {
                    imageIndex = index;
                    return false;
                }
            });
            ul.css("margin-left", -imageIndex*screenWidth);
            displayNavigationButtons(imageIndex*screenWidth, screenWidth);
        };
        self.show = function(event) {
            self.setImageSizes();
            self.positionImageToShow(event);
    
            self.$dom.addClass("show");
        };
        self.close = function() {
            self.$dom.removeClass("show");
        };
        function displayNavigationButtons(marginLeft, screenWidth) {
            var totalImages = self.$domContent.find("img").length, index = Math.abs(marginLeft/screenWidth),
                next = self.$dom.find(".next"), previous = self.$dom.find(".previous");
            if(totalImages == index+1) {
                next.addClass("hide");
            } else {
                next.removeClass("hide");
            }
            if(index == 0) {
                previous.addClass("hide");
            } else {
                previous.removeClass("hide");
            }
        };
        self.next = function() {
            var screenWidth = $(window).width(), ul = self.$domContent.find("ul"),
                marginLeft = parseInt(ul.css("margin-left"),10);
            ul.animate({"margin-left": marginLeft=(marginLeft-screenWidth)}, 800);
            displayNavigationButtons(marginLeft, screenWidth);
        };
        self.previous = function() {
            var screenWidth = $(window).width(), ul = self.$domContent.find("ul"),
                marginLeft = parseInt(ul.css("margin-left"),10);
            ul.animate({"margin-left": marginLeft=(marginLeft+screenWidth)}, 800);
            displayNavigationButtons(marginLeft, screenWidth);
        }
        self.$dom.find(".close").on("click", self.close);
        self.$dom.find(".next").on("click", self.next);
        self.$dom.find(".previous").on("click", self.previous);
    }

    window.Carrousel = Carrousel;
});