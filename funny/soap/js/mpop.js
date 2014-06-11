var MT = MT || {};
MT.pop = {
    /**
     * 下部提示条节点
     * @property _el
     * @type Element|Null
     * @default null
     * @private
     */
    _el : null,
    /**
     * 下部提示条内容节点
     * @property _el_cont
     * @type Element|Null
     * @default null
     * @private
     */
    _el_cont : null,
    /**
     * 下部提示条主要节点
     * @property _el_main
     * @type Element|Null
     * @default null
     * @private
     */
    _el_main : null,
    /**
     * 过期时间
     * @property _exp
     * @type Object
     * @default null
     * @private
     */
    _exp : null,
    /**
     * 配置
     * @property _conf
     * @type Object
     * @default {priority:0}
     * @private
     */
    _conf : {priority:0},
    /**
     * 下部提示条样式
     * @property _css
     * @type String
     * @default ［css］
     * @private
     */
    _css : '.pop{height:75px;display:none;}.pop-content{z-index:99;background:rgba(0,0,0,0.7);position:fixed;bottom:0;width:100%;height:65px;padding-top:10px;overflow:hidden;}.pop-close{font-size:2em;width:2em;height:2em;border-radius:2em;-webkit-transform:rotate(45deg);-moz-transform:rotate(45deg);text-align:center;line-height:3.1em;top:-1em;right:-1em;position:absolute;background:#828282;color:#fff;z-index:1;cursor:pointer;}',
    /**
     * 创建下部提示条
     * @namespace MT.pop
     * @method _create
     * @private
     */
    _create : function(conf){
        //如果节点已经存在
        if(this._el != null){
            return;
        }

        //插入CSS
        this.addCss(this._css);

        //通过ID得到节点
        this._el = $('#pop');

        //创建节点
        if(this._el.size() == 0){
            var _this = this;
            //插入层
            this._el = $('<div id="pop" class="pop"><div class="pop-content"><div class="pop-main"></div><em class="pop-close" gaevent="' + conf.closeGE + '">＋</em></div></div>');
            $('body').append(this._el);

            this._el.on('click', '.pop-close', function(){
                _this.close();
            });
        }

        //得到节点
        this._el_cont = this._el.find('div.pop-content').eq(0);
        this._el_main = this._el.find('div.pop-main').eq(0);

        //得到所有提示过期时间的信息
        this._getExp();
    },
    _getExp : function(){
        if(this._exp != null){
            return;
        }
        var exp = document.cookie.match(new RegExp("(^| )m_popexp=([^;]*)(;|$)"));
        if(exp){
            exp = JSON.parse(exp[2]);
            var now = new Date().getTime();
            for(var k in exp){
                if(exp[k] < now){
                    delete exp[k];
                }
            }
            this._exp = exp;
            this._setExp();
        }else{
            this._exp = {};
        }
    },
    _setExp : function(id, e){
        if(id){
            e = e<100000000 ? new Date().getTime()+e*1000 : e;
            this._exp[id] = e;
        }
        document.cookie = 'm_popexp='+ JSON.stringify(this._exp) +';expires='+ (new Date().getTime()+2592000000 +';path=/');
    },
    addCss : function(css){
        $('head').append('<style>'+ css +'</style>');
    },
    /**
     * 关闭下部提示条
     * @namespace MT.pop
     * @method close
     * @param {String} id 需要查询的ID
     * @public
     */
    isShow : function(id){
        this._getExp();
        if(!this._exp[id]){
            return true;
        }else{
            return false;
        }
    },
    /**
     * 显示下部提示条
     * @namespace MT.pop
     * @method show
     * @param {String} html 要显示的内容
     * @param {String} [conf] 配置
     *  {
     *      cls : 'class', //样式
     *      id : 'down', //ID，显示一次的提示识别之用，不会更改html中的ID
     *      priority : 10, //优先级，如果优先级小于现在展现的提示框将不展现，优先级不可大于9999
     *      exp : 60*60*24, //过期时间，用于只显示一次的提示，小于100000000时是需要缓存的秒数，反之是过期时间的时间戳，空为每次都弹出
     *      closeTime : 10, //自动关闭时间
     *  }
     * @public
     */
    show : function(html, conf){
        conf = conf || {};
        if (!conf.closeGE) {
            conf.closeGE = "imt/pop/close";
        }

        //得到相关节点
        this._create(conf);

        //判断是否要显示
        if((conf.priority && conf.priority/1 < this._conf.priority/1) || (conf.id && !this.isShow(conf.id))){
            return false;
        }

        var _this = this;

        //写入新配置
        this._conf = conf;

        //更新Class
        this._el_cont.attr('class', 'pop-content');
        if(conf.cls){
            this._el_cont.addClass(conf.cls);
        }

        //插入内容
        _this._el_main.html(html);

        //显示提示条
        _this._el.css('display', 'block');

        //自动关闭
        if(conf.closeTime){
            setTimeout(function(){
                _this.close();
            }, conf.closeTime);
        }
    },
    /**
     * 关闭下部提示条
     * @namespace MT.pop
     * @method close
     * @public
     */
    close : function(){
        //隐藏提示条
        this._el.css('display', 'none');

        //如果有id和exp写入cookie
        this._setExp(this._conf.id, this._conf.exp);

        //清空配置
        this._conf = {priority:0};
    }
}
