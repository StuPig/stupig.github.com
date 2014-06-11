var MT = MT || {};
MT.msg = {
    /**
     * 弹出框节点
     * @property _el
     * @type Element|Null
     * @default null
     * @private
     */
    _el : null,
    /**
     * 遮盖层节点
     * @property _el_bg
     * @type Element|Null
     * @default null
     * @private
     */
    _el_bg : null,
    /**
     * 弹出框操作后的回调方法集
     * @property _fun
     * @type Objcet
     * @default {}
     * @private
     */
    _fun : {},
    /**
     * 是否点击后自动关闭
     * @property _auto_close
     * @type Boolean
     * @default true
     * @private
     */
    _auto_close : true,
    /**
     * CSS样式
     * @property _css
     * @type String
     * @default /css/
     * @private
     */
    _css : '.msg-bg{background:rgba(0,0,0,0.7);position:absolute;top:0;left:0;width:100%;z-index:998;}.msg-doc{position:fixed;width:270px;border-radius:4px;left:-9999px;margin-left:-135px;background:#fff;z-index:999;}.msg-doc .btn{font-size:16px;}.msg-doc .btn{padding:.6em 0;background:#2abea7;border:1px solid #00a188;color:#fff;}.msg-doc .btn:active{background:#1fa99d;border-color:#008579;}.msg-hd{background:#e6e6e6;color:#333;height:38px;line-height:38px;border-radius:4px 4px 0 0;border-bottom:1px solid #d2d2d2;font-size:17px;text-align:center;padding:0 10px;overflow:hidden;}.msg-bd{font-size:14px;padding:13px 15px;line-height:1.3em;color:#666;min-height:60px;}.msg-ft{text-align:center;padding:0 10px 18px;}.msg-confirm .msg-btn-ok{float:right;width:120px;}.msg-confirm .msg-btn-cancel{float:left;width:120px;}.msg-alert .msg-btn-ok{width:250px;}.msg-option{width:304px;margin-left:-152px;background:none;bottom:10px;}.msg-option div:first-child,.msg-option .msg-option-btns:first-child .btn:first-child{border-radius:4px 4px 0 0;border-top:0;}.msg-option .btn{width:304px;background:#fff;border:0;color:#2abea7;border-radius:0;}.msg-option .msg-bd{background:#fff;}.msg-option-btns .btn{border-top:1px solid #ccc;}.msg-option-btns .btn:last-child{border-radius:0 0 4px 4px;}.msg-option .msg-btn-cancel{line-height:44px;padding:0;margin-top:5px;color:#db6633;border-radius:4px;}.msg-option .btn:active{background:#dbdbdb;border-color:#ccc;}',
    /**
     * 创建弹出框方法
     * @namespace MT.msg
     * @method _create
     * @private
     */
    _create : function(){
        //插入CSS
        $('body').append('<style>'+ this._css +'</style>');
        //插入遮盖层
        this._el_bg = $('<div class="msg-bg"></div>');
        $('body').append(this._el_bg);
        //插入弹出层
        this._el = $('<div id="msg" class="msg-doc"></div>');
        $('body').append(this._el);

        //处理点击操作
        var _this = this;
        this._el.on('click', '.mj-close, button', function(e){
            var event = $(this).attr('data-event');
            if(event){
                e.preventDefault();
                if(typeof(_this._fun[event]) == 'function'){
                    _this._fun[event]();
                }
                if(_this._auto_close){
                    _this.close();
                }
            }
        });
    },
    /**
     * _内部方法，显示对话框并且定位
     * @namespace MT.msg
     * @method _show
     * @param {Object} conf 弹框配置
     * {
     *     content : '', //弹框内容
     *     title : '提示', //弹出框标题
     *     okText : '确定', //Ok按钮的文字
     *     okGE : 'a/b/c', //OK的gaevent值
     *     cancelText : '取消', //Cancel按钮的文字
     *     cancelGE : 'a/b/c', //Cancel的gaevent值
     *     closeRT : true, //是否显示右上角关闭按钮
     *     type : 'alert',//弹框类型
     *     autoClose : false //是否点击按钮后自动关闭
     * }
     * @static
     */
    _show : function(conf){
        conf = conf || {};
        //如果之前没有创建，就即时创建
        if(!this._el){
            this._create();
        }

        //自动关闭处理
        this._auto_close = conf.autoClose==undefined ? true : conf.autoClose;

        //组织代码
        if(conf.type == 'alert' || conf.type == 'confirm'){
            //处理ga值
            conf.okGE = conf.okGE || 'msg/ok';
            conf.cancelGE = conf.cancelGE || 'msg/cancel';

            var html = '';
            if(conf.title != undefined){
                html += '<div class="msg-hd">'
                    + conf.title
                    + (conf.closeRT === true ? '<a class="msg-close" gaevent="'+ conf.okGE +'" data-event="close" href="#">×</a>' : '')
                    + '</div>';
            }
            html += '<div class="msg-bd">' + conf.content + '</div>'
                + '<div class="msg-ft cf">'
                + '<button class="btn msg-btn-ok" gaevent="'+ conf.okGE +'" data-event="ok" type="button">'+(!conf.okText ? '确定' : conf.okText)+'</button>'
                + (conf.type == 'alert' ? '' : '<button class="btn msg-btn-cancel" gaevent="'+ conf.cancelGE +'" data-event="cancel" type="button">'+(!conf.cancelText ? '取消' : conf.cancelText)+'</button>')
                + '</div>';
        }else{
            var html = conf.content;
        }

        //遮盖部分的计算
        this._el_bg.css('left', '0');
        this._el_bg.css('height', Math.max($(window).height(), $(document).height())+'px');

        //输出内容
        this._el.html(html);
        this._el[0].className = 'msg-doc msg-'+ conf.type;

        //定位弹出框
        this._el.css('top', '');
        this._el.css('left', '50%');
        if(conf.type != 'option'){
            var top = Math.floor(($(window).height()-this._el.height())/2);
            this._el.css('top', top+'px');
        }

        //默认聚焦第一个按钮
        this._el.find('button').eq(0).focus();
    },
    /**
     * 关闭对话框
     * @namespace MT.msg
     * @method close
     * @static
     */
    close : function(){
        this._el.html('');
        this._el.css('left', '-9999px');
        this._el_bg.css('left', '-9999px');
    },
    /**
     * 自定义Alert
     * @namespace MT.msg
     * @method alert
     * @param {String} text 弹出框显示的文本内容
     * @param {Function} [ok_fun] 点击Ok后的处理方法，默认点击后会直接关闭对话框
     * @param {Object} [conf] 弹出框的配置
     *     {
     *         title : '提示', //弹出框标题
     *         okText : '确定', //OK按钮的文字
     *         okGE : 'a/b/c', //OK的gaevent值
     *         closeRT : true, //是否显示右上角关闭按钮
     *         autoClose : false //是否点击按钮后自动关闭
     *     }
     * @static
     */
    alert : function(text, ok_fun, conf){
        conf = conf || {};
        conf.type = 'alert';
        conf.content = text;
        this._fun = ok_fun ? {ok:ok_fun} : {};
        this._show(conf);
    },
    /**
     * 自定义Confirm
     * @namespace MT.msg
     * @method confirm
     * @param {String} text 弹出框显示的文本内容
     * @param {Object} [fun] 点击后的处理方法，默认点击后会直接关闭对话框
     *     {
     *         ok : function(){},
     *         cancel : function(){}
     *     }
     * @param {Object} [conf] 弹出框的配置
     *     {
     *         title : '提示', //弹出框标题
     *         okText : '确定', //Ok按钮的文字
     *         okGE : 'a/b/c', //OK的gaevent值
     *         cancelText : '取消', //Cancel按钮的文字
     *         cancelGE : 'a/b/c', //Cancel的gaevent值
     *         closeRT : true, //是否显示右上角关闭按钮
     *         autoClose : false //是否点击按钮后自动关闭
     *     }
     * @static
     */
    confirm : function(text, fun, conf){
        conf = conf || {};
        conf.type = 'confirm';
        conf.content = text;
        this._fun = fun || {};
        this._show(conf);
    },
    /**
     * 电话号码列表弹出框
     * @namespace MT.msg
     * @method phoneList
     * @param {Array} [phones] 电话号码列表
     *     [
     *         '010-88888888',
     *         13666666666,
     *         ......
     *     ]
     * @static
     */
    phoneList : function(phones){
        var btns = [],
            _this = this,
            cancel_fun = function(){
                _this.close();
            },
            conf = {
                cancelText : '关闭',
                autoClose : false
            };
        for(var i in phones){
            if(phones[i]){
                btns.push({
                    text : phones[i],
                    url : 'tel:'+phones[i],
                    ge : 'msg/btn_call_'+i
                });
            }
        };
        this.option(undefined, btns, cancel_fun, conf);
    },
    /**
     * 多按钮弹出框
     * @namespace MT.msg
     * @method option
     * @param {String} text 弹出框显示内容
     * @param {Array} [btns] 按钮组的配置
     *     [
     *         {
     *             text : '按钮名称', //按钮的名称
     *             url : '#', //按钮需要跳转的URL
     *             fun : function(){}, //点击按钮需要运行的方法
     *             cls : 'class', //按钮需要使用的特殊样式
     *             ge : 'a/b/c' //按钮的gaevent值
     *         },
     *         ...
     *     ]
     * @param {Function} [cancel_fun] 弹出框的配置
     * @param {Object} [option] 弹出框的配置
     *     {
     *         cancelText : '取消', //Cancel按钮的文字
     *         cancelGE : 'a/b/c', //Cancel的gaevent值
     *         autoClose : false //是否点击按钮后自动关闭
     *     }
     * @static
     */
    option : function(text, btns, cancel_fun, conf){
        conf = conf || {};
        conf.type = 'option';
        this._fun = cancel_fun ? {cancel:cancel_fun} : {};
        var html = '';
        html += text ? '<div class="msg-bd">'+ text +'</div>' : '';
        html += '<div class="msg-option-btns">';
        for(var i in btns){
            if(btns[i].text){
                if(btns[i].fun){
                    this._fun['btn_'+i] = btns[i].fun;
                }
                var ge = btns[i].ge || 'msg/btn_'+i;
                if(btns[i].url){
                    html += '<a class="btn msg-btn'+(btns[i].cls ? ' '+btns[i].cls : '')+'" gaevent="'+ ge +'" data-event="btn_'+i+'" href="'+btns[i].url+'">'+btns[i].text+'</a>';
                }else{
                    html += '<button class="btn msg-btn'+(btns[i].cls ? ' '+btns[i].cls : '')+'" gaevent="'+ ge +'" data-event="btn_'+i+'" type="button">'+btns[i].text+'</button>';
                }
            }
        }
        html += '</div>';
        html += '<button class="btn msg-btn-cancel" gaevent="'+ conf.cancelGE +'" data-event="cancel" type="button">'+(!conf.cancelText ? '取消' : conf.cancelText)+'</button>';
        conf.content = html;
        this._show(conf);
    },
    /**
     * 自定义弹框
     * @namespace MT.msg
     * @method diy
     * @param {String|Element} html 弹出框显示内容
     * @param {Object} [fun] 弹出框的配置
     *     {
     *         fun : function(){},
     *         ...
     *     }
     * @static
     */
    diy : function(html, fun){
        var conf = {content:html};
        this._fun = fun || {};
        this._show(conf);
    }
}
