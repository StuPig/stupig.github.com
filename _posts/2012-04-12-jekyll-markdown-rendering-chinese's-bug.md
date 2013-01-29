---
layout: post
title: "jekyll markdown rendering chinese's bug"
description: "jekyll的markdown引擎的展现中文的bug和hack方法"
category: tech
tags:
 - bug
 - markdown
 - jekyll
 - syntax
keywords:
 - jekyll
 - markdown引擎
 - 中文
 - 展现
 - bug
---
在写上一篇日志《[鄙视“问题”乞讨者--探讨提问的艺术](http://stupig.me/blog/2012/04/12/despise-mindless-guys/)》时，偶然发现了个`jekyll`的`markdown`引擎展现中文的bug。

在上《[鄙视“问题”乞讨者--探讨提问的艺术](http://stupig.me/blog/2012/04/12/despise-mindless-guys/)》中，我大量用到了有序列表。

`markdown`中关于有序列表的语法(参见[lists](http://daringfireball.net/projects/markdown/syntax#list))是:

{% highlight text %}
1.  Bird
2.  McHale
3.  Parish
{% endhighlight %}

会被转化成：

{% highlight html %}
<ol>
  <li>Birdli
  <li>McHaleli
  <li>Parishli
<ol>
{% endhighlight %}

但是当我如此写完，`redcloth`(我的`_config.yml`中配置的`markdown`引擎)却没有将他转换，而是以块的形式展现的，于是改用`maruku`，还是有这个问题，又换做`rdiscount`，也同样有问题。

无奈，我单写了个测试例子:

{% highlight text %}
  0. test
  1. test
{% endhighlight %}

发现并没有问题，于是我开始怀疑是中文编码问题，正如`jekyll`的博客的`tag`和`category`一样，必须是E文的，写了个测试，验证了我的猜测。

之后经过N次测试，我得到一个完美展现中文有序列表的方法（至少暂时是）。将`_config.yml`的markdown配置成如下，注意我的注释（英文不好，乱遍的）

{% highlight text %}
#markdown: redcloth
# this is comfusing, u can not delete above line, or ur chinese markdown list will not render normally
markdown: rdiscount
{% endhighlight %}

我这只是`hack`方法，完美解决办法请大牛们做吧。兴许这个问题只出现在我一个人身上呢……
还有好多活儿，有空再尝试其他解决办法吧……