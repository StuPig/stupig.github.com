---
layout: post
title: "icon转webfont"
description: "CSS3 @font-face"
category: tech
tags:
 - CSS3
 - font-face
 - icon
 - CSS scprite
keywords:
 - CSS3
 - webfont
 - 雪碧图
 - icon
 - Fontgrapher

---

###神马是webfonts？神马是@font-face？

---

**`webfonts`**指拥有相关版权的在线字体库，供web设计师和开发者使用的在线字体，同样拥有普通文字的优秀特性，动态调整换行，搜索引擎友好，可用性高（针对特殊人群、和触摸设备等）。简而言之，他不仅拥有普通字体的特性，同时，支持按需下载。

@font-face 是一条CSS规则，允许用户在没有安装制定字体的前提下，到指定webfonts服务上获取相关字体，来渲染页面。这意味着，互联网的页面将从此不再拘束于某些“安全”字体，而变得绚丽多彩。


###如何使用webfonts（@font-face）？

---

使用@font-face是非常简单的：
{% highlight css %}
@font-face {
    font-family: DeliciousRoman;
    src: url(http://www.font-face.com/fonts/delicious/Delicious-Roman.otf);
    font-weight: normal;
}
{% endhighlight %}

其中，"font-family"制定要使用的字体的名称，“src”：指定字体下载路径（如果考虑到浏览器兼容情况话，src中要写指明多个url，和相应的format），“font-weight”并非必需，但是通常会制定，用作全局配置。

在具体使用的地方，一如过往：
{% highlight css %}
p {
    font-family: DeliciousRoman, Arial, sans-serif;
}
{% endhighlight %}

其实，@增哥在他的“团购地图”中就有使用webfont作icon，详情请移步：[http://panweizeng.com/map/](http://panweizeng.com/map/)


###icon和webfont神马关系？

---

icon 和 webfont 似乎根本联系不起来啊。

页面中经常会用到各种icon，而icon的增加，就会带来很多问题：

- 为了减少流量，我们不得不对图片进行压缩
- 为了减少请求次数，又不得不将众多icon做成“雪碧图”，然后在CSS中去人肉调整相关的backgroud-position
- 雪碧图的一个坏处是，每次有icon的添加和更新或者修改都需要重新做，而重新做出来的“雪碧图”，有可能已经改变了原有的icon所在的位置，而要求开发者更新相应的CSS样式。

但这些，尽管麻烦，但是icon还是可以解决的，那下面的需求呢？

- icon是尺寸是不固定的（需要适配屏幕的，尽可能的向响应式网站靠近）
- icon是需要改变颜色的
- icon是有些阴影效果的

那因为有了webfont的优势，设想下如果将icon做成font的话，似乎上述问题都迎刃而解。


###如何将icon转为font？

---

目前我们用到的icon大多是通过Illustrator做的矢量图，那最关键的就是将设计稿中的矢量图icon完美还原成字体，这并不是很麻烦。我们可以用到一些字体编辑软件，比如FontLab，Fontograhper，Fontforge，inkscape等。这里以 Fontgrapher为例。

- 首先，设计师设计出图标的矢量图（建议都转为.ai的图像），在illustrator中打开：

  ![ai](/post_images/2012/11/ai.jpeg)

- 打开Fontgrapher，并新建一个空白字体（或者打开一个已有字体）：

  ![fontgrapher](/post_images/2012/11/fontgrapher.jpeg)

- 双击想要变成图标的字符（这里比方a，如果a已有字体，则选中原有字体并删除）:

  ![edit](/post_images/2012/11/edit.jpeg)

- 在illustrator中选中，a所代表的icon，复制，粘贴到上一步打开的a的字体栏中:

  ![edit](/post_images/2012/11/edit.jpeg)

- 按CMD+S保存，并重复上两步编辑剩余字体和icon：

  ![save](/post_images/2012/11/doubleclick.jpeg)

- 设置字体信息：

  ![fontinfo](/post_images/2012/11/fontinfo.jpeg)

- 将当前字体文件导出：

  ![export](/post_images/2012/11/export.jpeg)

- 生成.ttf字体文件：

  ![generate](/post_images/2012/11/generate.jpeg)

- 调用shell命令生成多个字体文件(.eot .svg .woff)以兼容全平台：

  ![shell](/post_images/2012/11/shell.jpeg)

- 书写HTML与CSS，收工！（demo在此，请猛击~）欢迎感兴趣的童鞋们测试各个浏览器，并反馈内容，下周我自己也会跟进进行全浏览器测试


###各浏览器截图

---

####chrome:

  ![chrome](/post_images/2012/11/chrome.jpeg)

safari:

  ![safari](/post_images/2012/11/safari.jpeg)

Firefox:

  ![firefox](/post_images/2012/11/firefox.jpeg)

IE6:

  ![IE6](/post_images/2012/11/IE6.jpeg)

IE7:

  ![IE7](/post_images/2012/11/IE7.jpeg)

IE8:

  ![IE8](/post_images/2012/11/IE8.jpeg)

android2.1（不支持）:

  ![android2.1](/post_images/2012/11/android.jpg)

iOS6:

  ![iOS6](/post_images/2012/11/iOS.png)


###Web从此绚丽？

---

IE6-8支持不完全（只支持.eot字体），Firefox15.0后开始支持，Chrome在22.0以后支持，Opera在12.0后开始支持，android2.1不支持，其他版本及iOS支持都很不错。

从上面的截图也验证了以上的结论。

**Web从此绚丽不至于，但是优点却是显而易见的：**

- 所有可以设置在文字上的CSS属性都可以设置在icon font上，比如color、font-size、text-shadow等
- 由于是网页读取矢量字体，无论放大到多少倍都比较清晰，不会像jpg/png图片那样模糊
- 不用为IE6单独点实一个png8，而为其他浏览器提供带alpha的png。比较方便。
- 一定程度上缓解了“雪碧图”和测量图标位置的繁琐


###参考资料:

---

####参考网站：
[http://www.font-face.com/](http://www.font-face.com/)  | Google宣传@font-face及webfont的网站

[http://www.webfonts.info/](http://www.webfonts.info/)  |  webfont收集及宣传的网站

[http://paulirish.com/2009/bulletproof-font-face-implementation-syntax/](http://paulirish.com/2009/bulletproof-font-face-implementation-syntax/)  |  Bulletproof @font-face syntax

[http://www.qianduan.net/css3-icon-font-guide.html](http://www.qianduan.net/css3-icon-font-guide.html)   |  CSS3 icon font完全指南

[http://yuguo.us/weblog/font-face-in-action/](http://yuguo.us/weblog/font-face-in-action/)  |   @font-face实战

[http://www.webdesignerdepot.com/2012/01/how-to-make-your-own-icon-webfont/](http://www.webdesignerdepot.com/2012/01/how-to-make-your-own-icon-webfont/)  |   How to make your own icon webfont


####commandline 字体转换脚本（很赞!）

Converting @font-face Fonts Quickly In Any OS

[http://www.useragentman.com/blog/2011/02/20/converting-font-face-fonts-quickly-in-any-os/](http://www.useragentman.com/blog/2011/02/20/converting-font-face-fonts-quickly-in-any-os/
)

[https://github.com/zoltan-dulac/css3FontConverter](https://github.com/zoltan-dulac/css3FontConverter
)

####mac 下字体编辑工具:

**汇总：**

[http://www.pure-mac.com/font.html](http://www.pure-mac.com/font.html
)

**简介：**

**fontforge**

[http://fontforge.org/editexample.html](http://fontforge.org/editexample.html)

fontforge 是一个字体外观编辑器，可以利用它创建自己的 .PS(Adobe Postscript Font). .ttf(truetype Font) .otf(open type Font) cid-keyed, multi-master, cff, svg 和 bitmap 字体，或者编辑已有字体文件。同时允许你在几个字体见进行转换。 Fontforge 同时支持多款 macintosh 的字体文件格式。

Fontforge 的用户界面已经为多个语言进行本地化，其中包括繁体中文。支持多平台。

brew install fontforge

fontforge 要求你用在他的软件内去利用bezier曲线去绘制图标，界面十分 ugly，估计设计师可能不会喜欢

**inkscape**

[http://inkscape.org/](http://inkscape.org/)

一款开源图形编辑器，兼容 Illustrator, CorelDraw, Xara X, 生成W3C标准的SVG图像。

类似PS，拥有强大功能，和完整的说明文档的现代图形绘制工具。但不清楚，是否与PS相互兼容。

有详细中文繁体文档：http://inkscape.org/doc/index.php?lang=en

利用inkscape制作字体 svg: http://www.webdesignerdepot.com/2012/01/how-to-make-your-own-icon-webfont/

**fontstruct**

免费在线的字体绘制工具

免费在线字体转换工具：
[http://www.freefontconverter.com/](http://www.freefontconverter.com/)

[http://www.font2web.com/](http://www.font2web.com/)

支持： .ttf (TrueType Font) or .otf (OpenType Font) file to .ttf, .otf, .eot, .woff and .svg files.

[http://onlinefontconverter.com/](http://onlinefontconverter.com/)

免费在线字体转换工具，功能包括：提取 pdf 里的字体文件; 支持绝大多数字体
