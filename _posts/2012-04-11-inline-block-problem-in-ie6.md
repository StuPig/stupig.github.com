---
layout: post
title: "探讨ie6下inline-block问题"
description: "探讨ie6下inline-block问题"
category: tech
tags:
 - ie6
 - inline-block
 - html
 - css
 - hack
keywords: ie6,inline-block,显示问题
---
之前一直有论调说“ie6不支持inline-block”，

对于这种类似的论调，技术人员还是应该保持一份求真务实的态度，
不可惘信，我一直推荐的也是我尽量一直在践行的都是去写个简单的demo，
去除依赖，单独的去测一个具体功能，这是种很笨，却是最有效的方式
尤其是对于像我这种经验欠缺的菜鸟来说。
要知道，前端本身就是一个非常经验的工作，碰到问题，与其去纠结，
倒不如写个demo验证猜想来的实在。
> 手比头高，光说不练假把势

ie6并非不支持，只是支持的不完全，换言之，
支持的有问题。
之前做项目碰到过ie6下inline-block的问题，记得当时的结论是，
尽量用div去实现inline-block，而不要用span，
今天有求证了当时跟我一起做项目的兄弟，发现其实是当时我是“在span标签里（span设置成inline-block）套div”，产生的问题，倒非ie6的inline-block问题，
没办法，哥很笨，记得当时被同事嘲笑的体无完肤

今天徒弟问我ie6下的inline-block问题，于是我果断测试了一下：
{% highlight html linenos %}
<style>
.d {
    height: 50px;
    width: 50px;
    border: 1px solid red;
    /* div 需要设置成display:inline 同时设置zoom:1来出发haslayout来模拟inline-block */
    *display: inline;
    zoom: 1;
}
.s {
    /* ie6 天然支持span的inline-block */
    display: inline-block;
    height: 50px;
    width: 50px;
    border: 1px solid red;
}
</style>
<div class="d">div0</div>
<div class="d">div1</div>
<hr >
<span class="s">span0</span>
<span class="s">span1</span>
{% endhighlight %}

关于此，[W3Help][W3Help]中如此描述:
> IE6 IE7 IE8(Q) 中，'display:inline-block' 特性值含义与 CSS 2.1 规范描述不同。对照 MSDN 描述以及 CSS 1、CSS 2 历史规范，'display:inline-block' 最初由 IE 5.5 开始支持，直至 CSS 2.1 规范中才加入了此特性值。因此在这些古老版本 IE 浏览器中，'display:inline-block' 特性值设置不能将块元素转变为行内块，他的作用为触发 IE 的 hasLayout 特性，使元素拥有布局特性。
如果将他用在行内元素上，可以使行内元素拥有布局，以便使宽高等无法作用在行内元素上的样式特性生效。对于块元素，他仅触发了布局特性，还要将块元素的 'display' 特性值设定为 'inline' 才可以获得类似规范描述的 'inline-block' 布局效果。

至于需要用到inline-block时，是采用span还是div模拟，
个人更倾向于根据实际情况，或者说是根据语义性。
比方说，该节点内包含的节点为块级元素，则采用div模拟(不要重蹈我当时的覆辙).
如果只是文字等行内元素，
则采用行内标签设置inline-block

[W3Help]: http://w3help.org/zh-cn/
