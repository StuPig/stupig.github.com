---
layout: post
title: "Web服务器反向代理——跨域的另一种方案"
description: "利用Nginx或者Apache等Web服务器的反向代理功能，解决前端Ajax请求跨域问题"
category: tech
tags:
 - Nginx
 - Reverse Proxy
 - Apache
 - Ajax
 - cross domain
keywords: 反向代理, Nginx代理, Ajax跨域
---
####前情回顾####
之前在上一篇”[后端代理——跨域的另一种方案](http://stupig.me/blog/2012/08/20/web-proxy-for-cross-domain-xmlhttprequest-calls/)“一文中简单介绍了下前端跨域的几种实现方案，并详细介绍了“后端代理”的方式，协助前端跨域的方案。

真实的环境中更多的不是非0即1的二进制，而是适合与更适合。尤其是在做方案选取的时候，各种方案各有优劣，更多是去根据自己的场景选取一个最适合自己的。重新回到前端跨域问题，我在后端代理——跨域的另一种方案中也对各种方案做了简单的总结。欢迎大家拍砖。

----
####需求
最近在`Hybrid App`项目的开发过程中，数据需要跟“移动后台API'”同学获取，因为我俩都是本地开发，本地起Web服务，因此，我在请求他（http://192.168.60.31:8602/api/v3/deal/search/substore/129180）的时候就果断碰到了跨域问题。

####方案选取
因为目前业务功能涉及到的还只是`GET`请求，所以我首先想到通过`JSONP`的方式解决。但是很快遭到了后台同学的拒绝，因为这不是改动大或小、简不简单的问题，而是这种任务就不应该又后台同学来做。

这回污染了后端`API`的代码。因为不能污染后台的代码，我似乎只有一条选择，便是之前提到的`后端代理`的方式，但是想到以后只要涉及到`移动后台API`的开发，我就要一直维护这份`代理`的代码，我也挺头疼。

想到既然可以通过后端代理，那样似乎代表着可以利用比后端更底层，与前端`HTTP`请求更亲近的Web服务器去做反向代理，来实现跨域？简单查了下资料，发现网上早有先例。
 

####反向代理
“反向代理（Reverse Proxy）是指以代理服务器来接受`Internet`上的连接请求，然后将请求转发给内部网络上的服务器，并将从服务器上得到的结果返回给`Internet`请求连接的客户端，此时，代理服务器对外就表现为一个服务器。”——《实战Nginx》
 

####正向代理
既然有反向代理，就肯定有正向代理。什么叫正向代理呢？

正向代理（Forward Proxy），通常都被简称为代理，就是在用户无法正常访问外部资源，比方说受到GFW的影响无法访问twitter的时候，我们可以通过代理的方式，让用户绕过防火墙，从而连接到目标网络或者服务。

####反向代理VS正向代理
<img title="反向代理VS正向代理" alt="反向代理VS正想代理" src="/post_images/2012/08/Forward-Proxy-vs-Reverse-Proxy.jpeg" width="600"  />

####反向代理的优势
0. 请求的统一控制，包括设置权限、过滤规则等
1. 区分动态和静态可缓存内容
2. 隐藏内部服务真实地址，暴露在外的只是反向代理服务器地址
3. 实现负载均衡，内部可以采用多台服务器来组成服务器集群，外部还是可以采用一个地址访问
4. 解决Ajax跨域问题
5. 作为真实服务器的缓冲，解决瞬间负载量大的问题

####反向代理服务器的配置
此处以`Nginx`和`Apache`为例，`Lighttpd`等`Web`服务器同样支持。

**Nginx**
{% highlight Nginx config files %}
 
# 反向代理到志伟机器
location /api {
    proxy_pass "http://192.168.60.31:8602";
    proxy_set_header Host "192.168.60.31:8602";
    proxy_set_header X-Forwarded-For $remote_addr;
}

{% endhighlight %}
`proxy_set_header`是向反向代理的后端`Web`服务器请求时，添加制定的header头信息。当请求的后端`Web`服务器有多个基于域名的虚拟主机时，要通过添加指定的`Host`来区分。

在请求和响应头中添加`X-Forwarded-For`原始请求的地址，因为使用了反向代理之后，后端`Web`服务器（以PHP为例）就不能通过`$_SERVER["REMOTE_ADDR"]`变量来获取用户真实的`IP`了。

此时`$_SERVER["REMOTE_ADDR"]`指向的是反向代理的`Nginx`服务器`IP`，通过`$_SERVER["X-Forwarded-For"]`来获取

**Apache**
{% highlight Apache config files %}
 
<Proxy *>
Order deny,allow
Allow from all
</Proxy>
ProxyPass /api http://192.168.60.31:8602
ProxyPassReverse /api http://192.168.60.31:8602

{% endhighlight %}
ProxyPass和ProxyPassReverse指令都是反向代理需要的配置。

 ProxyPass用于将一个远程服务器映射到本地服务器的URL空间中。

而ProxyPassReverse主要解决后端服务器重定向造成的绕过反向代理的问题，在后端服务器会进行服务器端跳转时使用，对HTTP重定向时回应中的Location、Content-Location和URI头里的URL进行调整。

**参考资料**

[用Nginx和Apache的反向代理解决Ajax的跨域问题](http://blog.csdn.net/hfahe/article/details/5721320)

[《实战Nginx》](http://book.douban.com/subject/4251875/)

[《Nginx中文维基》](http://wiki.nginx.org/Chs)

[Proxy vs Reverse-proxy](http://www.celinio.net/techblog/?p=1027)

[关于反向代理](http://blog.csdn.net/luochuan/article/details/7217837)
