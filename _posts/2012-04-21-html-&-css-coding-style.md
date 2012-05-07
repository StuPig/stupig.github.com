---
layout: post
title: "html/css coding style[hacker news上看到]"
description: "html和css的coding style"
category: tech
tags:
 - html
 - html5
 - css
 - css3
 - coding style
keywords: 编码规范,html/css
---
原文地址：[My HTML/CSS coding style](http://csswizardry.com/2012/04/my-html-css-coding-style/)

作者是Harry Roberts，英国21岁少年，但已经是Senior UI Developer，再次让俺自惭形秽了……

作者主要分享了自己对于`html`/`css`编码的一些经验，和技巧。对没错，是技巧，我认为编码风格本身就是一种技巧，而不仅仅是好看，更多的体现在 _可读_ 和 _可维护_ 上。

---
###html###

####留白####
`html`代码中的留白，可以有效松散的去区分不同功能和代码区块。根据在浏览器中渲染后所呈现出来的形式，将代码利用留白进行分类组合，以达到提高代码的 语义性 和 可视化 的目的:

{% highlight html %}
<dl>

    <dt>Lorem</dt>
    <dd>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.</dt>

    <dt>Ipsum</dt>
    <dd>Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.</dt>

    <dt>Dolor</dt>
    <dd>Morbi in sem quis dui placerat ornare. Pellentesque odio nisi euismod in pharetra.</dt>

</dl>


<div class=promo>

    <p><strong>Pellentesque habitant morbi tristique</strong> senectus et netus et malesuada fames ac turpis egestas.</p>
    <a href=# class=btn>Lorem</a>

</div>
{% endhighlight %}
####闭合标签后加入注释####
在大段的`html`代码的闭合标签之后，加入注释：
{% highlight html %}
<div class=content>

    ...

    <div class=carousel>
    ...
    div><!-- /carousel -->

    ...

</div><!-- /content -->
{% endhighlight %}

###css###
####内容索引表####
在`css`文件顶部，建立内容区块索引表，样式如下：
{% highlight css %}
/*------------------------------------*\
    CONTENTS
\*------------------------------------*/
/*
NOTES
RESET
SHARED     Share anything we can across elements.
MAIN       HTML, BODY, etc.
*/
{% endhighlight %}
####区块名称####
在每个区块顶部，建立区块名称，样式如下：
{% highlight css %}
/*------------------------------------*\
    $MAIN
\*------------------------------------*/
{% endhighlight %}
将区块的名称加前缀`$`，这样当我们维护`css`文件时，想要找到区块main的位置，可以查找$MAIN，从而规避掉很多无效信息。

同时在每个区块之间，留白5行，以更方面我们滑动滚轮时阅读代码
{% highlight css %}
/*------------------------------------*\
    $MAIN
\*------------------------------------*/





/*------------------------------------*\
    $TYPE
\*------------------------------------*/
{% endhighlight %}
####区块公用样式####
根据标签归类，样式如下:
{% highlight css %}
a,.brand,h1,h2,h3,h4,h5,h6{
    color:#BADA55;
}
h1,h2,h3,h4,h5,h6,
ul,ol,dl,
p,
table,
form,
pre,
hr{
    margin-bottom:24px;
    margin-bottom:1.5rem;
}
{% endhighlight %}
####浏览器前缀####
将`css3`中需要浏览器前缀的样式，按列对齐，这样可以直观反映已经定义了哪写特性前缀：
{% highlight css %}
.island{
    padding:1.5em;
    margin-bottom:1.5em;
    -webkit-border-radius:4px;
       -moz-border-radius:4px;
            border-radius:4px;
}
{% endhighlight %}
####缩进####
根据`html`代码层级进行缩进（这个有点儿烦啊，不过看似有效），假设有如下`html`片段：
{% highlight html %}
<div class=carousel>

    <ul class=panes>

        <li class=pane>

            <h2 class=pane-title>Lorem</h2>

        </li><!-- /pane -->

        <li class=pane>

            <h2 class=pane-title>Ipsum</h2>

        </li><!-- /pane -->

        <li class=pane>

            <h2 class=pane-title>Dolor</h2>

        </li><!-- /pane -->

    </ul><!-- /panes -->

</div><!-- /carousel -->
{% endhighlight %}
那么，与他对应的css写成这样比较好：
{% highlight css %}
/*------------------------------------*\
    $CAROUSEL
\*------------------------------------*/
.carousel{
    [styles]
}

    .panes{
        [styles]
    }

        .pane{
            [styles]
        }

            .pane-title{
                [styles]
            }
{% endhighlight %}
这样做的好处是清晰明了，当我阅读`css`代码时，旁边不需要再跟着个`html`查看
####css中内嵌html####
做完了上一步，已经很好了，但是如果在`css`中嵌入适当的`html`的话，将更能提高它的可读性
{% highlight css %}
/*------------------------------------*\
    $TOOLTIPS
\*------------------------------------*/
/*
<small class=tooltip><span>Lorem ipsum dolor</span></small>
*/
.tooltip{
    [styles]
}
    .tooltip > span{
        [styles]
    }
{% endhighlight %}

---
以上仅供参考，我也只是摘录了对我有用的部分。
