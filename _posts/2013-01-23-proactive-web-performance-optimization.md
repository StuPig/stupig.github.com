---
layout: post
title: "PWPO-前瞻性Web性能优化"
description: "proactive web performance optimization, 前瞻性Web性能优化"
category: tech
tags: 
- performance
- YSlow
- NodeJS
- phantom
- WebPagetest
- Jekins
- CI
- WPO
keywords:
- 性能优化
- 性能衰退
- 性能检测
- WPO
- WebPagetest
- 持续改进
---
_原文地址是：[http://calendar.perfplanet.com/2012/proactive-web-performance-optimization](http://calendar.perfplanet.com/2012/proactive-web-performance-optimization)

_文章作者[`Marcel Duran`](http://twitter.com/marcelduran)，也是YSlow的作者，twitter前端工程师，之前是Yahoo性能团队leader_

_简单意译了一下，看官勿喷。同时，期望能够在未来i版上使用此方式_


**PWPO**——Proactive Web Performance Optimization，姑且翻译作前瞻性Web性能优化。

开发者对于Web性能必须时刻保持警惕，尤其是在发布新版本迭代新功能时，bug修复或者其他乱七八糟，看似八竿子打不着的事情，都可能会影响到性能，破坏终端用户的体验。

正因此，必须牢记并在每一次的开发和提交中践行Web性能优化的最佳实践。而恰当的在开发中使用工具，可以帮助我们找到潜在的性能问题，

###最坏的情景：没有性能检测手段

在开发周期中，没有经过性能检测的代码，天知道面对终端用户时是什么情况。更糟的是，不论好与坏，我们都是没法度量，也没有线索去改进的。如果我们引入如下性能衰退图的话，终端用户就是那个无法忍受糟糕用户体验而发起红色警报的。幸运的话我们可以根据一些忠实的用户反馈，迫使开发者去解决这个问题。当然解决问题的时间可能会持续很久，直到没有人关心，然后用户忍无可忍的放弃掉应用。类似下图：

![最坏的情景：没有性能检测手段](/post_images/2013/01/worstCase.jpg)

- 开发和构建应用
- 测试确保无碍
- 发布应用
- 用户或喜或气（弃）
- 愤怒的用户做出反馈
- 根据反馈，改进

###好一些的情况：RUM
利用真实用户监测（[Real User Measurement](http://en.wikipedia.org/wiki/Real_user_monitoring), aka RUM），为应用程序提供数据。收集包括如带宽，页面加载时间等数据，进行监测和估计最终用户的体验是什么样的。在性能衰退图下，跟据`RUM`，可以获得性能问题。即使这样，仍然给了最终用户一个痛苦不愉快的经历。被动的等待问题发现，然后修复，并在下个迭代中发布——这是很多网站目前使用的方式。

![好一些的情况：RUM](/post_images/2013/01/betterCase.jpg)

- 开发和构建应用
- 测试确保无碍
- 发布应用
- 用户或喜或气（弃）
- `RUM`结果不理想
- 改进

###YSlow

[YSlow](http://yslow.org/)一开始是只能通过手动执行，基于一组性能检测规则对页面的进行静态分析，报告检测出的问题。后来开始在真实浏览器中安装YSlow做自动化尝试。

2011后，新的YSlow可以在命令行下利用NodeJS执行。对`HAR`(HTTP Archieve)文件进行静态分析的。2012年年初，YSlow也可以结合[PhantomJS](http://phantomjs.org/) （命令行下没有界面的WebKit浏览器）[工作](https://github.com/marcelduran/yslow/wiki/PhantomJS)，为一个的URL通过命令行进行分析，并给出结果。 YSlow还专门为PhantomJS还提供了两种新的输出格式：[TAP](http://en.wikipedia.org/wiki/Test_Anything_Protocol)和[JUnit](http://en.wikipedia.org/wiki/Junit) 。这两种技术都可以配置设定通过与否的阈值。

###更好的方式：RUM + YSlow on CI
基于YSlow为PhantomJS的定制，可以很容易将其整合到持续集成系统中（continous integration, aka CI） 。如果有一个出现性能衰退，就会打破了构建过程，从而避免了潜在的性能问题发布在生产环境中。有效避免最终用户产生很坏的体验。

[YSlow的wiki](https://github.com/marcelduran/yslow/wiki)中有解释[如何将YSlow和Phantom集成到Jenkins](https://github.com/marcelduran/yslow/wiki/PhantomJS#wiki-jenkins-integration)的文章。值得一提的是`--threshold`参数，会作为最终的性能验收标准的最终配置。

![更好的方式：RUM + YSlow on CI](/post_images/2013/01/evenBetterCase.jpg)

- 开发和构建应用
- 测试确保无碍
- 分析YSlow通过与否
- _失败，则重新开发修复_
- 通过则发布应用
- 希望用户都ok
- 持续进行`RUM`
- 性能改进

###最好的方式：RUM + YSlow on CI + WPT

如果是在开发过程中就一直践行着Web性能最佳实践的应用，YSlow的得分就会稳定在A或B中而失去意义。此时的YSlow已经不再能够预警微小的新能衰退了。

此时的YSlow得分，看似令人满意，但并不意味着它的得分就是真实浏览器环境下最终用户体验的得分。所以，接下来的优化将着眼于真实浏览器中的用户体验。通过多次取样真实浏览器下的体验值，然后与上线的性能阈值去比对，来最终确认是否上线。

用[WebPagetest](http://www.webpagetest.org/)来自动化真实浏览器下的性能测试，是个不错的选择，因为他有[可供`NodeJS`调用的API](http://marcelduran.com/webpagetest-api/)（可参考该文章[xmas-gift-webpagetest-api-swiss-army-knife](http://calendar.perfplanet.com/2012/xmas-gift-webpagetest-api-swiss-army-knife/)）。

![最好的方式：RUM + YSlow on CI + WPT](/post_images/2013/01/bestCase.jpg)

- 开发和构建应用
- 测试确保无碍
- 分析YSlow通过与否
- _失败，则重新开发修复_
- YSlow通过，则利用WPT做性能测试，并与当前生产环境的性能比对
- _失败，则重新来过_
- 如果上两层测试都通过，则部署
- 期待获得更多用户的满意
- 持续进行`RUM`
- 总是有可供性能提升的地方

在对新版本（分支）或分支进行WPT测试时，理想情况是有一个单独的与生产环境一样的沙箱，从而让WPT的结果尽可能的与生成环境下最终用户的体检结果一致。

###结语
尽可能主动出击，防微杜渐，将Web性能的最佳实践及检测通过YSlow等方式加入到`CI`中，将性能衰退扼杀在摇篮里，给最终用户创造更好的体验。

####附注
[Proactive Web Performance Optimization ](http://www.slideshare.net/marcelduran/velocity-china-2012-pwpo)
