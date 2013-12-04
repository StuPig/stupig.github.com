/**
 * 'all' 任何事件都会触发 args：eventname, arguments
 * 'event' 事件 args：arguments
 * 事件可以绑定多个 'click touchstart touchend'
 */

var EventBus = {
        bind: function (names, callback, context) {
            var events = names.split(/\s+/),
                calls = this._callbacks || ( this._callbacks = {} );

            for (var i = 0, l = events.length; i < l; i ++) {
                var ev = events[i],
                    list = calls[ev] || (calls[ev] = []);

                list.push([callback, context]);
            }
            
            return this;
        },
        unbind: function (names, callback) {
            var events, calls; 

            if (!names || !(events = names.split(/\s+/))) {
                this._callbacks = {};
            } else if (calls = this._callbacks){
                for (var i = 0, len = events.length; i < len && (ev = events[i]); i ++) {
                    if (!callback) {
                        calls[ev] = [];
                    } else {
                        var list = calls[ev];
                        if (!list)
                            return this;
                        for (var j = 0, l = list.length; j < l; j ++) {
                            if ( list[j] && callback === list[j][0] ) {
                                list[j] = null;
                                break;
                            }
                        }
                    }
                }
            }

            return this;
        },
        one: function (names, callback, context) {
            var _cb = function () {
                callback.apply(context, arguments);
                this.unbind(names, _cb);
            };
            return this.bind(names, _cb, context);
        },
        trigger: function (names) {
            var events = names.split(/\s+/),
                both, list, calls, ev, callback, args;

            if ( !(calls = this._callbacks) )
                return this;

            for (var i = 0, len = events.length; i < len && (both = 2); i ++) {

                while ( both -- ) {
                    ev = both ? 'all' : events[i];

                    if (list = calls[ev]) {
                        for (var j = 0, l = list.length; j < l; j ++) {
                            if ( !(callback = list[j]) ) {
                                list.splice(j, 1);
                                j --;
                                l --;
                            } else {
                                args = both ? arguments : Array.prototype.slice.call(arguments, 1);
                                callback[0].apply( callback[1] || this, args );
                            }
                        }
                    }
                }
            }

            return this;
        }
    };