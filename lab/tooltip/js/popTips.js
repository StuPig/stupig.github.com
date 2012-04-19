/**
 * 随外部容器改变样式的弹窗提示
 * 接收参数:
 * {
 * tmplObj : jQuery对象，要添加的html模板对象
 * targetObj ：jQuery对象，要为哪个容器添加
 * cssObj : JSON对象，详见注释
 * }
 */
 (function($) {
    var root = this;

    var gTips = function(options) {
        return new Gtips(options);
    }

    var defaults = {
            'tmplObj' : null,
            'targetObj' : $(document.body),
            'cssObj' : {
                    'arrowSize' : 8,                // 箭头的尺寸或者说高度
                    'arrowPos' : 10,                // 箭头偏移量
                    // 箭头class的前缀
                    'preArrowClassB' : 'gary-arrow-b-',
                    'preArrowClassP' : 'gary-arrow-p-',
                    'conClass' : 'gary-con',
                    'outerConClass' : 'gary-outercon'               // 外框的class, 可自定义，用来修改外框样式，外框的border background等样式与箭头绑定，可传入
                }
        },
        ERR_MESSAGE = '您给的容器高度和宽度等数据有问题，请重设!\r\nPS: 如果您知道提示框高宽的话，容器高或宽应至少为提示框的两倍-。-';
    /*
     * 提示的构造函数
     */
    function Gtips(options) {
        $.extend(this, defaults, options);
        this._init();
    }
    /*
     * 提示的静态方法
     */
    /*
    $.extend(Gtips, {

    });
    */

    /*
     * 提示的实例方法
     */
     $.extend(Gtips.prototype, {
        /*
         * 初始化方法
         */
        _init : function() {
            this.buildTipContainer();               // 返回容器（jQuery对象）, this.conObj
            // TODO 将tmplObj放入外框中，构建mainContainer,将外框和箭头放入mainContainer
            this.tmplObj.appendTo(this.outerCon);
            this.conObj.appendTo(this.targetObj);
            // 确定tips的位置
            this.setTipsPos();
            this.cssObj.arrowClassP = this.cssObj.preArrowClassP + this.position[0];
            this.cssObj.arrowClassB = this.cssObj.preArrowClassB + this.position[0];
            this.buildArrow({
                                    'arrowP' : this.cssObj.arrowClassP,
                                    'arrowB' : this.cssObj.arrowClassB
                            });             // 构建箭头，传入箭头class信息
            this.setLayout();
            this.conObj.show();
            this.arrowObj.show();
            // 重置数据
            this.position = [];
        },
        /*
         * 构建提示容器
         */
         buildTipContainer : function() {
            var data = [{
                    'container' : this.cssObj.conClass,
                    'outerCon' : this.cssObj.outerConClass
                }];
            this.conObj = $(PTtmpl.containerStr).tmpl(data);
            this.outerCon = this.conObj.find('.' + this.cssObj.outerConClass);
         },
         /*
         * 构建箭头
         */
         buildArrow : function(data) {
            this.arrowObj = $(PTtmpl.arrowStr).tmpl(data);
         },
         /*
          * 设置弹窗提示的位置
          */
        setTipsPos : function() {
            var tarLeft = this.targetObj.offset().left,
                tarTop = this.targetObj.offset().top,
                tarHeight = this.targetObj.outerHeight(),
                tarWidth = this.targetObj.outerWidth(),
                conHeight = this.conObj.height(),
                conWidth = this.conObj.width(),
                // 箭头偏移量
                arrOffset = this.cssObj.arrowPos + this.cssObj.arrowSize,
                // 鼠标距左侧距离(left)
                mLeft = this.e.pageX,
                // 鼠标距顶部距离（top）
                mTop = this.e.pageY,
                // 鼠标距顶部边框
                top = mTop - tarTop,
                // 鼠标距离右侧边框
                right = tarWidth + tarLeft - mLeft,
                // 鼠标距离左侧边框
                left = mLeft - tarLeft,
                // 鼠标距底部边框
                bottom = tarHeight + tarTop - mTop;

            // 先隐藏掉conObj
            this.conObj.hide();
            if (this.arrowObj) this.arrowObj.hide();

            /*
             * 先判断目标容器的高度或者宽度是否是容器对应高度或宽度与箭头尺寸之和的两倍，(tarHeight > conHeight && tarWidth > 2*(conWidth + arrowSize) )|| (tarWidth > conWidth && tarHeight > 2*( conHeight + arrowSize)), 否则，报错。之所以是2倍，因为临界点是目标容器的各个边的中点。
             */

            if (!((tarHeight > conHeight && (tarWidth > 2*(conWidth + this.cssObj.arrowSize))) || (tarWidth > conWidth && (tarHeight > 2*(conHeight + this.cssObj.arrowSize))))) {
                alert(ERR_MESSAGE);
                return false;
            }

            /*
             * 思路是，先检测左侧，再检测右侧，左右都放不下，则检测顶部，都排除，再考虑底部。检测左右侧时，先考虑顶部能否放下；检测上下时，先考虑据左右侧那边的距离大。
             * 1.检测左侧时，判断上下距离能否放下箭头偏移量,有一个不能放下（例如top），则为['top', 'left']，右侧一样
             * 2.检测上下时，判断左右距离能否放下箭头偏移量（缺省为上,即top），有一侧不能放下，即为鼠标偏向的一侧（若left<right，则left），则为['top', 'left']，此时箭头偏移量为0，随鼠标移动,鼠标left增大，则增大，最大至偏移量。
             * 缺省是左侧，顶部。
             */
            // 箭头指向左侧
            /*
             * 如果right大于容器宽度时
             * 1.当右侧足够大，且上下足够大时，可以放下容器和箭头尺寸时, 若top > 偏移量，['left', 'top']，否则['left', 'bottom'],且上下的距离大于容器高度时
             * 2.当右侧（right）小于容器宽度与箭头尺寸时（上例的反例else）, 若bottom > 容器高度加上箭头尺寸，['top', 'left'], 否则['bottom','left']
             */
            if (right > conWidth) {
                if (right > (conWidth + this.cssObj.arrowSize)) {
                    if ( (top > arrOffset) && ((top +conHeight - arrOffset) < tarHeight)) {
                        this.position = ['left', 'top'];
                    } else if ((top > conHeight) && (bottom > arrOffset)) {
                        this.position = ['left', 'bottom'];
                    } else if ( bottom > (conWidth + this.cssObj.arrowSize)){
                        this.position = ['top', 'left'];
                    } else {
                        this.position = ['bottom', 'left'];
                    }
                } else {
                    if (bottom > (conHeight + this.cssObj.arrowSize)) {
                        this.position = ['top', 'left'];
                    } else {
                        this.position = ['bottom', 'left'];
                    }
                }
            }
            /*
             * 如果左侧大于容器宽度
             * 1.当左侧足够大，且上下足够大时，可以放下容器和箭头尺寸时, 若top > 偏移量，['right', 'top']，否则['right', 'bottom']
             * 2.当左侧（right）小于容器宽度与箭头尺寸时（上例的反例else）, 若bottom > 容器高度加上箭头尺寸，['top', 'right'], 否则['bottom','right']
             */
            else if ( left > conWidth ) {
                if (left > (conWidth + this.cssObj.arrowSize) ) {
                    // 高度要大于arrOffset并与conHeight之和减去arrOffset之差小于tarHeight，因为必须要在目标容器内
                    if ((top > arrOffset) && ((top + conHeight - arrOffset) < tarHeight)) {
                        this.position = ['right', 'top'];
                    } else if ((top > conHeight) && (bottom > arrOffset)){
                        this.position = ['right', 'bottom'];
                    } else if (bottom > arrOffset) {
                        this.position = ['top', 'right'];
                    } else {
                        this.position = ['bottom', 'right'];
                    }
                } else {
                    if (bottom > (conHeight + this.cssObj.arrowSize)) {
                        this.position = ['top', 'right'];
                    } else {
                        this.position = ['bottom', 'right'];
                    }
                }
            }
            /*
             * 左侧和右侧均无法盛下容器时,判断top,比较鼠标距左（left）右(right)哪边更近
             * 1. 如果底部bottom，大于容器高度和箭头尺寸，则为top, 否则为bottom
             * 2. 再判断左右，left与right
             */
            else if (bottom > conHeight) {
                if (bottom > (conHeight + this.cssObj.arrowSize)) {
                    if ( left > right ) {
                        this.position = ['top', 'right'];
                    } else {
                        this.position = ['top', 'left'];
                    }
                } else if ( top > (conHeight + this.cssObj.arrowSize )) {
                    if ( left > right ) {
                        this.position = ['bottom', 'right'];
                    } else {
                        this.position = ['bottom', 'left'];
                    }
                } else {
                    alert(ERR_MESSAGE);
                    return false;
                }
            }
            /*
             * 左侧和右侧均无法盛下容器时，最后判断bottom,比较鼠标距左（left）右(right)哪边更近
             * 1. 如果底部top大于容器高度和箭头尺寸，则为bottom, 否则为top
             * 2. 再判断左右，left与right
             */
            else if (top > conHeight) {
                if ( top > (conHeight + this.cssObj.arrowSize)) {
                    if ( left > right ) {
                        this.position = ['bottom', 'right'];
                    } else {
                        this.position = ['bottom', 'left'];
                    }
                } else if(bottom > (conHeight + this.cssObj.arrowSize)){
                    if ( left > right ) {
                        this.position = ['top', 'right'];
                    } else {
                        this.position = ['top', 'left'];
                    }
                } else {
                    alert( ERR_MESSAGE );
                    return false;
                }
            } else {
                alert( ERR_MESSAGE );
                return false;
            }
            this.setConPos();
        },
        /*
         * 设置容器position
         */
        setConPos : function() {
            var pos = this.position.join('-'),
                tarLeft = this.targetObj.offset().left,
                tarTop = this.targetObj.offset().top,
                tarHeight = this.targetObj.outerHeight(),
                tarWidth = this.targetObj.outerWidth(),
                conHeight = this.conObj.height(),
                conWidth = this.conObj.width(),
                // 箭头偏移量
                arrOffset = this.cssObj.arrowPos + this.cssObj.arrowSize,
                // 鼠标距左侧距离(left)
                mLeft = this.e.pageX,
                // 鼠标距顶部距离（top）
                mTop = this.e.pageY,
                // 鼠标距顶部边框
                top = mTop - tarTop,
                // 鼠标距离右侧边框
                right = tarWidth + tarLeft - mLeft,
                // 鼠标距离左侧边框
                left = mLeft - tarLeft,
                // 鼠标距底部边框
                bottom = tarHeight + tarTop - mTop,
                arrowSize = this.cssObj.arrowSize,
                arrowPos = this.cssObj.arrowPos;

            switch(pos) {
                case 'left-bottom' :
                    this.conObj.css({
                        // left + 箭头高度
                        'left' : left + tarLeft,
                        // 容器的top：目标容器高度，减去，（（当前bottom - 箭头偏移量 ） ，再加上自身高度）
                        'top' : tarHeight - (bottom - arrOffset) - conHeight + tarTop
                    });
                    break;
                case 'right-top' :
                    this.conObj.css({
                        // left 减去箭头高度，减去自身宽度
                        'left' : left - arrowSize - conWidth + tarLeft,
                        // top减去箭头偏移量
                        'top' : top - arrOffset + tarTop
                    });
                    break;
                case 'right-bottom' :
                    this.conObj.css({
                        'left' : left - arrowSize - conWidth + tarLeft,
                        'top' : tarHeight - (bottom - arrOffset) - conHeight + tarTop
                    });
                    break;
                case 'top-left' :
                    // top 加上 箭头尺寸
                    this.conObj.css('top', top + tarTop);
                    // 判断left距离
                    if ( left < arrOffset ) {
                        // 紧贴左边
                        this.conObj.css('left', tarLeft);
                    } else if (right < (conWidth - arrOffset)) {                // 如果right,撑不下自身在右边的距离（conWidth - arrOffset）,则left值减小，箭头跟随鼠标，使自己右边与容器对齐
                        // 正常显示的left, 减去右侧还需要的宽度((conWidth - arrOffset) - right ), left - arrOffset - ((conWidth - arrOffset) - right ),得出tarWidth - conWidth
                        // 换种思路，紧贴右边，即左边距离为，目标容器宽度减去自身宽度
                        this.conObj.css('left', tarWidth - conWidth + tarLeft);
                    } else {                // 正常显示的left
                        this.conObj.css('left', left - arrOffset + tarLeft);
                    }
                    break;
                case 'top-right' :
                    this.conObj.css('top', top + tarTop);
                    // 判断right
                    if (right < arrOffset) {
                        // 紧贴右边
                        this.conObj.css('left', tarWidth - conWidth + tarLeft);
                    } else if (left < (conWidth - arrOffset)) {
                        // 紧贴左边
                        this.conObj.css('left', tarLeft);
                    } else {
                        this.conObj.css('left', left - (conWidth - arrOffset) + tarLeft);
                    }
                    break;
                case 'bottom-left' :
                    // top 减去 箭头尺寸, 再减去conHeight
                    this.conObj.css('top', top - arrowSize - conHeight + tarTop);
                    if (left < arrOffset) {
                        // 紧贴左边
                        this.conObj.css('left', tarLeft);
                    } else if (right < (conWidth - arrOffset)) {
                        // 紧贴右边
                        this.conObj.css('left', tarWidth - conWidth + tarLeft );
                    } else {
                        this.conObj.css('left', left - arrOffset + tarLeft);
                    }
                    break;
                case 'bottom-right' :
                    // 因为箭头要从后边插入，故top就是 鼠标距顶部距离减去自身高度
                    this.conObj.css('top', top - arrowSize - conHeight + tarTop);
                    // 判断right
                    if (right < arrOffset) {
                        // 紧贴右边
                        this.conObj.css('left', tarWidth - conWidth + tarLeft);
                    } else if (left < (conWidth - arrOffset)) {
                        // 紧贴左边
                        this.conObj.css('left', tarLeft);
                    } else {
                        this.conObj.css('left', left - (conWidth - arrOffset) + tarLeft );
                    }
                    break;
                // 缺省为left-top
                default:
                    this.conObj.css({
                        // left + 箭头高度
                        'left' : left + tarLeft,
                        // 容器的top：top 减去 箭头偏移量
                        'top' : top - arrOffset + tarTop
                    });
                    break;
            }
        },
        /*
         * 设置外观样式
         */
        setLayout : function() {

            var conHeight = this.conObj.height(),
                conWidth = this.conObj.width(),
                arrTop = this.cssObj.arrowPos,
                arrBottom = conHeight - 2*this.cssObj.arrowSize - this.cssObj.arrowPos,
                arrLeft = this.cssObj.arrowPos,
                arrRight = conWidth - 2*this.cssObj.arrowSize - this.cssObj.arrowPos,
                tarLeft = this.targetObj.offset().left,
                tarTop = this.targetObj.offset().top,
                tarHeight = this.targetObj.outerHeight(),
                tarWidth = this.targetObj.outerWidth(),
                conLeft = this.conObj.offset().left,
                conTop = this.conObj.offset().top,
                // 箭头尺寸
                arrowSize = this.cssObj.arrowSize,
                arrowPos = this.cssObj.arrowPos,
                arrOffset = arrowPos + arrowSize,
                mLeft = this.e.pageX,
                mTop = this.e.pageY,
                // 鼠标距顶部边框
                top = mTop - tarTop,
                // 鼠标距离右侧边框
                right = tarWidth + tarLeft - mLeft,
                // 鼠标距离左侧边框
                left = mLeft - tarLeft,
                // 鼠标距底部边框
                bottom = tarHeight + tarTop - mTop;

            switch(this.position.join('-')) {
                case 'left-bottom' :
                    this.arrowObj.prependTo(this.conObj);
                    this.arrowObj.css('float', this.position[0]);
                    this.outerCon.css('float', this.position[0]);
                    // 鼠标距顶框距离
                    if ((bottom - arrowSize) > arrowPos) {
                        this.arrowObj.css('top', arrBottom);
                    } else {
                        this.arrowObj.css('top', conHeight - (bottom - arrOffset));
                    }
                    break;
                case 'right-top' :
                    this.arrowObj.prependTo(this.conObj);
                    this.arrowObj.css('float', this.position[0]);
                    this.outerCon.css('float', this.position[0]);
                    // top
                    this.arrowObj.css('top', arrowPos);
                    break;
                case 'right-bottom' :
                    this.arrowObj.prependTo(this.conObj);
                    this.arrowObj.css('float', this.position[0]);
                    this.outerCon.css('float', this.position[0]);
                    // top
                    if ((bottom - arrowSize) > arrowPos) {
                        this.arrowObj.css('top', arrBottom);
                    } else {
                        this.arrowObj.css('top', conHeight - (bottom - arrOffset));
                    }
                    break;
                case 'top-left' :
                    this.arrowObj.prependTo(this.conObj);
                    // 如果con紧贴右边,此时，箭头随鼠标移动
                    if (conLeft === 0 && (conWidth > (right + arrOffset))) {
                        this.arrowObj.css('left', conWidth - right - arrowPos);
                    } else {
                        this.arrowObj.css('left', arrowPos);
                    }
                    break;
                case 'top-right' :
                    this.arrowObj.prependTo(this.conObj);
                    // 如果con紧贴左边,此时，箭头随鼠标移动
                    if (conLeft === 0 && (left + arrOffset < conWidth)) {
                        this.arrowObj.css('left', left - arrowPos);
                    } else if ((left + arrOffset) > conWidth) {
                        this.arrowObj.css('left', arrRight);
                    } else {
                        this.arrowObj.css('left', conWidth - arrowPos);
                    }
                    break;
                case 'bottom-left' :
                    // 将箭头插入到容器后端
                    this.arrowObj.appendTo(this.conObj);
                    // 如果con紧贴右边,此时，箭头随鼠标移动, 此时，鼠标应在con内部，即left 大于con到左边框的距离,并且小于tarWidth - 箭头偏移量
                    if ((left > (tarWidth - conWidth)) && ((right + arrOffset) < conWidth)) {
                        this.arrowObj.css('left', left - (tarWidth - conWidth) - arrowSize);
                    } else {
                        this.arrowObj.css('left', arrowPos);
                    }
                    break;
                case 'bottom-right' :
                    this.arrowObj.appendTo(this.conObj);
                    // 如果con紧贴左边,此时，箭头随鼠标移动
                    if (left < (conWidth - arrOffset)) {
                        this.arrowObj.css('left', left - arrowSize);
                    } else {
                        this.arrowObj.css('left', arrRight );
                    }
                    break;
                // 缺省为left-top
                default:
                    this.arrowObj.prependTo(this.conObj);
                    this.arrowObj.css('float', this.position[0]);
                    this.outerCon.css('float', this.position[0]);
                    // top
                    this.arrowObj.css('top', arrowPos);
                    break;
            }
         },
         /*
          * 删除节点
          */
         remove: function() {
            this.conObj.remove();
            this.arrowObj.remove();
         }
     });

    if ('undefined' !== typeof module && module.exports) {
        module.exports = gTips;
    } else {
        root.gTips = gTips;
    }
 })(jQuery)