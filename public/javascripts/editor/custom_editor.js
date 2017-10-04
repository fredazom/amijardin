$(function() {

    var element = '#t', index = 0;
    $(element).wysiwyg({
        'class': 'fake-bootstrap',
        // 'selection'|'top'|'top-selection'|'bottom'|'bottom-selection'
        toolbar: 'top-selection',
        buttons: {
            // Smiley plugin
            smilies: {
                title: 'Smilies',
                image: '\uf118', // <img src="path/to/image.png" width="16" height="16" alt="" />
                popup: function( $popup, $button ) {
                    var list_smilies = [
                        '<img src="/images/editor/smiley/afraid.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/amorous.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/angel.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/angry.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/bored.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/cold.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/confused.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/cross.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/crying.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/devil.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/disappointed.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/dont-know.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/drool.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/embarrassed.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/excited.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/excruciating.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/eyeroll.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/happy.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/hot.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/hug-left.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/hug-right.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/hungry.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/invincible.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/kiss.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/lying.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/meeting.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/nerdy.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/neutral.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/party.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/pirate.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/pissed-off.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/question.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/sad.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/shame.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/shocked.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/shut-mouth.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/sick.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/silent.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/sleeping.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/sleepy.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/stressed.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/thinking.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/tongue.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/uhm-yeah.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/wink.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/working.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/bathing.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/beer.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/boy.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/camera.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/chilli.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/cigarette.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/cinema.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/coffee.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/girl.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/console.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/grumpy.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/in_love.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/internet.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/lamp.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/mobile.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/mrgreen.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/musical-note.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/music.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/phone.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/plate.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/restroom.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/rose.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/search.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/shopping.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/star.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/studying.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/suit.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/surfing.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/thunder.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/tv.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/typing.png" width="16" height="16" alt="" />',
                        '<img src="/images/editor/smiley/writing.png" width="16" height="16" alt="" />'
                    ];
                    var $smilies = $('<div/>').addClass('wysiwyg-plugin-smilies')
                        .attr('unselectable','on');
                    $.each( list_smilies, function(index,smiley) {
                        if( index != 0 )
                            $smilies.append(' ');
                        var $image = $(smiley).attr('unselectable','on');
                        // Append smiley
                        var imagehtml = ' '+$('<div/>').append($image.clone()).html()+' ';
                        $image
                            .css({ cursor: 'pointer' })
                            .click(function(event) {
                                $(element).wysiwyg('shell').insertHTML(imagehtml); // .closePopup(); - do not close the popup
                            })
                            .appendTo( $smilies );
                    });
                    var $container = $(element).wysiwyg('container');
                    $smilies.css({ maxWidth: parseInt($container.width()*0.95)+'px' });
                    $popup.append( $smilies );
                    // Smilies do not close on click, so force the popup-position to cover the toolbar
                    var $toolbar = $button.parents( '.wysiwyg-toolbar' );
                    if( ! $toolbar.length ) // selection toolbar?
                        return ;
                    return { // this prevents applying default position
                        left: parseInt( ($toolbar.outerWidth() - $popup.outerWidth()) / 2 ),
                        top: $toolbar.hasClass('wysiwyg-toolbar-bottom') ? ($container.outerHeight() - parseInt($button.outerHeight()/4)) : (parseInt($button.outerHeight()/4) - $popup.height())
                    };
                },
                tabindex: -1,
                showselection: index == 2 ? true : false    // wanted on selection
            },
            insertimage: {
                title: 'Insert image',
                image: '\uf030', // <img src="path/to/image.png" width="16" height="16" alt="" />
                tabindex: -1,
                //showstatic: true,    // wanted on the toolbar
                showselection: true
            },
            insertlink: {
                title: 'Insert link',
                tabindex: -1,
                image: '\uf08e' // <img src="path/to/image.png" width="16" height="16" alt="" />
            },
            // Fontsize plugin
            //fontsize: index != 0 ? false : {
            //    title: 'Size',
            //    image: '\uf034', // <img src="path/to/image.png" width="16" height="16" alt="" />
            //    tabindex: -1,
            //    popup: function( $popup, $button ) {
            //        // Hack: http://stackoverflow.com/questions/5868295/document-execcommand-fontsize-in-pixels/5870603#5870603
            //        var list_fontsizes = [];
            //        for( var i=8; i <= 11; ++i )
            //            list_fontsizes.push(i+'px');
            //        for( var i=12; i <= 28; i+=2 )
            //            list_fontsizes.push(i+'px');
            //        list_fontsizes.push('36px');
            //        list_fontsizes.push('48px');
            //        list_fontsizes.push('72px');
            //        var $list = $('<div/>').addClass('wysiwyg-plugin-list')
            //            .attr('unselectable','on');
            //        $.each( list_fontsizes, function( index, size ) {
            //            var $link = $('<a/>').attr('href','#')
            //                .html( size )
            //                .click(function(event) {
            //                    $(element).wysiwyg('shell').fontSize(7).closePopup();
            //                    $(element).wysiwyg('container')
            //                        .find('font[size=7]')
            //                        .removeAttr("size")
            //                        .css("font-size", size);
            //                    // prevent link-href-#
            //                    event.stopPropagation();
            //                    event.preventDefault();
            //                    return false;
            //                });
            //            $list.append( $link );
            //        });
            //        $popup.append( $list );
            //    }
            //    //showstatic: true,    // wanted on the toolbar
            //    //showselection: true    // wanted on selection
            //},
            // Header plugin
            //header: index != 0 ? false : {
            //    title: 'Header',
            //    image: '\uf1dc', // <img src="path/to/image.png" width="16" height="16" alt="" />
            //    tabindex: -1,
            //    popup: function( $popup, $button ) {
            //        var list_headers = {
            //            // Name : Font
            //            'Header 1' : '<h1>',
            //            'Header 2' : '<h2>',
            //            'Header 3' : '<h3>'
            //        };
            //        var $list = $('<div/>').addClass('wysiwyg-plugin-list')
            //            .attr('unselectable','on');
            //        $.each( list_headers, function( name, format ) {
            //            var $link = $('<a/>').attr('href','#')
            //                .css( 'font-family', format )
            //                .html( name )
            //                .click(function(event) {
            //                    $(element).wysiwyg('shell').format(format).closePopup();
            //                    // prevent link-href-#
            //                    event.stopPropagation();
            //                    event.preventDefault();
            //                    return false;
            //                });
            //            $list.append( $link );
            //        });
            //        $popup.append( $list );
            //    }
            //    //showstatic: true,    // wanted on the toolbar
            //    //showselection: false    // wanted on selection
            //},
            bold: {
                title: 'Bold (Ctrl+B)',
                image: '\uf032', // <img src="path/to/image.png" width="16" height="16" alt="" />
                tabindex: -1,
                hotkey: 'b'
            },
            italic: {
                title: 'Italic (Ctrl+I)',
                image: '\uf033', // <img src="path/to/image.png" width="16" height="16" alt="" />
                tabindex: -1,
                hotkey: 'i'
            },
            underline: {
                title: 'Underline (Ctrl+U)',
                image: '\uf0cd', // <img src="path/to/image.png" width="16" height="16" alt="" />
                tabindex: -1,
                hotkey: 'u'
            },
            strikethrough: {
                title: 'Strikethrough (Ctrl+S)',
                image: '\uf0cc', // <img src="path/to/image.png" width="16" height="16" alt="" />
                tabindex: -1,
                hotkey: 's'
            },
            //forecolor: {
            //    title: 'Text color',
            //    tabindex: -1,
            //    image: '\uf1fc' // <img src="path/to/image.png" width="16" height="16" alt="" />
            //},
            //highlight: {
            //    title: 'Background color',
            //    tabindex: -1,
            //    image: '\uf043' // <img src="path/to/image.png" width="16" height="16" alt="" />
            //},
            alignleft: index != 0 ? false : {
                title: 'Left',
                image: '\uf036', // <img src="path/to/image.png" width="16" height="16" alt="" />
                tabindex: -1,
                showselection: false    // wanted on selection
            },
            aligncenter: index != 0 ? false : {
                title: 'Center',
                image: '\uf037', // <img src="path/to/image.png" width="16" height="16" alt="" />
                tabindex: -1,
                showselection: false    // wanted on selection
            },
            alignright: index != 0 ? false : {
                title: 'Right',
                image: '\uf038', // <img src="path/to/image.png" width="16" height="16" alt="" />
                tabindex: -1,
                showselection: false    // wanted on selection
            },
            alignjustify: index != 0 ? false : {
                title: 'Justify',
                image: '\uf039', // <img src="path/to/image.png" width="16" height="16" alt="" />
                tabindex: -1,
                showselection: false    // wanted on selection
            },
            subscript: index == 1 ? false : {
                title: 'Subscript',
                image: '\uf12c', // <img src="path/to/image.png" width="16" height="16" alt="" />
                tabindex: -1,
                showselection: true    // wanted on selection
            },
            superscript: index == 1 ? false : {
                title: 'Superscript',
                image: '\uf12b', // <img src="path/to/image.png" width="16" height="16" alt="" />
                tabindex: -1,
                showselection: true    // wanted on selection
            },
            indent: index != 0 ? false : {
                title: 'Indent',
                image: '\uf03c', // <img src="path/to/image.png" width="16" height="16" alt="" />
                tabindex: -1,
                showselection: false    // wanted on selection
            },
            outdent: index != 0 ? false : {
                title: 'Outdent',
                image: '\uf03b', // <img src="path/to/image.png" width="16" height="16" alt="" />
                tabindex: -1,
                showselection: false    // wanted on selection
            },
            orderedList: index != 0 ? false : {
                title: 'Ordered list',
                image: '\uf0cb', // <img src="path/to/image.png" width="16" height="16" alt="" />
                tabindex: -1,
                showselection: false    // wanted on selection
            },
            unorderedList: index != 0 ? false : {
                title: 'Unordered list',
                image: '\uf0ca', // <img src="path/to/image.png" width="16" height="16" alt="" />
                tabindex: -1,
                showselection: false    // wanted on selection
            },
            removeformat: {
                title: 'Remove format',
                tabindex: -1,
                image: '\uf12d' // <img src="path/to/image.png" width="16" height="16" alt="" />
            }
        },
        // Submit-Button
        submit: {
            title: 'Submit',
            image: '\uf00c' // <img src="path/to/image.png" width="16" height="16" alt="" />
        },
        // Other properties
        selectImage: 'Click or drop image',
        placeholderUrl: 'www.example.com',
        placeholderEmbed: '<embed/>',
        maxImageSize: [600,200],
        //filterImageType: callback( file ) {},
        onKeyDown: function( key, character, shiftKey, altKey, ctrlKey, metaKey ) {
            // E.g.: submit form on enter-key:
            //if( (key == 10 || key == 13) && !shiftKey && !altKey && !ctrlKey && !metaKey ) {
            //    submit_form();
            //    return false; // swallow enter
            //}
        },
        onKeyPress: function( key, character, shiftKey, altKey, ctrlKey, metaKey ) {
        },
        onKeyUp: function( key, character, shiftKey, altKey, ctrlKey, metaKey ) {
        },
        onAutocomplete: function( typed, key, character, shiftKey, altKey, ctrlKey, metaKey ) {
            if( typed.indexOf('@') == 0 ) // startswith '@'
            {
                var usernames = [
                    'Evelyn',
                    'Harry',
                    'Amelia',
                    'Oliver',
                    'Isabelle',
                    'Eddie',
                    'Editha',
                    'Jacob',
                    'Emily',
                    'George',
                    'Edison'
                ];
                var $list = $('<div/>').addClass('wysiwyg-plugin-list')
                    .attr('unselectable','on');
                $.each( usernames, function( index, username ) {
                    if( username.toLowerCase().indexOf(typed.substring(1).toLowerCase()) !== 0 ) // don't count first character '@'
                        return;
                    var $link = $('<a/>').attr('href','#')
                        .text( username )
                        .click(function(event) {
                            var url = 'http://example.com/user/' + username,
                                html = '<a href="' + url + '">@' + username + '</a> ';
                            var editor = $(element).wysiwyg('shell');
                            // Expand selection and set inject HTML
                            editor.expandSelection( typed.length, 0 ).insertHTML( html );
                            editor.closePopup().getElement().focus();
                            // prevent link-href-#
                            event.stopPropagation();
                            event.preventDefault();
                            return false;
                        });
                    $list.append( $link );
                });
                if( $list.children().length )
                {
                    if( key == 13 )
                    {
                        $list.children(':first').click();
                        return false; // swallow enter
                    }
                    // Show popup
                    else if( character || key == 8 )
                        return $list;
                }
            }
        },
        onImageUpload: function( insert_image ) {
            // A bit tricky, because we can't easily upload a file via
            // '$.ajax()' on a legacy browser without XMLHttpRequest2.
            // You have to submit the form into an '<iframe/>' element.
            // Call 'insert_image(url)' as soon as the file is online
            // and the URL is available.
            // Example server script (written in PHP):
            /*
             <?php
             $upload = $_FILES['upload-filename'];
             // Crucial: Forbid code files
             $file_extension = pathinfo( $upload['name'], PATHINFO_EXTENSION );
             if( $file_extension != 'jpeg' && $file_extension != 'jpg' && $file_extension != 'png' && $file_extension != 'gif' )
             die("Wrong file extension.");
             $filename = 'image-'.md5(microtime(true)).'.'.$file_extension;
             $filepath = '/path/to/'.$filename;
             $serverpath = 'http://domain.com/path/to/'.$filename;
             move_uploaded_file( $upload['tmp_name'], $filepath );
             echo $serverpath;
             */
            // Example client script (without upload-progressbar):
            var iframe_name = 'legacy-uploader-' + Math.random().toString(36).substring(2);
            $('<iframe>').attr('name',iframe_name)
                .load(function() {
                    // <iframe> is ready - we will find the URL in the iframe-body
                    var iframe = this;
                    var iframedoc = iframe.contentDocument ? iframe.contentDocument :
                        (iframe.contentWindow ? iframe.contentWindow.document : iframe.document);
                    var iframebody = iframedoc.getElementsByTagName('body')[0];
                    var image_url = iframebody.innerHTML;
                    insert_image( image_url );
                    $(iframe).remove();
                })
                .appendTo(document.body);
            var $input = $(this);
            $input.attr('name','upload-filename')
                .parents('form')
                .attr('action','/script.php') // accessing cross domain <iframes> could be difficult
                .attr('method','POST')
                .attr('enctype','multipart/form-data')
                .attr('target',iframe_name)
                .submit();
        },
        forceImageUpload: false,    // upload images even if File-API is present
    })
        .change(function() {
            if( typeof console != 'undefined' )
                ;//console.log( 'change' );
        })
        .focus(function() {
            if( typeof console != 'undefined' )
                ;//console.log( 'focus' );
        })
        .blur(function() {
            if( typeof console != 'undefined' )
                ;//console.log( 'blur' );
        });
});