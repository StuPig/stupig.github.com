---
layout: post
title: "后端代理——跨域的另一种方案"
description: "介绍了前端跨域的几种方案，结合实际项目问题，讨论为何最终选取了后端代理的方式"
category: tech
tags:
 - web proxy
 - php
 - JSONP
 - postMessage
 - cross domain
keywords: 跨域,前端跨域,后端代理,JSONP,跨域方案
---
###跨域的前端实现方案有很多种
 

0. 跨子域可以采用`iframe proxy`的方式，支持`GET`和`POST`，支持异步`POST`。缺点是：范围较窄，限定在“跨子域”，而且需要在目标服务器增加额外的文件。

1. JSONP的方式，支持双向通信。只支持`GET`。缺点是：不支持`POST`，同时需要目标服务器在服务端支持。<http://www.ibm.com/developerworks/cn/web/wa-aj-jsonp1/>

2. `iframe`的`window.name`的方式，支持跨主域。缺点是：不支持`POST`，不过已经很赞了：）<http://www.planabc.net/2008/09/01/window_name_transport/>

3. HTML5 postMessage，支持双向通信。缺点是：仅限于HTML5。结合`window.name`的方式，就很赞了~<http://js8.in/752.html>

4. `iframe` + `location.hash`的方式跨主域，功能强大，兼容性好，支持跨域的`js`调用,支持双向通信。缺点是：太复杂，会嵌套太多的`iframe`，同时数据直接写在`url`中，数据大小受限而且数据暴露在外。<http://jj7jj7jj.iteye.com/blog/1120231http://www.nowamagic.net/librarys/veda/detail/165>

5. 利用`Flash`跨域，优点是支持强大，相对简单。缺点是：依赖flash，需要在服务器更目录放置`crossdomain.xml`文件。 <http://www.colorhook.com/blog/?p=789>

------

###需求：

讲完了前端跨域的实现方案，再讲下我的需求：

**本地调用美团的`deal`的`API`，然后获取`deal`的列表。**


最开始，我想通过JSONP的方式去做，但是发现`API`不支持`callback`，于是，我手动在`dev`上输出时为它添加了支持：

{% highlight php %}

    echo (isset($_GET['callback']) ? $_GET('callback').'('.$jsonData.')' : $jsonData);

{% endhighlight %}

然后问题解决了。



但是，当我回到自己的蜗居，因为没有公司`VPN`，是访问不到公司内网环境的。于是新的需求出现了：

**如何在不修改服务器资源文件的情况下，获取到`deal`列表。**

 

###方案选取

我测试了下，实际上浏览器直接访问线上给手机端的`API`地址，是可以正常获取到数据。这意味着，它只是一个再普通不过的`GET`请求。
那我的方案有哪些呢？楼上的`3`和`4`（`5`我担心数据容量限制）。考虑到我要去不断操作`iframe`，我也不太想去做。

那还有吗？是的，我们可以通过后端代理的方式，将跨域的任务交给后端。

与前端不同，用proxy在服务器端协助是一种后端的跨域请求方案，可以降低前端开发的压力。



###利用后端proxy跨域请求的原理

 ![web proxy flow chart][web proxy]

 [web proxy]: /post_images/2012/08/web_proxy.gif
    "后端代理流程图"

_图片来自`Yahoo`_

###优势

前端开发人员只要简单地对网址进行`encode`、拼装就能实现跨域请求，相对其他前端手段，开发难度大大降低。


###代码

跨域时，前端浏览器向同一域名下的`proxy`发出请求，要求获取其它域名下的数据（这个请求不跨域），后端再据此对指定地址发出跨域请求（后端`curl`不受跨域限制），收到响应后后端把响应体重新包装、返回给前端。

整个过程中，前端误以为这是同一域下的结果，也就不会出现限制访问

 
前端请求本地的`webservice/deals.php`，这里的`deals.php`实际上只是一个代理（`deals.php`可以再改进成通用的`proxy`）。

_client page:_

{% highlight html %}

<!DOCTYPE HTML>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>backbone</title>
    <link rel="stylesheet" href="css/reset.css" />
</head>
<body>
    <script src="js/lib/zepto.js"></script>
    <script src="js/lib/datastorage.js"></script>
    <script src="js/lib/underscore.js"></script>
    <script src="js/lib/backbone.js"></script>
    <script>
      // ROOT_URL = 'http://www.gsqmt.dev.sankuai.com/api/v4/dealasync';
      var ROOT_URL = '/backbone/webservice/deals.php';
 
      Backbone.emulateHTTP = true;
      Backbone.emulateJSON = true;
 
      var Deals = Backbone.Collection.extend({
        model: Deal
        , url: ROOT_URL
        , parse: function(res) {
          return res.new;
        }
      });
 
      var deals = new Deals();
      deals.fetch({
        dataType: 'json'
        , type: 'GET'
        , url: ROOT_URL
        , data: {
          ws_path: '/path/to/service'
          , division: '北京'
          , cate: '1,2,3,4,5'
          , limit: 5
          , group: 1
        }
        , success: function(collection, res) {
          // console.log(collection, res)
          // deals.add(res.new);
        }
      });
    </script>
</body>
</html>

{% endhighlight %}

_server proxy:_

{% highlight php %}

<?php
/*
 * PHP Proxy example
 * Responds to both HTTP GET and POST requests
 */
 
// 要访问的URL_ROOT
define ('HOSTNAME', 'http://www.meituan.com');
 
// 设置`REST`请求的路径
// `POST`还是`GET`请求？
$path = isset($_POST['ws_path']) ? $_POST['ws_path'] : $_GET['ws_path'];
$url = HOSTNAME.$path.'?';
 
// `GET`请求的拼接上`queryString`
if (isset($_GET['ws_path'])) {
    while ($element = current($_GET)) {
        if (key($_GET) !== 'ws_path') {
            $url .= urlencode(key($_GET)).'='.urlencode($element).'&';
        }
        next($_GET);
    }
}
 
// 创建一个`curl`的`session`
$session = curl_init($url);
 
// 如果是`POST`，将请求数据，放进请求的`body`中
if (isset($_POST['ws_path'])) {
    $postvars = '';
    while ($element = current($_POST)) {
        $postvars .= urlencode(key($_POST)).'='.urlencode($element).'&';
        next($_POST);
    }
    curl_setopt ($session, CURLOPT_POST, true);
    curl_setopt ($session, CURLOPT_POSTFIELDS, $postvars);
}
 
// 不添加`HTTP`请求头，只有请求内容
curl_setopt($session, CURLOPT_HEADER, false);
curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
 
 
// 发出请求
$json = curl_exec($session);
 
// 根据`web service`返回的数据类型，设置响应的`Content-Type`
header("Content-Type: application/json");
 
 
echo $json;
curl_close($session);
?>

{% endhighlight %}

----

### 参考文档

JavaScript: Use a Web Proxy for Cross-Domain XMLHttpRequest Calls：<http://developer.yahoo.com/javascript/howto-proxy.html>
