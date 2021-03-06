(function($) {
    $.fn.typewriter = function(cb) {
        var that = this;
        that.each(function() {
            var $ele = $(this), str = $ele.html(), progress = 0;
            $ele.html('');
            $(that).show();

            var timer = setInterval(function() {
                var current = str.substr(progress, 1);
                if (current == '<') {
                    progress = str.indexOf('>', progress) + 1;
                } else {
                    progress++;
                }
                $ele.html(str.substring(0, progress) + (progress & 1 ? '_' : ''));
                if (progress >= str.length) {
                    clearInterval(timer);
                    cb();
                }
            }, 75);
        });
        return this;
    };
})(jQuery);
