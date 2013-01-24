---
layout: post
title: "如何把mobile page打开时间控制在1s内"
description: "如何把mobile page打开时间控制在1s内，make your mobile pages render in under one second"
category: tech
tags:
 - performance
 - mobile performance
 - RTT
 - mobile web page
 - render tree
keywords:
 - 性能
 - 移动网络
 - 浏览器工作原理
 - DNS解析
---

_意译自[Make your mobile pages render in under one second](http://calendar.perfplanet.com/2012/make-your-mobile-pages-render-in-under-one-second/)，作者是[Bryan McQuade](http://bryanmcquade.com/blog/)([@bryanmcquade](http://twitter.com/bryanmcquade))_

尽管过去的数年间，我们在`mobile web`性能优化上取得了长足的进步，但是`mobile web`仍然慢的惊人。`Google Analytics`的数据显示，`mobile web page`的平均打开时间仍然在10s内（[10 seconds to load on mobile](http://analytics.blogspot.com/2012/04/global-site-speed-overview-how-fast-are.html)）。我们了解到，用户的思维进程通常会在被中断后持续1s，结果来自（[user starting to become disengaged](http://www.useit.com/papers/responsetime.html)）。我们要做的是把网页打开的时间控制在1s内。显然，我们的差距还很大，有很多事情要做。

但是我们在优化`mobile web page`时应该着眼于哪里？众所周知，移动网络的延迟非常之高（[mobile network latency is substantially higher](http://calendar.perfplanet.com/2011/carrier-networks-down-the-rabbit-hole/)）。包在网络中的往返时间（译者注：`Round Trip Time`，简称`RTT`，它是一个小分组从客户主机游动到服务器主机再返回客户主机所花的时间），是页面加载时间的主导因素。鉴于此，优化的重点在最小化包在网络中的往返次数。

###是什么阻碍了web page在设备上的渲染？

首先，让我们来看看在用户启动时，从页面导航和浏览器在屏幕上渲染完该页面，之间发生的事件序列。可能会产生往返的`DNS`解析，`TCP`请求、等待、服务器响应，以及响应流被传回。不幸的是，开发者并能在这里做什么文章（译者注：我们可以尽可能的去减少不必要的`redirect`，从而减少往返的`DNS`解析等时间；同时可以去`DNS prefetching`，预解析`DNS`）。对于重复请求的用户，加大`DNS TTL`（`DNS Time To Live`：DNS生存周期），可以在一定程度上缓解。但是`TCP`的每次`request/response`的开销却会增加新的页面导航，前提是服务器不支持持久性连接的`HTTP`的`RTT`（译者注：因此采用`HTTP/1.1`的带流水线的持久连接也能在一定程度上见效`RTT`[持久性连接http的rtt](http://blog.sina.com.cn/s/blog_4da7712001000ajk.html)）（原文：For repeat visitors, a longer DNS TTL can help, but TCP connection and request/response overhead will be incurred on every new navigation to a page (assuming there is no warm TCP connection ready to be reused by the client).）。

当这些初始请求返回时，设备就可以解析`HTML response`了。但是浏览器并不能立即将这些内容展示到屏幕上。在将`HTML`的渲染树（译者注：`Render Tree`，由一些包含有颜色和大小等属性的矩形组成，它们将被按照正确的顺序显示到屏幕上。[How Browsers Works?](http://taligarsiel.com/Projects/howbrowserswork1.htm)）展示到屏幕之前，浏览器需要先构建`DOM`树，从而确定这些元素出现在屏幕上的位置。`DOM`树的生成，是通过构造解析`HTML`和执行可能的`JavaScript`。

那到底是什么阻碍了`HTML`的解析？通常，生成`DOM`树和构建渲染树是很快的（译者注：当然，即使慢，我们也没什么办法——除了缩减`HTML`的层次——写出简单优雅的`HTML`代码）。然而，也有一些反模式，可能会导致这些进程被阻塞。

###渲染过程中的延迟：外部JavaScript和CSS

最重要的来源是外部的`JavaScript`的`HTML`解析过程中的延迟。当浏览器遇到（非异步）外部的脚本的`HTML`解析的过程中，它必须停止解析，直到您的`JavaScript`下载，解析，并执行后续的HTML 。这将带来额外的`RTT`，这种时间是对手机用户浪费不起的。如果加载的脚本从一个主机以外的主机名的`HTML`送达，可能会产生额外的往返`DNS`解析和`TCP`连接。

此外，正如外链的`JavaScript`会阻碍`DOM`树的构建一样，外链的样式表同样会阻碍渲染树的构建。

简而言之，早期加载（即`</head>`标签前的）的外链的`JavaScript`和`CSS`是`mobile web`的性能杀手。

###加速mobile page

更快的`mobile page`，就要在渲染`HTML`的有效内容之前，就绪所有必须内容，而且确保没有外链的`Javascript`和`CSS`资源。在理想的情况下，所有所需要的呈现有效内容的资源大小应该是响应中的第一15KB（这是用`gzip`压缩后的大小;预`gzip`的可以是较大的），15KB是现代`Linux`内核的初始拥塞窗口的大小。这并不意味着简单的内联所有使用外部加载`JavaScript`和`CSS` 。相反，仅将跟有效内容相关的`CSS`和`JavaScript`内联。比方说：

{% highlight javascript %}
<html>
<head>
  <link rel="stylesheet" href="my.css">
  <script src="my.js"></script>
</head>
<body>
  <div class="main">
    Here is my content.
  </div>
  <div class="leftnav">
    Perhaps there is a left nav bar here.
  </div>
  ...
</body>
</html>
{% endhighlight %}

我们需要找出`my.js`与`my.css`中影响有效显示内容的部分，改成inline，然后`delay`或`async`加载剩余的`JavaScript`和`CSS`：

{% highlight javascript %}
<html>
<head>
  <style>
  .main { ... }
  .leftnav { ... }
  /* ... any other styles needed for the initial render here ... */
  </style>
  <script>
  // Any script needed for initial render here.
  // Ideally, there should be no JS needed for the initial render
  </script>
</head>
<body>
  <div class="main">
    Here is my content.
  </div>
  <div class="leftnav">
    Perhaps there is a left nav bar here.
  </div>
  ...
  <!-- 
    NOTE: delay loading of script and stylesheet may best be done
     in an asynchronous callback such as `requestAnimationFrame` 
     rather than inline in HTML, since the callback will be invoked 
     after the browser has rendered the earlier HTML content to the screen.
   -->
  <link rel="stylesheet" href="my_leftover.css">
  <script src="my_leftover.js"></script>
</body>
</html>
{% endhighlight %}
###还有什么会阻止渲染

一个来源是主要的HTML文件的HTTP重定向。这些重定向会带来额外的`RTT`，如果重定向导航到不同的主机名（例如`www.example.com`的`m.example.com`） ，添加更多的DNS解析和TCP连接的时间延误。延迟的第二个来源是服务器后台生成HTML响应花费的时间。所以尽可能提高后端服务器的处理速度。

###1s搞定渲染的可能性

如果我们估计3G网络往返时间为250毫秒，我们可以计算出从用户发起的Web页面导航和页面呈现的最小时间。假设没有阻止渲染的外链的`JavaScript`和`CSS` ，我们需要承担3次`RTT`——DNS ，TCP，和请求/响应，共750ms ，加上100ms为后端的时间。这给我们带来了850ms 。如果只需要渲染内联的JavaScript和CSS，以及最初的HTML（控制在gzip压缩后15KB ），解析和渲染所需的时间应该是远低于100ms，从而真正的控制在1s内。

###总结

保证3G下1s内展现页面，需要：

- 后端保证在100ms内生词最小的HTML
- 避免主要HTML资源的重定向
- 避免在初始渲染时外链的JavaScript和CSS
- 只内联确实跟主要内容区显示相关的JavaScript和CSS
- delay或async非初始渲染需要的JavaScript和CSS
- 保证HTML的初始渲染时的有效载荷控制在gzip后的15KB

