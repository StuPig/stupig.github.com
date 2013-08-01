/*
 * jQuery carousel v1.0
 *
 * Copyright 2013 StuPig
 * Free to use under the MIT license.
 * http://opensource.org/licenses/MIT
 *
 * Inspired by Alessio Atzeni's A Pure CSS3 Cycling Slideshow:
 * http://coding.smashingmagazine.com/2012/04/25/pure-css3-cycling-slideshow/
 */

;(function(win, doc) {
    $.carousel = function (el, options) {
        var that = this,
            $carouseler = $(el),
            opts = $.extend({}, $.carousel.defaults, options),
            buildCarouseler, buildCarouselIndex, generateCarouselStyle;

        buildCarouseler = function($carouseler, opts) {
            var src = '';

            if (opts.snippet) {
                src = opts.snippet;
            } else {
                opts.items.forEach(function(item, index) {
                    src += '\
                        <li class="animation' + index + '">\
                            <img src="' + item.url + '" />\
                        </li>\
                    ';
                });
            }

            if (~$carouseler.find('.carousel').length) {
                src = '<div class="carousel"><div class="carousel-mask"><ul class="carousel-list">' + src + '</ul></div>' + (opts.progressBar ? '<div class="progress-bar"></div>' : '') + '</div>';

                $carouseler.html(src);
            } else {
                $carouseler.find('.carousel-list').html(src);
            }
        };

        buildCarouselIndex = function($carouseler, opts) {
            var quantity = $carouseler.find('.carousel-list>li').length,
                src = '<ol class="indexes">';

            for (var index = 0; index < quantity; index ++) {
                src += '<li></li>';
            }

            src += '</ol>';

            $carouseler.append(src);
        };

        generateCarouselStyle = function($carouseler, opts) {
            var quantity = $carouseler.find('.carousel-list>li').length,
                itemTimeSpan = opts.itemShowTime + opts.itemTransferTime,
                totalTime = quantity * itemTimeSpan,
                itemPercentSpan = +(100 / quantity).toFixed(0),
                framePercentSpan = itemPercentSpan / itemTimeSpan,
                direct = opts.direction === 'horizontal' ? 'right' : 'top',
                shift = opts.direction === 'horizontal' ? opts.width : opts.height,
                src = '', srcIndex = '';

            if (opts.transfer === 'fade')
                shift = 0;

            src += '.carousel {background:#000; height:' + opts.height + 'px; width:' + opts.width + 'px; margin:0 auto; overflow:visible; position:relative; } .carousel-mask {overflow:hidden; height:' + opts.height + 'px; } .carousel-list {margin:0; padding:0; position:relative; } .carousel-list>li {position:absolute; list-style:none; }';

            if (opts.progressBar)
                src += '.progress-bar {position:relative; top:-' + (opts.progressBar.height || 5) + 'px; height:' + (opts.progressBar.height || 5) + 'px; background:' + (opts.progressBar.background || '#00a3ce') + '; -webkit-animation:fullexpand 25s ' + (opts.progressBar.effect || 'ease-out') + ' infinite; }@-webkit-keyframes fullexpand {0%, 20%, 40%, 60%, 80%, 100% { width:0%; opacity:0; } 4%, 24%, 44%, 64%, 84% { width:0%; opacity:0.3; } 16%, 36%, 56%, 76%, 96% { width:100%; opacity:0.7; } 17%, 37%, 57%, 77%, 97% { width:100%; opacity:0.3; } 18%, 38%, 58%, 78%, 98% { width:100%; opacity:0; } }';

            for (var index = 0; index < quantity; index ++) {
                src += '.carousel li.animation' + index + '{-webkit-animation:cycle' + index + ' ' + totalTime + 's ' + opts.effect + ' infinite;}\n@-webkit-keyframes cycle' + index + '{\n';

                if (opts.indexes)
                    srcIndex += '.indexes>li:nth-child(' + (index + 1) + ') {-webkit-animation: index' + index + ' ' + totalTime + 's ease infinite;}\n@-webkit-keyframes index'+ index + '{\n';

                if (index === 0) {
                    src += '0% { ' + direct + ':0; }\n';
                    src += framePercentSpan + '% { ' + direct + ':0px; }\n';
                    src += (itemPercentSpan - framePercentSpan) + '% { ' + direct + ':0; opacity:1; z-index:0; }\n';
                    src += itemPercentSpan + '% { ' + direct + ':' + shift + 'px; opacity:0; z-index:0; }\n';
                    src += (itemPercentSpan + 1) + '% { ' + direct + ':-' + shift + 'px; opacity:0; z-index:-1; }\n';
                    src += (100 -framePercentSpan) + '% {' + direct + ':-' + shift + 'px; opacity:0; z-index:0; }\n';
                    src += '100% { ' + direct + ':0; opacity:1; }\n';

                    if (opts.indexes)
                        srcIndex += (100 - framePercentSpan) + '%, ' + (itemPercentSpan - framePercentSpan) + '% { background:' + opts.indexes.activeBackground + ';}\n' + itemPercentSpan + '%, ' + (100 - framePercentSpan) + '% {background:' + opts.indexes.normalBackground + '; }}\n'

                } else {
                    src += '0% { ' + direct + ':-' + shift + 'px; opacity:0; }\n';
                    src += (index * itemPercentSpan - framePercentSpan) + '% { ' + direct + ':-' + shift + 'px; opacity:0; }\n';
                    src += index * itemPercentSpan + '% { ' + direct + ':0; opacity:1; }\n';
                    src += (index * itemPercentSpan + framePercentSpan) + '% { ' + direct + ':0; opacity:1; }\n';
                    src += ((index + 1) * itemPercentSpan - framePercentSpan) + '% { ' + direct + ':0; opacity:1; z-index:0; }\n';
                    if (index === (quantity -1)) {
                        src += '100%{ ' + direct + ':' + shift + 'px; opacity:0; z-index:0; }\n';
                    } else {
                        src += ((index + 1) * itemPercentSpan) + '% { ' + direct + ':' + shift + 'px; opacity:0; z-index:0; }\n';
                        src += ((index + 1) * itemPercentSpan + 1) + '% { ' + direct + ':-' + shift + 'px; opacity:0; z-index:-1; }\n';
                        src += '100%{ ' + direct + ':-' + shift + 'px; opacity:0; z-index:-1; }\n';
                    }

                    if (opts.indexes)
                        srcIndex += (index * itemPercentSpan - framePercentSpan) + '%, ' + ((index + 1) * itemPercentSpan - framePercentSpan) + '% {background:' + (opts.indexes.activeBackground || 'red') + '; }\n ' + ((index + 1) * itemPercentSpan) + '%, ' + (index * itemPercentSpan - framePercentSpan) + '% {\nbackground:' + (opts.indexes.normalBackground || '#ccc') + ';}}\n';
                }

                src += '}\n';
            }

            if (opts.indexes) {
                srcIndex = '.indexes {display: -webkit-box; margin:0 auto; height:' + (opts.indexes.height || 12) + 'px; width:' + opts.width + 'px; padding:0; list-style: none; } .indexes>li {-webkit-box-flex:1; background: ' + (opts.indexes.background || '#ccc') + '; }' + srcIndex;
                src += srcIndex;
            }

            if (~$('.carousel-style').length) {
                src =  '<style class="carousel-style">' + src + '</style>';

                $(document.body).append(src);
            } else {
                $('.carousel-style').html(src);
            }
        };

        buildCarouseler($carouseler, opts);

        if (opts.indexes)
            buildCarouselIndex($carouseler, opts);

        generateCarouselStyle($carouseler, opts);
    };

    $.carousel.defaults = {
        width: 680,
        height: 320,
        itemShowTime: 3,            // Number: Set every item's showing time span, unit is second
        itemTransferTime: 2,        // Number: Set every item's transfer time span, unit is second
        direction: 'horizontal',    // String: Select the sliding direction, "horizontal" or "vertical"
        transfer: 'fade',           // String: Select the transfer mode, "fade" or "slide"
        effect: 'linear',           // String: Select the slide effect mode, "linear" "ease" "ease-in" "ease-out" or "ease-in-out"
        snippet: '',                // *String: Set carousel item's HTML source code, optional.
        progressBar: {              // Boolean or Object: Set whether to display progressBar. If true, set its style
            height: 5,              // Number: Set the height of the progress bar
            effect: 'ease-out',     // String: set the effect of the progress bar
            background: '#000'   // String: set the background of the progress bar
        },
        indexes: {                  // Boolean or Object: Set whether to display indexes. If true, set its style
            height: 12,
            activeBackground: '#00a3ce',
            normalBackground: '#ccc'
        },
        items: []                   // *collection: Set carousel items data, optional. if u already set snippet, this option will be useless
    };

    $.fn.carousel = function(options) {
        new $.carousel(this, options);

        return this;
    };
}) (window, document);
