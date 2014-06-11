/**
 * 触屏基础库
 * @
 */
$.mjs = {
    sendLog : function(t, v){
        console.log(t, v);
    },
    /*
     * JS对象缓存的变量
     * @property _js_cache
     * @type Object
     * @default {}
     * @private
     */
    _js_cache : {},
    /**
     * 本地缓存，存入方法
     * @namespace $.mjs
     * @method locCache_set
     * @param {String} k 需要存入缓存的Key
     * @param {All} v 需要存入缓存的内容
     * @param {Int} [e] 需要缓存的值的过期时间；默认为JO缓存到浏览器关闭，小于100000000时是需要缓存的秒数，反之是过期时间的时间戳
     * @param {String} [t='JO'] 缓存的类型，默认为JO类型，JO=JavaScript Object，LS=localStorage
     * @static
     */
    locCache_set : function(k, v, e, t){
        //缓存时间的处理
        if(typeof(e) != 'number'){
            //如果没有缓存时间直接存入JS中
            t = "JO";
            e = 86400;
        }else if(e === 0){
            //为0是删除之前的缓存
            this.locCache_remove(k);
            return;
        }
        //处理缓存时间
        this.locCache_expires(k, e, t);

        //存储到JS缓存
        this._js_cache[k] = v;

        //判断LS并且缓存
        if(localStorage && t=="LS"){
            if(typeof(v) == 'string' || typeof(v) == 'number'){
                v = v;
            }else if(typeof(v) == 'boolean'){
                v = '(-boolean-)'+v.toString();
            }else if(typeof(v) == 'object'){
                v = '(-object-)'+JSON.stringify(v);
            }
            localStorage.setItem(k, v);
            //保存过期时间部分
            localStorage.setItem('__expires__', JSON.stringify(this._js_cache['__expires__']['LS']));
        }
    },
    /**
     * 本地缓存，读取方法
     * @namespace $.mjs
     * @method locCache_get
     * @param {String} k 需要取得的缓存的Key
     * @returns {All} 返回对应的缓存数据
     * @static
     */
    locCache_get : function(k){
        //得到缓存时间
        var e = this.locCache_expires(k);

        //过期处理
        if(!e || e < new Date().getTime()){
            return undefined;
        }

        //读取JS缓存
        var o = this._js_cache[k];

        //如果没有取到，判断LS并取得
        if(!o && localStorage){
            o = localStorage.getItem(k);
            if(o && o.indexOf("(-boolean-)") == 0){
                o = (o == "(-boolean-)true");
            }else if(o && o.indexOf("(-object-)") == 0){
                o = JSON.parse(o.substr(10));
            }
            this._js_cache[k] = o;
        }
        return o;
    },
    /**
     * 本地缓存，删除方法
     * @namespace $.mjs
     * @method locCache_remove
     * @param {String} k 需要删除缓存的Key
     * @static
     */
    locCache_remove : function(k){
        //删除过期时间
        this.locCache_expires(k, null);
        //删除JS缓存
        delete this._js_cache[k];
        //判断LS并删除
        if(localStorage){
            localStorage.removeItem(k);
            //保存过期时间部分
            localStorage.setItem('__expires__', JSON.stringify(this._js_cache['__expires__']['LS']));
        }
    },
    /**
     * 本地缓存，清理方法，自动将过期缓存清空
     * @namespace $.mjs
     * @method locCache_clear
     * @param {boolean} [all=false] 是否清空全部缓存；默认为否，只删除过期的缓存内容
     * @static
     */
    locCache_clear : function(all){
        //删除所有
        if(all === true){
            this._js_cache = {};
            localStorage.clear();
            return;
        }
        //得到缓存时间
        var es = this.locCache_expires();
        for(i in es){
            for(k in es[i]){
                if(es[i][k] < new Date().getTime()){
                    this.locCache_remove(k);
                }
            }
        }
    },
    /**
     * 本地缓存，过期时间的操作
     * @namespace $.mjs
     * @method locCache_expires
     * @param {String} k 缓存的key
     * @param {Int|Null} [e] 缓存过期时间，如果带入0或null则删除缓存
     * @param {String} [t='JO'] 缓存的类型，默认是JO类型，JO=JavaScript Object，LS=localStorage
     * @returns {ALL} 如果只有k，返回此k对应的过期时间，否则返回整个过期时间数组
     * @static
     */
    locCache_expires : function(k, e, t){
        t = t=='LS' ? 'LS' : 'JO';
        //创建缓存时间JS对象
        if(!this._js_cache['__expires__']){
            this._js_cache['__expires__'] = {
                'JO' : {},
                'LS' : !localStorage ? {} : JSON.parse(localStorage.getItem('__expires__')) || {}
            };
        }

        if(e === 0 || e === null){
            //删除过期时间
            delete this._js_cache['__expires__']['JO'][k];
            delete this._js_cache['__expires__']['LS'][k];
        }else if(e !== undefined){
            //存入过期时间
            this._js_cache['__expires__'][t][k] = e<100000000 ? new Date().getTime()+e*1000 : e || 0;
        }

        //如果存在k，返回对应过期时间
        if(k !== undefined){
            return this._js_cache['__expires__']['JO'][k] || this._js_cache['__expires__']['LS'][k];
        }
        //读取所有的过期时间列表
        return this._js_cache['__expires__'];
    },
    /**
     * 本地缓存简单调用方法
     * @namespace $.mjs
     * @method locCache
     * @param {String} k 缓存的key
     * @param {All} [v=undefined] 需要缓存的数据，值为null是删除此缓存，不填写是得到缓存
     * @param {String} [t='JO'] 缓存的类型，LS=localStorage, CK=Cookie
     * @returns {All} 如果只带入k，则返回对应的缓存数据
     * @static
     * @deprecated Use `locCache_set`,`locCache_get`,`locCache_remove`
     */
    locCache : function(k, v, t){
        if(v === undefined){
            //得到内容
            return this.locCache_get(k);
        }else if(v === null){
            //删除内容
            this.locCache_remove(k);
        }
        //缓存内容
        this.locCache_set(k, v, t);
    },
    /**
     * 将时间戳转化为固定格式
     * @namespace $.mjs
     * @method numberToDate
     * @param {Number} number 需要转化的时间戳，空值为当前
     * @param {String} format 转化后的格式
     * @returns {String} 转化后的输出
     * @since 1.0
     * @static
     */
    numberToDate : function(number, format){
        var date = number ? new Date(number) : new Date();
        //无格式直接输出
        if(!format){
            return date.toLocaleString();
        }
        //根据格式输出
        var trim2 = function(n){return ('0' + n).substr(-2, 2)},
            v = {
                yyyy : date.getFullYear(),
                yy : trim2(date.getFullYear()),
                MM : trim2(date.getMonth()+1),
                M : date.getMonth()+1,
                dd : trim2(date.getDate()),
                d : date.getDate(),
                hh : trim2(date.getHours()),
                h : date.getHours(),
                mm : trim2(date.getMinutes()),
                m : date.getMinutes(),
                ss : trim2(date.getSeconds()),
                s : date.getSeconds()
            };
        for(var k in v){
            format = format.replace(k, v[k]);
        }
        return format;
    },
    /**
     * 取得文本长度（中文代表两个字符）
     * @namespace $.mjs
     * @method cnStrlen
     * @param {String} str 需要取得长度的字符串
     * @returns {Number} 文本的长度
     * @static
     */
    cnStrlen : function(str){
        return str.replace(/[^\u00-\uFF]/g, "**").length;
    },
    /**
     * 得到网络连接状态
     * @namespace $.mjs
     * @method getConnection
     * @returns {String} 返回为网络状态（unknown,ethernet,wifi,2g,3g,4g,none）
     * @static
     * @beta
     */
    getConnection : function(){
        var type_text = ['unknown','ethernet','wifi','2g','3g','4g','none'];
        var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {tyep_text:'unknown'};
        if(typeof(conn.type) == "number"){
            conn.type_text = type_text[conn.type];
        }else{
            conn.type_text = conn.type;
        }
        //FireFox 用户太少暂不启用
        /*
         if(typeof(conn.bandwidth) == "number"){
         if(conn.bandwidth > 10){
         conn.type_text = 'wifi_b';
         }else if(conn.bandwidth > 2){
         conn.type_text = '3g_b';
         }else if(conn.bandwidth > 0){
         conn.type_text = '2g_b';
         }else if(conn.bandwidth <= 0){
         conn.type_text = 'none_b';
         }else{
         conn.type_text = 'unknown_b';
         }
         }
         */
        return conn.type_text;
    },
    /**
     * 判断图片格式是否能使用，同时会将支持情况存入cookie中供后端使用
     * @namespace $.mjs
     * @method checkImgF
     * @param {String} format 图片格式，暂时支持webp、svg
     * @returns {Boolean} 返回是否支持
     * @static
     */
    checkImgF : function(format){
        var imgs = {
                webp : 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA',
            },
            _this = this;
        //判断格式是否存在
        if(!format || !imgs[format]){
            return false;
        }
        //判断之前有无做过检测，没有做过判断进行检测
        if(!~document.cookie.indexOf(format)){
            var img = new Image();
            img.onload = function(){
                if(this.height == 2){
                    document.cookie = format+'=1; expires=Wed, 1 Jan 2020 00:00:00 GMT; path=/';
                    _this.sendLog('fun', {webp:true});//发送log
                }else{
                    _this.sendLog('fun', {webp:false});//发送log
                }
            }
            img.src = imgs[format];
        }
        //根据换回值确定结果
        if(document.cookie.indexOf(format+'=1')>=0 || img && img.height == 2){
            return true;
        }
        return false;
    },
    /**
     * 得到位置信息的方法
     * @namespace $.mjs
     * @method getGeo
     * @param {Function} s 正确时的回调
     * @param {Function} [e] 错误时的回调
     * @param {Int} [timeout=10000] 超时时间；单位毫秒，默认10000毫秒
     * @static
     */
    getGeo : function(s, e, timeout){
        //通过缓存得取
        var geo = this.locCache_get('geo');
        if(geo){
            setTimeout(function(){
                s(geo);
            }, 200);
            return;
        };
        //重新取得
        timeout = timeout || 10000;
        var _this = this,
        //获得经纬度
            su = function(g){
                _this.getData({
                    //url : '/addr/latlng/'+ g.coords.latitude + ',' + g.coords.longitude + '/end',
                    url : 'city.json',
                    s : function(data){
                        _this.locCache_get('geo', data, 300, 'LS');
                        if(typeof(s) == 'function'){
                            s(data);
                        }
                    }
                });
                _this.sendLog('fun', {geo:true});//发送log
            },
        //未获得经纬度
            er = function(g){
                geo = {
                    code : g.code,
                    message : g.message
                };
                _this.locCache_get('geo', geo, 30, 'LS');
                if(typeof(e) == 'function'){
                    e(geo);
                }
                _this.sendLog('fun', {geo:false});//发送log
            };
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(su, er, {timeout:timeout});
        }else{
            _this.sendLog('fun', {geo:undefined});//发送log
        }
    },
    /**
     * 得到两个经纬度之间的直线距离
     * @namespace $.mjs
     * @method getDistance
     * @param {Number} lat1 第一个纬度值
     * @param {Number} lng1 第一个经度值
     * @param {Number} lat2 第二个纬度值
     * @param {Number} lng2 第二个经度值
     * @returns {Number} 两个经纬度之间的直线距离，单位公里
     * @static
     */
    getDistance : function(lat1, lng1, lat2, lng2){
        var r1 = lat1 * Math.PI / 180,
            r2 = lat2 * Math.PI / 180,
            a = r1 - r2,
            b = lng1 * Math.PI / 180 - lng2 * Math.PI / 180,
            s = 6378.137 * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) + Math.cos(r1) * Math.cos(r2) * Math.pow(Math.sin(b/2),2)));
        return Math.round(s * 10) / 10;
    },
    /**
     * 取得接口数据；符合接口规范
     * @namespace $.mjs
     * @method getData
     * @param {Object} conf 取得数据的相关配置
     *    <code>
     *     {
     *         url : "/url/", //数据接口地址
     *         s : function(o, e, s){}, //返回成功时的处理，o为接口data中的数据，e为接口ext中的数据， s为返回的状态值。
     *         e : function(o, e, s){}, //返回失败时的处理，o为接口message中的字符串，e为接口ext中的数据， s为返回的状态值。
     *         cache : "cacheId", //cache的key，添加此字段将会做本地的缓存，默认是JS缓存到页面关闭
     *         cacheType : "LS", //cache的类型，默认是JS对象缓存，可选localStorage，Cookie
     *         update : true, //强制更新标识，默认不强制更新
     *     }
     *    </code>
     * @static
     */
    getData : function(conf){
        var _this = this,
            _pr = parent || window,
            now = new Date().getTime();
        //得到缓存
        if(!conf.update && conf.cache){
            var d = this.locCache_get(conf.cache);
        }
        //如果缓存存在使用缓存
        if(d !== undefined){
            setTimeout(function(){
                conf.s(d.data);
            }, 200);
            _this.sendLog('intface', {url:conf.url, hits:true});//发送log
            return;
        }

        //如果缓存不存在重新取得
        conf.dataType = 'json';
        //正确的处理
        conf.success = function(o, s, x){
            if(o.status == 0){
                //缓存数据
                if(conf.cache && o.control && o.control.expires && o.control.expires > 0){
                    _this.locCache_set(conf.cache, o, o.control.expires, 'LS');//缓存类型需要修改（honglei）
                }
                //其他协议操作，比如清除缓存（honglei）

                //正常情况的处理
                if(typeof(conf.s) == 'function'){
                    conf.s(o.data, o.ext, o.status, o.message);
                }
            }else if(o.status == 999){
                //未登入的处理
                /*
                 _pr.$.mjs.alert("您还没有登录，请先登录",
                 function(){
                 _pr.location.href = "/account/login";
                 },
                 {
                 okText : "现在登录"
                 }
                 );
                 */
            }else{
                //错误code的处理
                if(typeof(conf.e) == 'function'){
                    conf.e(o.message || o.msg, o.ext, o.status);
                }else{
                    console.log(o.message || o.msg);
                }
            }
            _this.sendLog('intface', {url:conf.url, time:(new Date().getTime()-now)/1000, size:_this.cnStrlen(x.responseText)});//发送log
        };
        //错误的处理
        conf.error = function(x){
            if(typeof(conf.e) == 'function'){
                conf.e("数据加载失败，请重试！");
            }
            console.log(x);
            _this.sendLog('intface', {url:conf.url, time:(new Date().getTime()-now)/1000, ecode:x.status});//发送log
        }
        //发送请求
        $.ajax(conf);
    },
    /**
     * 返回顶部功能
     * @namespace $.mjs
     * @method goTop
     * @static
     */
    goTop : function(){
        window.scrollTo(0, 0);
    },
    /**
     * 得到URL中的变量
     * @namespace $.mjs
     * @method getUrlKV
     * @param {String} [key] 需要取得的URL中的key，不填将返回所有的值结合的对象
     * @param {String} [url=window.location.href] 带入的URL参数段，如果带入将不取window.location.href的值
     * @return {Object|String} 如果带如key参数则返回key对应的值，如果不带key参数，直接返回包含所有参数的对象
     * @static
     */
    getUrlKV : function(key, url){
        var kv = {},
            tmp;
        url = url || window.location.href;
        url = url.indexOf('#')>0 ? url.split('#')[1] : url.split('#')[0].split('?')[1];
        //参数部分不存在的判断
        if(url){
            url = url.split('&');
            for(i in url){
                if(url[i].indexOf('=') > 0){
                    tmp = url[i].split('=');
                    kv[tmp[0]] = tmp[1];
                }
            }
        }
        //根据参数返回相应的值
        if(!key){
            return kv;
        }else{
            return kv[key];
        }
    },
    /**
     * 模版运行方法（须扩展）
     * @namespace $.mjs
     * @method getTemplet
     * @param {String|Element} el 模版文本或则存储模版的节点，如果是
     * @param {Objcet} [o] 生成最终HTML代码所需的数据
     * @param {Boolean} [inner] 是否直接插入到页面中
     * @return {String} 当o存在时返回生成好的HTML代码，o不存在返回模版HTML代码
     * @static
     */
    getTemplet : function(el, o, inner){
        var mod;
        //得到模版
        if(typeof(el) != 'string'){
            mod = $(el).html().replace(/\n|    |<!--|\/\/-->/g, "");
        }else{
            mod = el;
            el = undefined;
        }
        //处理模版文件
        if(mod.indexOf('<:') >= 0){
            mod = "var t=[]; t.push('" +
                mod.replace(/[\r\t\n]/g, " ")
                    .split("<:").join("\t")
                    .replace(/((^|:>)[^\t]*)'/g, "$1\r")
                    .replace(/\t=(.*?):>/g, "',$1,'")
                    .split("\t").join("');")
                    .split(":>").join(";t.push('")
                    .split("\r").join("\\'")
                + "'); t=t.join('');";
        }
        //输出模版
        if(!o){
            return mod;
        }
        //运行模版
        eval(mod);
        //插入到页面中
        if(inner && el){
            el.html(t);
        }else{
            return t;
        }
    },
    /**
     * 显示或隐藏提示
     * @namespace $.mjs
     * @method tips
     * @param {String} text 需要显示的提示信息，如果为空则隐藏提示
     * @param {String} type 提示的类型，[err,ok,tip]
     * @since 0.8
     * @static
     */
    tips : function(text, type){
        var el = $('#tips');
        if(el && window.scrollY > el.offset().top){
            window.scrollTo(0, el.offset().top-10);
        }

        //没有提示节点时生成一个节点 (honglei)
        if(!text){
            el.html('');
            el.attr('class', '');
            return;
        }
        el.attr('class', 'tips-'+type);
        el.html(text);
        if(type == 'err'){
            el.animate('shake', 500);
        }
    }
    /**
     * 显示提示
     * @namespace $.mjs
     * @method pop
     * @param {String} text 需要显示的提示信息，如果为空则隐藏提示
     * @param {String} type 提示的类型，[err,ok,tip]
     * @deleted 0.8
     * @static
     */
}
    /*
     * Node相关的扩展
     *
     */
;(function($){
    $.extend($.fn, {
        /**
         * 按钮锁定
         * @method el.mt_btnLock
         * @param {Boolean} lock 是否锁定；默认为上锁，false为解锁
         * @since 0.8
         * @static
         */
        mt_btnLock: function(lock){
            var el = $(this);
            if(el.attr('tagName') == 'FORM'){
                el = el.find('button[type=submit], input[type=submit]');
            }
            if(lock == false){
                el.removeClass('btn-disable');
                el.removeAttr('disabled');
            }else{
                el.addClass('btn-disable');
                el.attr('disabled', true);
            }
        },
        /**
         * 表单验证
         * @method el.mt_checkForm
         * @returns {Boolean}
         * @since 0.8
         * @static
         */
        mt_checkForm: function(){
            var out = true;
            els = $(this).find('input, select, textarea');
            els.each(function(i){
                var reg = els.eq(i).attr('pattern');
                if(reg && !eval('/'+reg+'/ig').test(els.eq(i).val())){
                    $.mjs.tips(els.eq(i).attr('data-err'), 'err');
                    return out = false;
                }
            });
            if(out == true){
                $.mjs.tips();
            }
            return out;
        },
        /**
         * 通过AJAX提交表单
         * @method el.mt_submitForm
         * @param {Object} conf 回调方法
         *     <code>
         *     {
         *         s : function(o, e, s){}, //返回成功时的处理，o为接口data中的数据，e为接口ext中的数据， s为返回的状态值。
         *         e : function(o, e, s){}, //返回失败时的处理，o为接口message中的字符串，e为接口ext中的数据， s为返回的状态值。
         *     }
         *     </code>
         * @since 0.8
         */
        mt_submitForm: function(conf){
            conf = conf || {};
            var el = $(this);
            $.mjs.getData({
                url : el.attr('action'),
                type : el.attr('method'),
                data : el.serialize(),
                s : conf.s,
                e : conf.e
            });
        },
        /**
         * 节点删除效果
         * @method el.mt_delItem
         * @since 0.8
         * @static
         */
        mt_removeItem: function(){
            var el = $(this);
            el.remove();
        },
        /**
         * Tabs切换效果
         * @method el.mt_tabs
         * @param {Object} conf 可带入配置
         * 默认根据class来控制相关元素
         *     mj-tabs-hd 每个单项标题
         *     mj-tabs-item 每个单项内容
         * @static
         */
        mt_tabs: function(conf){
            var hd_els, item_els;
            //得到配置
            conf = conf || {};
            hd_els = conf.hd || $(this).find(".mj-tabs-hd");
            item_els = conf.bd || $(this).find(".mj-tabs-item");
            //初始化，选中的显示，未选中的隐藏
            hd_els.each(function(i){
                hd_els.eq(i).attr("data-tabsid", i);
                if(!hd_els.eq(i).hasClass("selected")){
                    item_els.eq(i).hide();
                }else{
                    item_els.eq(i).show();
                }
            });
            //监听hd的点击
            hd_els.on("click", function(e){
                e.preventDefault();
                var el = $(this);
                hd_els.removeClass("selected");
                el.addClass("selected");
                item_els.hide();
                item_els.eq(el.attr("data-tabsid")).show();
            });
        },
        /**
         * DropMenu切换效果
         * @method el.mt_dropMenu
         * @param {Object} conf 可带入配置
         * 默认根据class来控制相关元素
         *     mj-dropdown-hd 每个单项标题
         *     mj-dropdown-item 每个单项内容
         * @static
         */
        mt_dropMenu: function(conf){
            var hd_els, item_els;
            //得到配置
            conf = conf || {};
            hd_els = conf.hd || $(this).find(".mj-dropdown-hd");
            item_els = conf.bd || $(this).find(".mj-dropdown-item");

            $(this).on("click", ".mj-dropdown-hd", function(e){
                e.preventDefault();
                var item_els = _this.find(".mj-dropdown-item");
                if($(this).parent().hasClass("selected")){
                    $(this).parent().removeClass("selected");
                }else{
                    item_els.removeClass("selected");
                    $(this).parent().addClass("selected");
                }
                window.scrollTo(0, $(this).offset().top);
            });
        },
        /**
         * Input内容清空按钮
         * @method el.mt_inputClear
         * @static
         */
        mt_inputClear : function(){
            var _el = $(this),
                div_el = $('<div></div>'),
                btn_el = $('<span class="btn-close">×</span>');
            div_el.attr('class', _el.attr('class'));
            div_el.addClass('input-clear');
            _el.attr('class', '');
            div_el.insertAfter(_el);
            div_el.append(_el);
            div_el.append(btn_el);
            btn_el.on('click', function(){
                _el.val('');
                _el.focus();
            });
        },
        /**
         * 图片延迟加载
         * @method el.mt_lazyload
         * @since 0.9
         * @static
         * @author gongshouqiang
         */
        mt_lazyload : function(){
        },
        /**
         * Radio自定义效果
         * @method el.mt_diyRadio
         * @deleted 0.8
         */
        /**
         * Checkbox自定义效果
         * @method el.mt_diyCheckbox
         * @deleted 0.8
         */
        /**
         * 加载更多
         * @method el.mt_btnLock
         * @param {Object} conf 配置
         * {
         *     tmp : el,//模版
         *     list_el : el,内容区
         * }
         * @static
         */
        mt_moreloding: function(conf){
            var el = $(this),
                a_el = el.find('a');
            a_el.on('click', function(e){
                e.preventDefault();
                el.addClass('loading');
                $.mjs.getData({
                    url : $.mjs.getTemplet(a_el.attr('data-url'), a_el.data('page')),
                    s : function(o){
                        var list = $.mjs.getTemplet(conf.tmp, o.list);
                        conf.list_el.append(list);
                        if(o.hasNext){
                            el.removeClass('loading');
                            a_el.data('page', a_el.data('page')/1+1);
                        }else{
                            el.remove();
                        }
                    }
                });
            });
        }
    });

})(Zepto);
