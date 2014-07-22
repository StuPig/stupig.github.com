/**
 * got_${runwayIndex}: got_1 got_2 got_3 抓住肥皂
 * got_soap: 抓住肥皂
 * miss_soap: 漏掉肥皂
 * miss_${runwayIndex}: hand_1 hand_2 hand_3 未抓住肥皂
 * catch_${runwayIndex}: catch_1 catch_2 catch_3 抓对应的跑道的肥皂
 * soap_end: 抓住或者漏掉了肥皂 分数会传过去
 * soap_next: 抛出下个肥皂
 * row_end: 一组肥皂结束
 * check_points: 查看本次得分
 * pause_game: 暂停游戏
 * resume_game: 恢复游戏
 * game_over: 游戏非正常结束触发
 * get_score: 获取游戏分数
 * round_end: 每一轮非正常结束
 */


$(function () {
    'use strict';

    var win = window,
        doc = document,
        FREE_TIMES = leftTimes,
        ACTION_LATENCY = 300,
        SOAP_DROPPED_LATENCY = 1000,
        TIMEOUT = 3000,
        ASSETS_TIMEOUT = 15000,
        clientHeight,
        clientWidth,
        FPS = 60,
        hand1, hand2, hand3,
        frameLatency,
        spriteImg = new Image(),
        audioContext;

    if (typeof webkitAudioContext !== 'undefined') {
        audioContext = new webkitAudioContext();
        MT.log.send('error', {
            cate: 'webAudio',
            value: 1
        })
    }

    // TODO 4 test
    var frameTimes = 10000;
    var _frameTimes = frameTimes;
    var sumFrameTime = 0;

    win.requestAnimFrame = (function() {
        var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
        return function(f){raf(f)};
    })();

    /**
     * https://gist.github.com/EpokK/6211230
     */
    var cookie = (function(){
        var _cookie = "cookie",
            _exp = "; expires=";

        return {
            // @name
            // @var [optional]
            get: function(a,b){b=doc[_cookie].match("(?:;|^)\\s*"+a+"\\s*=\\s*([^;]+)\\s*(?:;|$)");return b&&b[1]},
            // @name
            // @value
            // @expiration date
            set: function(a,b,c){b=doc[_cookie]=a+"="+b+(c?_exp+c.toGMTString():"")},
            // @name
            remove: function(a){b=doc[_cookie]=a+"="+_exp+new Date().toGMTString()}
        }
    })();

    /**
     * 'all' 任何事件都会触发 args：eventname, arguments
     * 'event' 事件 args：arguments
     * 事件可以绑定多个 'click touchstart touchend'
     */

    var EventBus = {
        bind: function (names, callback, context) {
            var events = names.split(/\s+/),
                calls = EventBus._callbacks || ( EventBus._callbacks = {} );

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
                EventBus._callbacks = {};
            } else if (calls = EventBus._callbacks){
                for (var i = 0, len = events.length, ev; i < len && (ev = events[i]); i ++) {
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
                EventBus.unbind(names, _cb);
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

    /**
     * 背景层
     * @type {{canvas: HTMLElement, imgArr: Array, borderWidth: number, panelWidth: Number, init: Function, fitScreen: Function, paint: Function, _drawBg: Function, _drawLine: Function}}
     */
    var bgLayer = {
        canvas: doc.getElementById('bg'),
        imgArr: [],
        borderWidth: 3,
        panelWidth: 0,
        init: function () {
            var that = this;

            that.panelWidth = Math.floor((clientWidth - 3 * 4) / 3);
            that.fitScreen();
            that.paint();
        },
        fitScreen: function () {
            this.canvas.height = clientHeight;
            this.canvas.width = clientWidth;
        },
        paint: function () {
            var that = this,
                h = clientHeight,
                w = clientWidth,
                bgSize = 40,
                borderWidth = that.borderWidth,
                panelWidth = that.panelWidth;

            // 红色面板
            that._drawBg(560, 747, 0, panelWidth, h, bgSize, bgSize);
            that._drawLine(panelWidth + 1, 0, panelWidth + 1, h, '#000', borderWidth);
            // 黄色面板
            that._drawBg(467, 747, panelWidth + borderWidth * 2, panelWidth, h, bgSize, bgSize);
            that._drawLine(panelWidth * 2 + borderWidth * 3 + 2, 0, panelWidth * 2 + borderWidth * 3 + 2, h, '#000', borderWidth);
            // 蓝色面板
            that._drawBg(372, 747, (panelWidth + borderWidth * 2) * 2, panelWidth, h, bgSize, bgSize);
            // 蓝线
            that._drawLine(0, h - 100, w, h - 100, '#44fcfa', borderWidth);
        },
        // sx, sy, x , panelWidth, h, bgSize, bgSize
        _drawBg: function (sx, sy, x, panelWidth, panelHeight, bgWidth, bgHeight) {
            var that = this,
                ctx = that.canvas.getContext('2d'),
                y;

            for (panelWidth += x; x < panelWidth; x += bgWidth) {
                y = 0;
                for (; y < panelHeight; y += bgHeight) {
                    ctx.drawImage(spriteImg, sx, sy, 80, 80, x, y, bgWidth, bgHeight);
                }

                if (x + 2 * bgWidth > panelWidth) {
                    y = 0;
                    x += bgWidth;
                    for (y = 0; y < panelHeight; y += bgHeight) {
                        ctx.drawImage(spriteImg, sx, sy, (panelWidth - x) * 2, bgHeight * 2, x, y, panelWidth - x, bgHeight);
                    }
                    break;
                }
            }
        },
        _drawLine: function (sx, sy, dx, dy, color, width) {
            var ctx = this.canvas.getContext('2d');

            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(dx, dy);
            ctx.stroke();
        }
    };

    /**
     * 手的构造函数
     * @param runway 跑道
     * @constructor
     */
    function Hand (runway) {
        this.runway = runway;
        this.canvas = doc.getElementById('hand_' + runway);
        this.ctx = this.canvas.getContext("2d");
        this._stop = false;
        this.init();
    }
    Hand.prototype = {
        init: function () {
            var that = this;

            that.paint('normal');
            that._setPos();
            that.bindEvents();
        },
        paint: function (type) {
            var that = this;
            that.ctx.clearRect(0, 0, 83, 82);
            if (type === 'normal') {
                that.ctx.drawImage(spriteImg, 398, 1150, 166, 164, 0, 0, 83, 82);
            }
        },
        bindEvents: function () {
            var that = this,
                runway = that.runway;

                that.canvas.addEventListener('click', function () {
                    if (!that._stop) {
                        EventBus.trigger('catch_' + runway);
                    }
                });

            EventBus.bind('got_' + runway, function () {
                setTimeout(function () {
                    that.paint('normal');
                }, ACTION_LATENCY);
                that.paint('got');
            });

            EventBus.bind('miss_' + runway, function () {
                that.paint('miss');
            });

            EventBus.bind('pause_game', function () {
                "use strict";
                that._stop = true;
            });

            EventBus.bind('resume_game', function () {
                "use strict";
                that._stop = false;
            });
        },
        _setPos: function () {
            var that = this,
                panelWidth = bgLayer.panelWidth,
                borderWidth = bgLayer.borderWidth;

            that.canvas.style.left = panelWidth * (that.runway - 1)
                + (that.runway - 1) * 2 * borderWidth + Math.floor((panelWidth - 83) / 2) + 'px';
        }
    };

    /**
     * 肥皂构造函数
     * @param runway 第几道
     * @param remain 剩余肥皂数量
     * @param index 这一组的第几个
     * @return {*}
     * @constructor
     */
    var Soap = function (runway, remain, index) {
        var that = this;

        that.canvas = doc.getElementById('soap');
        that.ctx = that.canvas.getContext('2d');
        that.gravity = (5 * Math.pow((10 - remain) / 2, 2) + 200) * (clientHeight / 480);
        that.height = clientHeight;
        that.distance = that.height - 100 - 43;
        that._buffer = (that.height * 0.03) > 30 ? 30 : that.height * 0.03;
        that.min = (5 + remain * 2) / 100;
        this.imgs = {};
        that.startTime = 0;
        // 状态分为 init、running、got、miss、oops、end
        // 代表 初始化 在滑动 被接住 没接住 被漏掉 结束
        that.state = "init";
        that.index = index;
        that.runway = runway;
        that.x = that.calculateX();
        that.y = 0;
        that._score = 0;
        that.bindEvents();

        return that;
    };

    Soap.prototype = {
        bindEvents: function () {
            var that =  this;

            EventBus.bind('catch_' + that.runway, that._catch, that);
            EventBus.bind('pause_game', function () {
                "use strict";
                var that = this;

                if (that.state === 'running') {
                    that._pauseTime = Date.now();
                    that.state = 'pause';
                }
            }, that);

            EventBus.bind('resume_game', function () {
                "use strict";
                var that = this;

                if (that.state === 'pause') {
                    that.state = 'resume';
                }
            }, that);

            EventBus.bind('game_over', function () {
                "use strict";
                if (that.state !== 'init') {
                    that = null;
                }
            }, that);
        },
        _catch: function () {
            var that = this,
                percent = 0, time;


            if (that.state === 'end') {
                // 清除之前的肥皂
                that = null;
                return false;
            }

            if (that.state === 'pause') {
                return false;
            }

            if (!that.startTime) {
                that.startTime = Date.now();
            }

            time = Date.now() - that.startTime;
            that.y = .5 * that.gravity * Math.pow(time / 1000, 2);
            if (that.state === 'running') {
                if (that.y < (that.distance + that._buffer)) {
                    percent = (that.y / that.distance) * 100;
                    that._score = generateRealScore( percent );
                    that.state = 'got';
                    EventBus.trigger('got_soap got_' + that.runway);
                } else {
                    that.state = 'miss';
                    EventBus.trigger('miss_soap miss_' + that.runway);
                }

                if (that.y < (that.distance + that._buffer)) {
                    setTimeout(function () {
                        "use strict";
                        that.state = 'end';
                        EventBus.trigger('soap_end', that._score, that.runway);
                    }, ACTION_LATENCY);
                } else {
                    setTimeout(function () {
                        "use strict";
                        that.state = 'end';
                        EventBus.trigger('round_end', 0);
                    }, SOAP_DROPPED_LATENCY);
                }
            }

            // 如果超过抓空
            if (that.state === 'oops') {
                that.state = 'miss';
                EventBus.trigger('miss_' + that.runway);
                setTimeout(function () {
                    "use strict";
                    that.state = 'end';
                    EventBus.trigger('round_end', 0);
                }, SOAP_DROPPED_LATENCY);
            }

        },
        calculateX: function () {
            var that = this, x,
                panelWidth = bgLayer.panelWidth,
                borderWidth = bgLayer.borderWidth;

            // 第一道
            if (that.runway === 1) {
                x = (panelWidth - 42) / 2 - 13;
            // 第二道
            } else if (that.runway === 2) {
                x = (panelWidth - 42) / 2 - 13 + panelWidth + borderWidth * 2;
            // 第三道
            } else {
                x = (panelWidth - 42) / 2 - 13 + panelWidth * 2 + + borderWidth * 4;
            }

            return x;
        },
        toss: function () {
            this.state = 'running';
        },
        soapNext: function () {
            var that = this;

            EventBus.trigger('soap_next');
            that.soapNext = false;
        },
        update: function () {
            var that = this,
                time;

            if (that.state === 'running' || that.state === 'oops' || that.state === 'resume') {
                if (!that.startTime) {
                    that.startTime = Date.now();
                }

                if (that.state === 'resume') {
                    time = that._pauseTime - that.startTime;
                    that.startTime = Date.now() - time;
                    that.state = 'running';
                } else {
                    time = Date.now() - that.startTime;
                }

                that.y = .5 * that.gravity * Math.pow(time / 1000, 2);

                if (that.y >= that.height) {
                    that.state = 'end';
                    setTimeout(function () {
                        EventBus.trigger('round_end', 0);
                    }, SOAP_DROPPED_LATENCY);

                } else {

                    if ((that.y / that.distance) > that.min && that.soapNext) {
                        that.soapNext();
                    }

                    if (that.y >= (that.distance + that._buffer)) {
                        that.state = 'oops';
                        EventBus.trigger('miss_soap');
                    }

                    that.paint();
                }

            } else if (that.state === 'got' || that.state === 'miss') {
                that.paint();
            } else if (that.state === 'end') {
                that = null;
            }
        },
        paint: function () {
            var that = this;
            that.ctx.save();
            that.ctx.globalAlpha = .8;
            that.ctx.fillStyle = "#eee";
            that.ctx.fillRect(that.x + 22, 0, 17, that.y + 12);

            that.ctx.globalAlpha = 1;

            // 根据当前状态展示不同效果
            that._paintCurrentState();

            that.ctx.restore();
        },

        _paintCurrentState: function () {
            "use strict";
            var that = this,
                state = that.state;

            switch (state) {
                case 'got':
                    that.ctx.drawImage(spriteImg, 70, 1133, 139, 186, that.x - 6, that.y, 70, 93);
                    that.ctx.fillStyle = "#000";
                    that.ctx.font = "normal normal 50px serif";
                    that.ctx.fillText(that._score, that.x + 18, that.y - 10);
                    break;

                case 'miss':
                    that.ctx.drawImage(spriteImg, 223, 1162, 167, 156, that.x + 1, that.y, 84, 78);
                    break;

                case 'oops':
                    that.ctx.drawImage(spriteImg, 557, 871, 83, 86, that.x, that.y, 42, 42);
                    that.ctx.drawImage(spriteImg, 475, 969, 159, 71, that.x - 6, that.height - 150, 80, 36);
                    break;

                default:
                    that.ctx.drawImage(spriteImg, 557, 871, 83, 86, that.x, that.y, 42, 42);
                    break;
            }
        }
    };

    var soapLayer = {
        canvas: doc.getElementById('soap'),
        _soaps: [],
        _scores: [],
        current: 0,
        running: 0,
        _lastUpdateTime: 0,
        _lastFrameTime: 0,
        frameTime: (1000 / FPS),
        _stop: false,
        setSoaps: function (soapArr) {
            var that = this;

            that._scores = [];
            that.current = 0;
            that._soaps = soapArr;
            that.running = 0;

            // 更新文档
            that.update();
        },
        update: function () {
            var that = this;

            if ((Date.now() - that._lastUpdateTime) >= that.frameTime) {
                that.paint();
                that._lastUpdateTime = Date.now();
            }

            //TODO 4 test
            if (that._lastFrameTime && (-- frameTimes)) {
                var currentTime = Date.now() - that._lastFrameTime;

                sumFrameTime += currentTime;
            }

            requestAnimFrame(function () {
                that.update();

                if (!frameLatency && that._lastFrameTime) {
                    frameLatency = Date.now() - that._lastFrameTime;
                }

                that._lastFrameTime = Date.now();
            });
        },
        paint: function () {
            var that = this,
                ctx = that.canvas.getContext('2d');

            if (that._stop) {
                return false;
            }

            ctx.clearRect(0, 0, clientWidth, clientHeight);

            that._soaps.forEach(function (soap) {
                soap && soap.update();
            });
        },
        init: function () {
            var that = this;
            that.canvas = doc.getElementById('soap');
            that._soaps = [];
            that._scores = [];
            that.current = 0;
            that.running = 0;
            that._stop = false;

            that.fitScreen();
            that.bindEvents();
        },
        fitScreen: function () {
            var that = this;

            that.canvas.height = clientHeight;
            that.canvas.width = clientWidth;
        },
        bindEvents: function () {
            var that = this;

            EventBus.bind('round_end', function (score) {
                that.running = 0;
                that._scores.push(score);

                // 防止触发多次game_over
                if (!that._stop) {
                    EventBus.trigger('game_over', that._scores);
                    that._stop = true;
                    that._scores = [];
                }
            });

            EventBus.bind('soap_end', function (score, lastRunway) {
                score = score || 0;

                that.running --;
                that._scores.push(score);

                // 如果没有的话，触发row_end
                if (that._soaps.length === that.current && !that.running) {
                    EventBus.trigger('row_end', that._scores, lastRunway);
                } else {
                    EventBus.trigger('soap_next');
                }
            });

            EventBus.bind('got_soap', function () {
                "use strict";

                playGameSound('gotSoap');
            });

            EventBus.bind('miss_soap', function () {
                "use strict";

                playGameSound('missSoap');
            });

            EventBus.bind('soap_next', function () {
                // 如果还有的话，抛出下一个肥皂
                if (that._soaps.length > that.current) {
                    var soap = that._soaps[that.current ++];
                    that.running ++;

                    playGameSound('tossSoap');
                    soap.toss();
                }
            });

            EventBus.bind('pause_game restart_game', function () {
                that._stop = true;
            });

            EventBus.bind('resume_game', function () {
                that._stop = false;
            });

        }
    };

    var controller = {
        init: function () {
            // 生成随机序列
            this.seheme = generateScheme();
            this._scores = [];
            this.bindEvents();
            this.score = 0;

            this.run();
        },
        run: function (lastRunway) {
            var that = this,
                type = that.seheme.shift(),
                soapArr = [],
                tmpScheme = shuffle([1,2,3]).slice(0, type),
                tmpSoap, tmpRunway, i = 0;

            // 不允许下一组第一个soap的跑道与上一次相同
            while (lastRunway === tmpScheme[0]) {
                tmpScheme = shuffle([1,2,3]).slice(0, type);
            }

            for (; i < type; i ++) {
                tmpRunway = tmpScheme[i];
                // 剩余越少，速度越快
                tmpSoap = new Soap(tmpRunway, that.seheme.length, i);
                soapArr.push(tmpSoap);
            }

            // 加入到soapLayer中
            soapLayer.setSoaps(soapArr);
            EventBus.trigger('soap_next');
        },
        bindEvents: function () {
            var that = this,
                $exit = $('#exit'),
                $pause = $('#pause'),
                $restart = $('#restart');

            EventBus.bind('row_end', function(scores, lastRunway) {
                that._scores.push(scores);

                // 后续还有
                if (that.seheme.length) {

                    that.run(lastRunway);
                } else {
                    that.score = getSumScore(that._scores);
                    EventBus.trigger('check_points', that.score);
                }
            });
            EventBus.bind('game_over', function(scores) {
                that._scores.push(scores);
                that.score = getSumScore(that._scores);
            });

            EventBus.bind('get_score', function () {
                EventBus.trigger('check_points', that.score);
            });

            if (!$exit.data('binded')) {
                $exit.data('binded', true);
                $exit.on('click', function () {
                    "use strict";

                    // 先暂停，待用户确认离开之后再离开
                    EventBus.trigger('pause_game');

                    MT.msg.confirm('<p class="soap-msg soap-msg-tip">确定离开游戏？</p>',
                        {
                            ok: function () {
                                // TODO exit 离开的出口
                                location.reload();
                            },
                            cancel: function () {
                                stopWatch(function () {
                                    EventBus.trigger('resume_game');
                                });
                            }
                        }, {
                            okText: '离开',
                            cancelText: '继续游戏'
                        });
                });
            }

            if (!$pause.data('binded')) {
                $pause.data('binded', true);

                $pause.on('click', function () {
                    "use strict";

                    if ($pause.hasClass('pause')) {
                        $pause
                            .removeClass('pause')
                            .addClass('resume');

                        EventBus.trigger('pause_game');
                    } else {
                        $pause
                            .removeClass('resume')
                            .addClass('pause');

                        stopWatch(function () {
                            EventBus.trigger('resume_game');
                        });
                    }
                });
            }

            if (!$restart.data('binded')) {
                $restart.data('binded', true);

                $restart.on('click', function () {
                    EventBus.trigger('pause_game');

                    MT.msg.confirm('<p class="soap-msg soap-msg-tip">确定重新开始游戏？</p>',
                        {
                            ok: function () {
                                EventBus.trigger('restart_game');

                                restartGame();
                            },
                            cancel: function () {
                                stopWatch(function () {
                                    EventBus.trigger('resume_game');
                                });
                            }
                        }, {
                            okText: '重新开始',
                            cancelText: '继续游戏'
                        });
                });
            }
        }
    };

    /**
     * 游戏结束，未接到肥皂，展示捡肥皂图
     */

    var endGame = {
        status: {},
        init: function () {
            var that = this;

            that.status = {};

            // 阻止多次发stat请求
            that.hasSentStatRequest = false;
            that.hasSentLotteryRequest = false,
            // 阻止绑定多次“试试手气”
            $('#lottery').unbind('click', that._lottery);
            that._update();
            that.bindEvents();
        },
        hasSentStatRequest: false,
        hasSentLotteryRequest: false,
        _update: function (score) {
            "use strict";
            var that = this,
                $level = $('.level'),
                lastLevel = $level.data('level') || 'f',
                currentLevel = 'f',
                $lottery = $('#lottery');

            $level.removeClass('level-' + lastLevel);

            currentLevel = that._getLevel(score);
            that._updateFreeSoaps(currentLevel);

            $level
                .addClass('level-' + currentLevel)
                .data('level', currentLevel);

            if (score > 100) {
                    $lottery
                        .data('has_lotteried', false)
                        .show()
                        .on('click', score, that._lottery);

            } else {
                $('#lottery').hide();
            }
        },
        _updateFreeSoaps: function (level) {
            var $leftSoaps = $('.left-soaps'),
                $leftTimes = $('.left-times'),
                $remainTimes = $('.remain-times'),
                $levelTips = $('.level-tips');

            if (FREE_TIMES) {
                $leftSoaps
                    .removeClass('left-' + (FREE_TIMES + 1))
                    .addClass('left-' + FREE_TIMES);
                $leftTimes.text(FREE_TIMES);
            } else {
                $leftSoaps.removeClass('left-1');
                $remainTimes.text('你今天的免费抽奖机会已用完，明天还有噢~ 花10积分可再抽奖一次');
            }

            if (level === 'f') {
                $levelTips.text('达到E级别(超过100分)才有可能获得积分奖励噢~分数越高获奖几率越大');
            } else {
                $levelTips.text('你将有机会获得5-500积分噢~快试试手气');
            }
        },
        _getLevel: function (score) {
            "use strict";
            var currentLevel = 'f';

            if (score > 200) {
                currentLevel = 's';
            } else if (score > 180) {
                currentLevel = 'a';
            } else if (score > 160) {
                currentLevel = 'b';
            } else if (score > 140) {
                currentLevel = 'c';
            } else if (score > 120) {
                currentLevel = 'd';
            } else if (score > 100) {
                currentLevel = 'e';
            } else {
                currentLevel = 'f';
            }

            return currentLevel;
        },
        _lottery: function (e) {
            "use strict";

            var that = endGame,
                isFirstTime = !$('#lottery').data('has_lotteried'),
                score = e.data,
                _updateSoaps = function () {
                    var $leftSoaps = $('.left-soaps'),
                        $leftTimes = $('.left-times'),
                        $remainTimes = $('.remain-times');

                    $('#lottery').data('has_lotteried', true);

                    if (FREE_TIMES) {
                        FREE_TIMES --;
                    }

                    if (FREE_TIMES) {
                        $leftSoaps
                            .removeClass('left-' + (FREE_TIMES + 1))
                            .addClass('left-' + FREE_TIMES);
                        $leftTimes.text(FREE_TIMES);
                    } else {
                        $leftSoaps.removeClass('left-1');
                        $remainTimes.text('你今天的免费抽奖机会已用完，明天还有噢~ 花10积分可再抽奖一次');
                    }
                },
                _updatePoint = function (data) {
                    var $currentPoint = $('.current-point'),
                        currentPoint = Number($currentPoint.text());

                    // 更新积分
                    $currentPoint.text((currentPoint + data));
                },
                _lotteryFn = function () {

                    that.hasSentLotteryRequest = true;

                    $.mjs.getData({
                        url: LOTTERY_URL,
                        type: 'GET',
                        data: {
                            score: score
                        },
                        async: true,
                        update: true,
                        timeout: TIMEOUT,
                        s: function (data, ext, status, msg) {
                            data = data || 0;
                            _updateSoaps();

                            MT.msg.confirm('<h5 class="msg-title">' + ext.PrimaryDesc + '</h5><p class="msg-content">' + ext.SecondaryDesc + '</p>',
                                {
                                    ok: function () {
                                        if(ext.ShareUrl){
                                            location.href = ext.ShareUrl;
                                        }else{
                                            MT.pop.plus.share.show(ext.ShareContent, ext.ShareLink, ext.ShareImg);
                                        }
                                    }
                                },
                                {
                                    okText: data ? '分享喜悦' : '吐个槽',
                                    okGE: 'soap/lottery_none',
                                    cancelText: '继续游戏'
                                }
                            );

                            _updatePoint(data);
                        },
                        e: function (msg, ext, status){
                            var errMsg = '亲，你的网络不给力呀~换个网络环境好的地方玩儿吧~';

                            if (!isFirstTime) {
                                if(status == undefined) {
                                    _updateSoaps();
                                    MT.msg.confirm('<h5 class="msg-title">很遗憾！木有中~</h5><p class="msg-content">捡不起来的是肥皂，丢不掉的是节操。没抽到积分，只怪它过分丝滑</p>',
                                        {
                                            ok: function () {
                                                if(ext.ShareUrl){
                                                    location.href = ext.ShareUrl;
                                                }else{
                                                    MT.pop.plus.share.show(ext.ShareContent, ext.ShareLink, ext.ShareImg);
                                                }
                                            }
                                        },
                                        {
                                            okText: '吐个槽',
                                            okGE: 'soap/lottery_none',
                                            cancelText: '继续游戏'
                                        }
                                    );
                                    $.mjs.sendLog('error', 'event/soap/timeout/lottery');
                                }else{
                                    msg = msg || errMsg;
                                    MT.msg.alert(msg);
                                    $.mjs.sendLog('error', 'event/soap/error');
                                }
                            } else {
                                isFirstTime = false;

                                MT.msg.confirm('亲，您的网络环境不给力呀~换个网络环境好的地方再试一次吧~',
                                    {
                                        cancel: function () {
                                            lotteryFn(isFirstTime);
                                        }
                                    },
                                    {
                                        okText: '再试一次',
                                        cancelText: '继续游戏'
                                    }
                                );
                                $.mjs.sendLog('error', 'event/soap/timeout/lottery');
                            }
                        }
                    });
                },
                lotteryFn = function (isFirstTime) {
                    if ($('#lottery').data('has_lotteried')) {
                        MT.msg.alert('你已经抽过一次了噢，下次达到E级别(超过100分)才可以抽奖~分数越高获奖几率越大');
                        return false;
                    }

                    if (that.hasSentLotteryRequest) {
                        return false;
                    }

                    if (FREE_TIMES && isFirstTime) {
                        if (FREE_TIMES == 3) {
                            MT.msg.confirm('今日剩' + FREE_TIMES + '次免费抽奖机会，本次将扣除1次，用完花10积分可再抽一次', {
                                ok: function () {
                                    _lotteryFn();
                                }
                            }, {
                                okText: '确认抽奖',
                                cancelText: '取消'
                            });
                        } else {
                            _lotteryFn();
                        }
                    } else {

                        if (!FREE_TIMES && isFirstTime) {
                            MT.msg.confirm('今天的免费抽奖机会已用完，花10积分再抽一次？', {
                                ok: function () {
                                    _updatePoint(-10);
                                    _lotteryFn();
                                }
                            }, {
                                okText: '确认抽奖',
                                cancelText: '取消'
                            });
                        } else {
                            _lotteryFn();
                        }
                    }
                };


            lotteryFn(isFirstTime);
        },
        _showScore: function (score) {
            var that = this,
                isFisrtTime = that.firstTimeShareTip,
                nextFn = function () {
                    "use strict";

                    $(".end-score>strong").html(score);
                    that._update(score);
                    $(".end-game").show();
                };

            // 阻止重复请求
            if (that.hasSentStatRequest) {
                return false;
            }

            $.mjs.getData({
                url: SOAP_STAT_URL,
                type: 'GET',
                update : true,
                data: {
                    score: score
                },
                async: isFisrtTime ? false : true,
                timeout: isFisrtTime ? TIMEOUT : 0,
                s: function (data, ext, status, msg) {
                    "use strict";
                    that.status.success = true;

                    if (ext.ShareUrl) {
                        $('.share-score')
                            .data('url', ext.ShareUrl);
                    } else {
                        $('.share-score')
                            .data('content', ext.ShareContent)
                            .data('link', ext.ShareLink)
                            .data('img', ext.ShareImg);
                    }

                    if (isFisrtTime && (ext.ShareUrl || score <= 100)) {
                        that.firstTimeShareTip(score, ext);
                        nextFn();
                        that.firstTimeShareTip = false;
                    } else {
                        nextFn();
                    }
                },
                e : function (msg, ext, status){
                    var errMsg = '亲，你的网络不给力呀~换个网络环境好的地方玩儿吧~';

                    if (!isFisrtTime) {
                        // 缓存下来错误信息，在抽奖时候提示
                        that.status.error = {
                            msg: msg || errMsg
                        };
                        $.mjs.sendLog('error', 'event/soap/timeout/stat');
                    } else {
                        if(status == undefined){
                            MT.msg.alert(errMsg);
                            $.mjs.sendLog('error', 'event/soap/timeout/stat');
                        }else{
                            msg = msg || errMsg;
                            MT.msg.alert(msg);
                            $.mjs.sendLog('error', 'event/soap/error/stat');
                        }
                    }
                },
                complete: function () {
                    that.hasSentStatRequest = true;
                }
            });

            if (!isFisrtTime) {
                nextFn();
            }
        },
        firstTimeShareTip: function (score, ext) {
            "use strict";
            var level = this._getLevel(score).toUpperCase(),
                okFn = function () {
                    if(ext.ShareUrl){
                        location.href = ext.ShareUrl;
                    }else{
                        MT.pop.plus.share.show(ext.ShareContent, ext.ShareLink, ext.ShareImg);
                    }
                };

            if (score < 100) {
                MT.msg.confirm('<div class="msg-score-wrap"><span>本次得分：<strong class="msg-score">' + score + '</strong></span><span>级别：<strong class="msg-level">' + level + '</strong></span></div><p class="msg-content">没拿到高分，只怪肥皂过分丝滑T。T 让小伙伴们一起来接肥皂吧~</p>', {
                    ok: okFn
                }, {
                    okText : '勇敢的分享',
                    okGE: 'soap/first_time',
                    cancelText : '取消'
                });
            } else {
                MT.msg.confirm('<div class="msg-score-wrap"><span>本次得分：<strong class="msg-score">' + score + '</strong></span><span>级别：<strong class="msg-level">' + level + '</strong></span></div><p class="msg-content">接肥皂如此娴熟，何不向小伙伴们炫耀一下？</p>', {
                    ok: okFn
                }, {
                    okText : '炫耀一下',
                    okGE: 'soap/first_time',
                    cancelText : '取消'
                });
            }
        },
        bindEvents: function () {
            var that = this,
                $end = $('#end'),
                $shareScore = $('.share-score');

            $end.one('click', function () {
                EventBus.trigger('get_score');
            });

            if (!$shareScore.data('binded')) {
                $shareScore
                    .data('binded', true)
                    .on('click', function () {
                        "use strict";
                        var url = $shareScore.data('url'),
                            link = $shareScore.data('link'),
                            content = $shareScore.data('content'),
                            img = $shareScore.data('img');

                        if (that.status.error || !that.status.success) {
                            // TODO 要不要给出提示
                        } else {
                            if (url) {
                                location.href = url;
                            } else {
                                MT.pop.plus.share.show(content, link, img);
                            }
                        }
                    });
            }

            EventBus.bind('check_points', function (score){
                $end.hide();
                that._showScore(score);
            });

            EventBus.bind('game_over', function () {

                var avgFrameLatency = (frameTimes === 0 ? sumFrameTime / _frameTimes : sumFrameTime / (_frameTimes - frameTimes));

                if (avgFrameLatency > 50) {
                    MT.log.send('error', {
                        cate: 'avgFrameLatency',
                        value: avgFrameLatency
                    });
                }

                $end.show();
            });
        }
    };

    /**
     * 生成真实的分数 0 ~ 10 之间
     * @param s
     * @return {*}
     */
    function generateRealScore(n) {
        return Math.floor(Math.pow(n, 2) / 1000);
    }

    function getSumScore(scores) {
        var result = 0;

        scores.forEach(function (i) {
            i.forEach(function (n) {
                result += n;
            });
        });

        return result;
    }

    /**
     * 生成随机序列
     * @return {Array}
     */
    function generateScheme() {
        var times = [1,1,2,2,3,3,3,3,3];

        times = shuffle(times);

        times.unshift(1);
        return times;
    }

    /**
     * 数组洗牌算法
     * @param arr
     */
    function shuffle(arr) {
        var s = [];
        while (arr.length) s.push(arr.splice(Math.random() * arr.length, 1)[0]);
        return s;
    }

    /**
     * 加载资源
     * @param assets
     * @param callback
     */
    function loadAssets(assets, callback) {
        "use strict";
        var successCount = 0,
            assetsCount = 0,
            errorInfo = [],
            successFn = function (error) {
                var ratio;

                ++ successCount;
                ratio = Math.floor(successCount * 100 / assetsCount);

                callback && callback(ratio);

                errorInfo.push(error);

                if (successCount === assetsCount) {
                    clearTimeout(timer);
                    // 上报资源加载错误
                    MT.log.send('error', {
                        cate: 'assets',
                        value: errorInfo
                    });
                }
            },
            timer = setTimeout(function () {
                MT.msg.confirm('<p class="soap-msg">亲，你的网络不给力呀，换个网络环境好的地方玩吧~</p>', {
                    cancel: function () { location.reload(); }
                }, {
                    okText: '取消',
                    cancelText: '重试一次'
                });

                MT.log.send('error', {
                    cate: 'assetsTimeout',
                    value: 1
                });
            }, ASSETS_TIMEOUT);

        for (var name in assets) {
            if (assets.hasOwnProperty(name)) {
                assetsCount ++;
                if (assets[name][1] === 'img') {
                    loadImage(name, assets[name][0], successFn);
                }
                if (assets[name][1] === 'audio') {
                    loadAudio(name, assets[name][0], successFn);
                }
            }
        }
    }

    /**
     * 动态加载图片
     * @param name 名称
     * @param src 地址
     * @param callback
     * @param times 重试次数，超过3次，返回
     */
    function loadImage(name, src, callback, times) {
        "use strict";
        var img = new Image(),
            loaded = false,
            times = times || 0;

        img.addEventListener('load', function () {
            if (!loaded) {
                ASSETS[name] = img;
                callback && callback();
                loaded = true;
            }
        }, false);

        img.addEventListener('error', function () {
            times ++;

            if (times > 3) {
                callback && callback({name: name});
            } else {
                loadImage(name, src, callback, times);
            }

        }, false);

        img.src = src;
    }

    /**
     * 加载音频
     * @param name 名称
     * @param src 地址
     * @param callback
     */
    function loadAudio(name, src, callback) {
        "use strict";

        if (audioContext) {
            _loadByWebAudio(src, function (buffer) {
                ASSETS[name] = buffer;
                callback && callback();
            });
        } else {
            _loadByNormalAudio(src, function (audio, error) {
                ASSETS[name] = audio;
                if (error) {
                    callback && callback({name: name});
                } else {
                    callback && callback();
                }

            });
        }
    }

    /**
     * web audio的方式加载音频
     * @param url 音频地址
     * @param cb
     * @private
     */
    function _loadByWebAudio(url, cb) {
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        // XHR2
        req.responseType = 'arraybuffer';

        req.onload = function() {
            audioContext.decodeAudioData(req.response, cb);
        };

        req.send();
    }

    /**
     * 通过传统的Audio方式加载音频
     * @param src
     * @param callback
     * @param times
     * @private
     */
    function _loadByNormalAudio(src, callback, times) {
        "use strict";
        var audio = new Audio(),
            times = times || 0,
            timer;

        audio.preload = 'auto';
        audio.addEventListener('loadeddata', function () {
            clearTimeout(timer);
            callback && callback(audio);
        }, false);

        audio.addEventListener('error', function () {
            times ++;

            if (times > 3) {
                callback && callback(undefined, 'error');
            } else {
                loadAudio(src, callback, times);
            }
        }, false);

        timer = setTimeout(function () {
            callback && callback(undefined, 'error');
        }, TIMEOUT);

        audio.src = src;
    }

    /**
     * 播放音频
     * @param buffer
     * @param opt
     * @param cb
     */
    function playSound (buffer, opt, cb) {
        if (!opt) cb = opt;
        opt = opt || {};

        var src = audioContext.createBufferSource(),
            gainNode;

        src.buffer = buffer;

        gainNode = (audioContext.createGainNode && audioContext.createGainNode())
            || audioContext.createGain(); // note: on older systems, may have to use deprecated createGainNode()
        src.connect(gainNode);

        gainNode.connect(audioContext.destination);

        if (typeof opt.sound !== 'undefined')
            gainNode.gain.value = opt.sound;
        else
            gainNode.gain.value = 1;

        // Options
        if (opt.loop)
            src.loop = true;

        (src.noteOn && src.noteOn(0))
            || (src.start(0)); // note: on older systems, may have to use deprecated noteOn(time);

        cb(src);
    }

    /**
     * 停止播放
     * @param src
     */
    function stopSound (src) {
        src.noteOff(0);
    }

    /**
     * 播放游戏音乐
     * @param name
     * @param opt
     */
    function playGameSound(name, opt) {
        if (!audioContext) {
            ASSETS[name] && ASSETS[name].play();
        } else {
            opt = opt || {};

            var cb = function(src) {
                if (!ASSETS.audioSrc) {
                    ASSETS.audioSrc = {};
                }
                ASSETS.audioSrc[name] = src;
            };

            playSound( ASSETS[name], opt, cb );
        }
    }

    /**
     * 开始游戏
     */
    function startGame() {
        clientHeight = doc.documentElement.clientHeight;
        clientWidth = doc.documentElement.clientWidth;

        var $guide = $('#guide').css('display', 'table'),
            elProgress = doc.getElementById('progress'),
            assetsLoadedFn = function () {
                "use strict";
                bgLayer.init();
                soapLayer.init();
                hand1 = new Hand(1);
                hand2 = new Hand(2);
                hand3 = new Hand(3);

                $guide.on('click', function () {
                    $guide.hide();
                    stopWatch(function () {
                        controller.init();
                    });
                });
            };

        loadAssets(ASSETS, function (ratio) {
            "use strict";
            elProgress.style.width = ratio + '%';

            if (ratio == 100) {
                assetsLoadedFn();
            }
        });
    }

    /**
     * 重新开始游戏
     */
    function restartGame() {
        "use strict";

        EventBus.unbind();
        soapLayer.init();
        endGame.init();
        hand1 = new Hand(1);
        hand2 = new Hand(2);
        hand3 = new Hand(3);

        stopWatch(function () {
            controller.init();
        });
    }

    /**
     * 倒计时
     * @param cb
     */
    function stopWatch(cb) {
        "use strict";
        var PREPARE_TIME = 3,
            $stopWatch = $('#stop_watch').show(),
            $time = $('#time').text(PREPARE_TIME),
            timeId = setInterval(function () {
                PREPARE_TIME --;

                if (!(PREPARE_TIME + 1)) {
                    clearInterval(timeId);
                    $stopWatch.hide();

                    if (typeof cb === 'function') {
                        cb();
                    }
                } else if (!PREPARE_TIME) {
                    $time.text('go');
                } else {
                    $time.text(PREPARE_TIME);
                }
            }, 1000);
    }

    /**
     * 显示排行榜
     */
    function showRankingGame() {
        "use strict";
        var $rankingGame = $('#ranking_game'),
            $score = $('#total_score'),
            $ranking = $('#total_ranking'),
            $rankingWrap = $('.total-ranking-wrap'),
            loadRankFn = function () {
                $.mjs.getData({
                    url: RANKING_URL,
                    type: 'GET',
                    timeout: TIMEOUT,
                    update: true,
                    async: false,
                    s: function (data, ext, status, msg) {
                        $score.text(ext.Score);
                        if (ext.Score != 0) {
                            $ranking.find('span')
                                .text('您当前的排名为');
                            $ranking.text(ext.Rank);
                        } else {
                            $rankingWrap.find('span')
                                .text('客官，您木有进入榜单');
                        }

                        if (ext.ShareUrl) {
                            $('.share-ranking')
                                .data('url', ext.ShareUrl);
                        } else {
                            $('.share-ranking')
                                .data('content', ext.ShareContent)
                                .data('link', ext.ShareLink)
                                .data('img', ext.ShareImg);
                        }
                        buildRankList(ext.RankList);

                        setTimeout(function () {
                            $(".end-game").hide();
                            $('.start-game').hide();
                            $rankingGame.show();
                        }, 0);
                    },
                    e: function (msg, ext, status) {
                        if(status == undefined){
                            MT.msg.confirm('亲，您的网络环境不给力呀~换个网络环境好的地方再试一次吧~',
                                {
                                    cancel: loadRankFn
                                },
                                {
                                    okText: '继续游戏',
                                    cancelText: '再试一次'
                                }
                            );
                            $.mjs.sendLog('error', 'event/soap/timeout/rank');
                        }else{
                            msg = msg || errMsg;
                            MT.msg.alert(msg);
                            $.mjs.sendLog('error', 'event/soap/error');
                        }
                    }
                });
            };

        loadRankFn();
    }

    function buildRankList(ranklist) {
        "use strict";
        var ret = '';

        ranklist.forEach(function (rank, i) {
            ret += '<tr>\
                        <td class="number">NO.' + (i + 1) + '</td>\
                        <td class="name">' + rank.userName + '</td>\
                        <td class="score">' + rank.score + '</td>\
                    </tr>';
        });

        $('#ranking_table').html(ret);
    }

    /*
     * 游戏欢迎界面
     */
    function init() {
        FastClick.attach(document.body);

        spriteImg.onload = function () {
            "use strict";

            endGame.init();

            if (!cookie.get('soap_uid')) {
                cookie.set('soap_uid', Math.random().toString().slice(2, 12), new Date(2015, 11, 31));
            }

            $(".start-game .play").on('click', function() {
                // 如果未登录 不隐藏
                if (loginUrl || bindUrl) {
                    location.href = loginUrl || bindUrl;
                    return false;
                }

                $(".start-game").hide();

                startGame();
            });
            $(".end-game .play").on('click', function() {
                $(".end-game").hide();

                restartGame();
            });
            $(".ranking").on('click', function() {
                if (loginUrl || bindUrl) {
                    location.href = loginUrl || bindUrl;
                    return false;
                }
                // 显示排行榜
                showRankingGame();
            });
            $('.share-ranking').on('click', function () {
                var $this = $(this),
                    url = $this.data('url'),
                    link = $this.data('link'),
                    content = $this.data('content'),
                    img = $this.data('img');

                if (url) {
                    location.href = url;
                } else {
                    MT.pop.plus.share.show(content, link, img);
                }
            });
            $(".share").on('click', function() {
                if(shareUrl){
                    location.href = shareUrl;
                }else{
                    MT.pop.plus.share.show(shareContent, shareLink, shareImg);
                }
            });
        };
        spriteImg.src = ASSETS['sprite'][0];
    }

    window.soapInit = init;

    if (window.navigator.userAgent.indexOf('MicroMessenger') < 0) {
        soapInit();
    }
});
